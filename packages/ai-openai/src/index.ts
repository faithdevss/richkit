import type { AIComplete, AICompletionRequest } from '@richkitjs/extension-ai'

export interface OpenAIAdapterOptions {
  /**
   * Your own server route, which holds the API key and proxies to OpenAI.
   * This is the option to reach for in anything user-facing.
   */
  endpoint?: string
  /**
   * Calls api.openai.com straight from the browser with this key.
   *
   * Only correct when the key belongs to the person sitting in front of the
   * browser — e.g. they pasted it into a settings panel. Never wire this to a
   * build-time env var (`VITE_*`, `NEXT_PUBLIC_*`): bundlers inline those, so
   * the key ships to every visitor in readable JavaScript.
   */
  dangerouslyBrowserApiKey?: string
  model?: string
  /** Overrides the built-in editing instructions. */
  systemPrompt?: string
  /** Extra headers, e.g. auth for your own endpoint. */
  headers?: Record<string, string>
  /** Injectable for tests. */
  fetch?: typeof globalThis.fetch
}

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

const DEFAULT_SYSTEM =
  'You edit text inside a rich text editor. Return only the replacement text. ' +
  'Do not add commentary, quotation marks, or markdown fences.'

function buildUserMessage(req: AICompletionRequest): string {
  if (req.selection) {
    return `Instruction: ${req.prompt}\n\nText to rewrite:\n${req.selection}`
  }
  const context = req.documentText.trim()
  return context
    ? `Instruction: ${req.prompt}\n\nDocument so far (for context only):\n${context}`
    : `Instruction: ${req.prompt}`
}

/** Yields `data:` payloads from an SSE body, stopping at the [DONE] sentinel. */
async function* sseLines(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // Frames are newline-delimited; a chunk can split one mid-line.
      let newline = buffer.indexOf('\n')
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim()
        buffer = buffer.slice(newline + 1)
        if (line.startsWith('data:')) {
          const payload = line.slice(5).trim()
          if (payload === '[DONE]') return
          if (payload) yield payload
        }
        newline = buffer.indexOf('\n')
      }
    }
  } finally {
    reader.cancel().catch(() => {
      // stream already closed
    })
  }
}

interface ChatChunk {
  choices?: { delta?: { content?: string | null } }[]
}

/**
 * Builds the transport `@richkitjs/extension-ai` expects.
 *
 * Speaks the OpenAI chat-completions SSE format, so a proxy route can pipe
 * OpenAI's response straight through without reshaping it.
 */
export function openaiComplete(options: OpenAIAdapterOptions): AIComplete {
  const {
    endpoint,
    dangerouslyBrowserApiKey,
    model = 'gpt-4o',
    systemPrompt = DEFAULT_SYSTEM,
    headers = {},
    fetch: fetchImpl,
  } = options

  if (!endpoint && !dangerouslyBrowserApiKey) {
    throw new Error('openaiComplete: set `endpoint` (recommended) or `dangerouslyBrowserApiKey`.')
  }
  if (endpoint && dangerouslyBrowserApiKey) {
    throw new Error('openaiComplete: set `endpoint` or `dangerouslyBrowserApiKey`, not both.')
  }

  return async function* (req, { signal }) {
    const doFetch = fetchImpl ?? globalThis.fetch
    const url = endpoint ?? OPENAI_URL

    const requestHeaders: Record<string, string> = {
      'content-type': 'application/json',
      ...headers,
    }
    if (dangerouslyBrowserApiKey) {
      requestHeaders['authorization'] = `Bearer ${dangerouslyBrowserApiKey}`
    }

    const response = await doFetch(url, {
      method: 'POST',
      headers: requestHeaders,
      signal,
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: buildUserMessage(req) },
        ],
      }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(
        `openaiComplete: ${response.status} ${response.statusText}${detail ? ` — ${detail}` : ''}`,
      )
    }
    if (!response.body) {
      throw new Error('openaiComplete: response had no body to stream.')
    }

    for await (const payload of sseLines(response.body)) {
      if (signal.aborted) return
      let chunk: ChatChunk
      try {
        chunk = JSON.parse(payload) as ChatChunk
      } catch {
        continue // keep-alive or partial frame
      }
      const text = chunk.choices?.[0]?.delta?.content
      if (text) yield text
    }
  }
}
