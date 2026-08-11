import { describe, expect, it, vi } from 'vitest'
import { anthropicComplete } from '../index'

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

/** One SSE frame in Anthropic's `event:` + `data:` shape. */
function frame(type: string, payload: Record<string, unknown> = {}) {
  return `event: ${type}\ndata: ${JSON.stringify({ type, ...payload })}\n\n`
}

function textDelta(text: string) {
  return frame('content_block_delta', { index: 0, delta: { type: 'text_delta', text } })
}

const STOP = frame('message_stop')

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

describe('anthropicComplete', () => {
  it('yields text deltas and stops at message_stop', async () => {
    const fetchImpl = mockFetch(() =>
      sseResponse([textDelta('Hello'), textDelta(' world'), STOP, textDelta(' ignored')]),
    )
    const complete = anthropicComplete({ endpoint: '/api/ai', fetch: fetchImpl })

    expect(await collect(complete(req, { signal: signal() }))).toEqual(['Hello', ' world'])
  })

  it('reassembles frames split across network chunks', async () => {
    const full = textDelta('split me')
    const fetchImpl = mockFetch(() => sseResponse([full.slice(0, 20), full.slice(20), STOP]))
    const complete = anthropicComplete({ endpoint: '/api/ai', fetch: fetchImpl })

    expect(await collect(complete(req, { signal: signal() }))).toEqual(['split me'])
  })

  it('skips pings, lifecycle frames, and non-JSON frames', async () => {
    const fetchImpl = mockFetch(() =>
      sseResponse([
        frame('message_start', { message: { id: 'msg_1' } }),
        frame('ping'),
        frame('content_block_start', { index: 0, content_block: { type: 'text', text: '' } }),
        'data: not json\n\n',
        textDelta('ok'),
        frame('content_block_stop', { index: 0 }),
        STOP,
      ]),
    )
    const complete = anthropicComplete({ endpoint: '/api/ai', fetch: fetchImpl })

    expect(await collect(complete(req, { signal: signal() }))).toEqual(['ok'])
  })

  it('never inserts thinking or tool-input deltas into the document', async () => {
    const fetchImpl = mockFetch(() =>
      sseResponse([
        frame('content_block_delta', {
          index: 0,
          delta: { type: 'thinking_delta', thinking: 'weighing options' },
        }),
        frame('content_block_delta', {
          index: 1,
          delta: { type: 'input_json_delta', partial_json: '{"a":' },
        }),
        textDelta('visible'),
        STOP,
      ]),
    )
    const complete = anthropicComplete({ endpoint: '/api/ai', fetch: fetchImpl })

    expect(await collect(complete(req, { signal: signal() }))).toEqual(['visible'])
  })

  it('throws when the model refuses mid-stream', async () => {
    const fetchImpl = mockFetch(() =>
      sseResponse([
        textDelta('partial'),
        frame('message_delta', {
          delta: { stop_reason: 'refusal', stop_details: { category: 'cyber' } },
        }),
        STOP,
      ]),
    )
    const complete = anthropicComplete({ endpoint: '/api/ai', fetch: fetchImpl })

    await expect(collect(complete(req, { signal: signal() }))).rejects.toThrow(/declined.*cyber/)
  })

  it('throws on an error event in the stream', async () => {
    const fetchImpl = mockFetch(() =>
      sseResponse([frame('error', { error: { type: 'overloaded_error', message: 'Overloaded' } })]),
    )
    const complete = anthropicComplete({ endpoint: '/api/ai', fetch: fetchImpl })

    await expect(collect(complete(req, { signal: signal() }))).rejects.toThrow(
      /overloaded_error.*Overloaded/,
    )
  })

  it('lets a normal end_turn stop reason through', async () => {
    const fetchImpl = mockFetch(() =>
      sseResponse([
        textDelta('done'),
        frame('message_delta', { delta: { stop_reason: 'end_turn' } }),
        STOP,
      ]),
    )
    const complete = anthropicComplete({ endpoint: '/api/ai', fetch: fetchImpl })

    expect(await collect(complete(req, { signal: signal() }))).toEqual(['done'])
  })

  it('throws with the response body on a non-2xx', async () => {
    const fetchImpl = mockFetch(
      () => new Response('invalid x-api-key', { status: 401, statusText: 'Unauthorized' }),
    )
    const complete = anthropicComplete({ endpoint: '/api/ai', fetch: fetchImpl })

    await expect(collect(complete(req, { signal: signal() }))).rejects.toThrow(
      /401.*invalid x-api-key/,
    )
  })

  it('sends no key when proxying through an endpoint', async () => {
    const fetchImpl = mockFetch(() => sseResponse([STOP]))
    await collect(
      anthropicComplete({ endpoint: '/api/ai', fetch: fetchImpl })(req, { signal: signal() }),
    )

    const { url, headers } = callArgs(fetchImpl)
    expect(url).toBe('/api/ai')
    expect(headers['x-api-key']).toBeUndefined()
    expect(headers['anthropic-version']).toBe('2023-06-01')
  })

  it('calls Anthropic directly in browser-key mode', async () => {
    const fetchImpl = mockFetch(() => sseResponse([STOP]))
    await collect(
      anthropicComplete({ dangerouslyBrowserApiKey: 'sk-ant-test', fetch: fetchImpl })(req, {
        signal: signal(),
      }),
    )

    const { url, init, headers } = callArgs(fetchImpl)
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(headers['x-api-key']).toBe('sk-ant-test')
    expect(headers['anthropic-dangerous-direct-browser-access']).toBe('true')
    expect(JSON.parse(init.body as string)).toMatchObject({
      stream: true,
      model: 'claude-sonnet-5',
      max_tokens: 4096,
      thinking: { type: 'disabled' },
      output_config: { effort: 'low' },
    })
  })

  it('omits thinking and effort when asked to', async () => {
    const fetchImpl = mockFetch(() => sseResponse([STOP]))
    await collect(
      anthropicComplete({
        endpoint: '/api/ai',
        model: 'claude-fable-5',
        thinking: 'auto',
        effort: null,
        fetch: fetchImpl,
      })(req, { signal: signal() }),
    )

    const body = JSON.parse(callArgs(fetchImpl).init.body as string) as Record<string, unknown>
    expect(body['model']).toBe('claude-fable-5')
    expect(body['thinking']).toBeUndefined()
    expect(body['output_config']).toBeUndefined()
  })

  it('forwards the abort signal to fetch', async () => {
    const fetchImpl = mockFetch(() => sseResponse([STOP]))
    const controller = new AbortController()
    await collect(
      anthropicComplete({ endpoint: '/api/ai', fetch: fetchImpl })(req, {
        signal: controller.signal,
      }),
    )

    expect(callArgs(fetchImpl).init.signal).toBe(controller.signal)
  })

  it('puts the selection in the prompt when rewriting', async () => {
    const fetchImpl = mockFetch(() => sseResponse([STOP]))
    await collect(
      anthropicComplete({ endpoint: '/api/ai', fetch: fetchImpl })(
        {
          prompt: 'make it shorter',
          selection: 'the selected sentence',
          documentText: 'whole doc',
        },
        { signal: signal() },
      ),
    )

    const body = JSON.parse(callArgs(fetchImpl).init.body as string) as {
      messages: { content: string }[]
    }
    expect(body.messages[0]!.content).toContain('make it shorter')
    expect(body.messages[0]!.content).toContain('the selected sentence')
  })

  it('refuses ambiguous or missing configuration', () => {
    expect(() => anthropicComplete({})).toThrow(/endpoint/)
    expect(() =>
      anthropicComplete({ endpoint: '/api/ai', dangerouslyBrowserApiKey: 'sk-ant-test' }),
    ).toThrow(/not both/)
  })
})
