import type { AIComplete, AICompletionRequest } from '@richkitjs/extension-ai'

/** Thinking depth. `'auto'` omits the field so the model's own default applies. */
export type AnthropicThinking = 'disabled' | 'adaptive' | 'auto'

/** Maps to `output_config.effort`. `null` omits the field. */
export type AnthropicEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export interface AnthropicAdapterOptions {
  /**
   * Your own server route, which holds the API key and proxies to Anthropic.
   * This is the option to reach for in anything user-facing. The route only has
   * to pipe Anthropic's SSE response through unchanged.
   */
  endpoint?: string
  /**
   * Calls api.anthropic.com straight from the browser with this key.
   *
   * Only correct when the key belongs to the person sitting in front of the
   * browser — e.g. they pasted it into a settings panel. Never wire this to a
   * build-time env var (`VITE_*`, `NEXT_PUBLIC_*`): bundlers inline those, so
   * the key ships to every visitor in readable JavaScript.
   */
  dangerouslyBrowserApiKey?: string
  /** Defaults to `claude-sonnet-5` — the speed/quality balance an inline editor wants. */
  model?: string
  /** Upper bound on the reply. Streaming, so a generous value costs nothing. */
  maxTokens?: number
  /** Overrides the built-in editing instructions. */
  systemPrompt?: string
  /**
   * Defaults to `'disabled'`: a rewrite should start streaming immediately, and
   * thinking blocks would add a silent pause first. Raise to `'adaptive'` for
   * instruction-heavy prompts. Note `claude-fable-5` rejects an explicit
   * `disabled` — use `'auto'` there.
   */
  thinking?: AnthropicThinking
  /** Defaults to `'low'`. Pass `null` to leave the model's own default in place. */
  effort?: AnthropicEffort | null
  /** Extra headers, e.g. auth for your own endpoint. */
  headers?: Record<string, string>
  /** Injectable for tests. */
  fetch?: typeof globalThis.fetch
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

const DEFAULT_SYSTEM =
  'You edit text inside a rich text editor. Return only the replacement text. ' +
  'Do not add commentary, quotation marks, or markdown fences. ' +
  'Do not include internal or system XML tags in your response.'

function buildUserMessage(req: AICompletionRequest): string {
  if (req.selection) {
    return `Instruction: ${req.prompt}\n\nText to rewrite:\n${req.selection}`
  }
  const context = req.documentText.trim()
  return context
    ? `Instruction: ${req.prompt}\n\nDocument so far (for context only):\n${context}`
    : `Instruction: ${req.prompt}`
}

/** Yields `data:` payloads from an SSE body. Anthropic ends the stream itself. */
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

/** The subset of the Messages stream events this adapter acts on. */
interface StreamEvent {
  type?: string
  delta?: {
    type?: string
    text?: string
    stop_reason?: string | null
    stop_details?: { category?: string | null } | null
  }
  error?: { type?: string; message?: string }
}

/**
 * Builds the transport `@richkitjs/extension-ai` expects.
 *
 * Speaks the Anthropic Messages SSE format, so a proxy route can pipe
 * Anthropic's response straight through without reshaping it.
 */
export function anthropicComplete(options: AnthropicAdapterOptions): AIComplete {
  const {
    endpoint,
    dangerouslyBrowserApiKey,
    model = 'claude-sonnet-5',
    maxTokens = 4096,
    systemPrompt = DEFAULT_SYSTEM,
    thinking = 'disabled',
    effort = 'low',
    headers = {},
    fetch: fetchImpl,
  } = options

  if (!endpoint && !dangerouslyBrowserApiKey) {
    throw new Error(
      'anthropicComplete: set `endpoint` (recommended) or `dangerouslyBrowserApiKey`.',
    )
  }
  if (endpoint && dangerouslyBrowserApiKey) {
    throw new Error('anthropicComplete: set `endpoint` or `dangerouslyBrowserApiKey`, not both.')
  }

  return async function* (req, { signal }) {
    const doFetch = fetchImpl ?? globalThis.fetch
    const url = endpoint ?? ANTHROPIC_URL

    const requestHeaders: Record<string, string> = {
      'content-type': 'application/json',
      'anthropic-version': ANTHROPIC_VERSION,
      ...headers,
    }
    if (dangerouslyBrowserApiKey) {
      requestHeaders['x-api-key'] = dangerouslyBrowserApiKey
      // Anthropic blocks browser origins unless the caller opts in explicitly.
      requestHeaders['anthropic-dangerous-direct-browser-access'] = 'true'
    }

    const response = await doFetch(url, {
      method: 'POST',
      headers: requestHeaders,
      signal,
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        stream: true,
        system: systemPrompt,
        messages: [{ role: 'user', content: buildUserMessage(req) }],
        ...(thinking === 'auto' ? {} : { thinking: { type: thinking } }),
        ...(effort ? { output_config: { effort } } : {}),
      }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(
        `anthropicComplete: ${response.status} ${response.statusText}${detail ? ` — ${detail}` : ''}`,
      )
    }
    if (!response.body) {
      throw new Error('anthropicComplete: response had no body to stream.')
    }

    for await (const payload of sseLines(response.body)) {
      if (signal.aborted) return
      let event: StreamEvent
      try {
        event = JSON.parse(payload) as StreamEvent
      } catch {
        continue // keep-alive or partial frame
      }

      switch (event.type) {
        case 'content_block_delta':
          // Only visible text belongs in the document — thinking, tool input,
          // and signature deltas share this event and must not be inserted.
          if (event.delta?.type === 'text_delta' && event.delta.text) yield event.delta.text
          break

        case 'message_delta':
          if (event.delta?.stop_reason === 'refusal') {
            const category = event.delta.stop_details?.category
            throw new Error(
              `anthropicComplete: the model declined this request${category ? ` (${category})` : ''}.`,
            )
          }
          break

        case 'error':
          throw new Error(
            `anthropicComplete: ${event.error?.type ?? 'stream error'}${
              event.error?.message ? ` — ${event.error.message}` : ''
            }`,
          )

        case 'message_stop':
          return
      }
    }
  }
}
