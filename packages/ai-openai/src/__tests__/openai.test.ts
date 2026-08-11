import { describe, expect, it, vi } from 'vitest'
import { openaiComplete } from '../index'

const req = { prompt: 'improve', selection: '', documentText: 'doc text' }
const signal = () => new AbortController().signal

/** Builds a Response whose body streams the given SSE frames. */
function sseResponse(frames: string[], init: ResponseInit = {}) {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder()
      for (const frame of frames) controller.enqueue(encoder.encode(frame))
      controller.close()
    },
  })
  return new Response(stream, { status: 200, ...init })
}

/** Typed so `mock.calls` keeps fetch's real argument types. */
function mockFetch(response: () => Response) {
  return vi.fn<typeof globalThis.fetch>(() => Promise.resolve(response()))
}

function chunk(content: string) {
  return `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`
}

async function collect(iter: AsyncIterable<string>): Promise<string[]> {
  const out: string[] = []
  for await (const part of iter) out.push(part)
  return out
}

function callArgs(fetchImpl: ReturnType<typeof mockFetch>) {
  const call = fetchImpl.mock.calls[0]
  if (!call) throw new Error('fetch was not called')
  const [url, init] = call
  return { url, init: init ?? {}, headers: (init?.headers ?? {}) as Record<string, string> }
}

describe('openaiComplete', () => {
  it('yields text deltas and stops at [DONE]', async () => {
    const fetchImpl = mockFetch(() =>
      sseResponse([chunk('Hello'), chunk(' world'), 'data: [DONE]\n\n', chunk(' ignored')]),
    )
    const complete = openaiComplete({ endpoint: '/api/ai', fetch: fetchImpl })

    expect(await collect(complete(req, { signal: signal() }))).toEqual(['Hello', ' world'])
  })

  it('reassembles frames split across network chunks', async () => {
    const full = chunk('split me')
    const fetchImpl = mockFetch(() =>
      sseResponse([full.slice(0, 12), full.slice(12), 'data: [DONE]\n\n']),
    )
    const complete = openaiComplete({ endpoint: '/api/ai', fetch: fetchImpl })

    expect(await collect(complete(req, { signal: signal() }))).toEqual(['split me'])
  })

  it('skips keep-alives and non-JSON frames', async () => {
    const fetchImpl = mockFetch(() =>
      sseResponse([': ping\n\n', 'data: not json\n\n', chunk('ok'), 'data: [DONE]\n\n']),
    )
    const complete = openaiComplete({ endpoint: '/api/ai', fetch: fetchImpl })

    expect(await collect(complete(req, { signal: signal() }))).toEqual(['ok'])
  })

  it('throws with the response body on a non-2xx', async () => {
    const fetchImpl = mockFetch(
      () => new Response('bad key', { status: 401, statusText: 'Unauthorized' }),
    )
    const complete = openaiComplete({ endpoint: '/api/ai', fetch: fetchImpl })

    await expect(collect(complete(req, { signal: signal() }))).rejects.toThrow(/401.*bad key/)
  })

  it('sends no Authorization header when proxying through an endpoint', async () => {
    const fetchImpl = mockFetch(() => sseResponse(['data: [DONE]\n\n']))
    await collect(openaiComplete({ endpoint: '/api/ai', fetch: fetchImpl })(req, { signal: signal() }))

    const { url, headers } = callArgs(fetchImpl)
    expect(url).toBe('/api/ai')
    expect(headers['authorization']).toBeUndefined()
  })

  it('calls OpenAI directly with a bearer token in browser-key mode', async () => {
    const fetchImpl = mockFetch(() => sseResponse(['data: [DONE]\n\n']))
    await collect(
      openaiComplete({ dangerouslyBrowserApiKey: 'sk-test', fetch: fetchImpl })(req, {
        signal: signal(),
      }),
    )

    const { url, init, headers } = callArgs(fetchImpl)
    expect(url).toBe('https://api.openai.com/v1/chat/completions')
    expect(headers['authorization']).toBe('Bearer sk-test')
    expect(JSON.parse(init.body as string)).toMatchObject({ stream: true, model: 'gpt-4o' })
  })

  it('forwards the abort signal to fetch', async () => {
    const fetchImpl = mockFetch(() => sseResponse(['data: [DONE]\n\n']))
    const controller = new AbortController()
    await collect(
      openaiComplete({ endpoint: '/api/ai', fetch: fetchImpl })(req, { signal: controller.signal }),
    )

    expect(callArgs(fetchImpl).init.signal).toBe(controller.signal)
  })

  it('puts the selection in the prompt when rewriting', async () => {
    const fetchImpl = mockFetch(() => sseResponse(['data: [DONE]\n\n']))
    await collect(
      openaiComplete({ endpoint: '/api/ai', fetch: fetchImpl })(
        { prompt: 'make it shorter', selection: 'the selected sentence', documentText: 'whole doc' },
        { signal: signal() },
      ),
    )

    const body = JSON.parse(callArgs(fetchImpl).init.body as string) as {
      messages: { content: string }[]
    }
    expect(body.messages[1]!.content).toContain('make it shorter')
    expect(body.messages[1]!.content).toContain('the selected sentence')
  })

  it('refuses ambiguous or missing configuration', () => {
    expect(() => openaiComplete({})).toThrow(/endpoint/)
    expect(() => openaiComplete({ endpoint: '/api/ai', dangerouslyBrowserApiKey: 'sk-test' })).toThrow(
      /not both/,
    )
  })
})
