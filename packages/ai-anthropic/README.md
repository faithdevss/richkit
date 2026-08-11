# @richkitjs/ai-anthropic

Anthropic (Claude) transport for [`@richkitjs/extension-ai`](../extension-ai). Streams the
Messages API SSE response into the editor, one text delta at a time.

Zero runtime dependencies — it speaks the wire format over `fetch`, so a proxy route only has
to pipe Anthropic's response through unchanged.

## Install

```bash
pnpm add @richkitjs/extension-ai @richkitjs/ai-anthropic
```

## Usage

```ts
import { AI } from '@richkitjs/extension-ai'
import { anthropicComplete } from '@richkitjs/ai-anthropic'
import { StarterKit } from '@richkitjs/starter-kit'

const editor = useEditor({
  extensions: [
    ...StarterKit,
    AI.configure({ complete: anthropicComplete({ endpoint: '/api/ai' }) }),
  ],
})
```

Then drive it with the usual commands:

```ts
editor.commands.aiPrompt({ prompt: 'Make this more concise' })
editor.commands.aiAccept() // keep the AI text
editor.commands.aiReject() // restore what it replaced
editor.commands.aiCancel() // abort mid-stream
```

With `track: true` (the default on `AI`), output lands as track-changes suggestions, so
accept/reject go through `@richkitjs/extension-track-changes`.

## Server proxy (recommended)

Keep the key server-side. The route forwards the body and streams the response back:

```ts
// app/api/ai/route.ts — Next.js App Router
export async function POST(request: Request) {
  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
    },
    body: await request.text(),
  })

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'content-type': 'text/event-stream' },
  })
}
```

Because the adapter already sends the full Messages request body, the route needs no
reshaping. Validate or rate-limit there if the editor is public.

## End-user keys

`dangerouslyBrowserApiKey` calls `api.anthropic.com` from the browser and adds the
`anthropic-dangerous-direct-browser-access` header Anthropic requires for browser origins.
It is only correct when the key belongs to the person at the keyboard — for example, pasted
into a settings panel.

Never wire it to a build-time env var (`VITE_*`, `NEXT_PUBLIC_*`): bundlers inline those, so
the key ships to every visitor in readable JavaScript.

```ts
anthropicComplete({ dangerouslyBrowserApiKey: userSuppliedKey })
```

## Options

| Option                     | Default              | Notes                                                                                      |
| -------------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| `endpoint`                 | —                    | Your proxy route. Mutually exclusive with `dangerouslyBrowserApiKey`.                      |
| `dangerouslyBrowserApiKey` | —                    | Direct browser call. See above.                                                            |
| `model`                    | `claude-sonnet-5`    | The speed/quality balance an inline editor wants. Use `claude-opus-5` for harder rewrites. |
| `maxTokens`                | `4096`               | Upper bound on the reply.                                                                  |
| `systemPrompt`             | editing instructions | Replaces the built-in prompt entirely.                                                     |
| `thinking`                 | `'disabled'`         | `'adaptive'` for instruction-heavy prompts, `'auto'` to omit the field.                    |
| `effort`                   | `'low'`              | `output_config.effort`; `null` omits the field.                                            |
| `headers`                  | `{}`                 | Extra headers, e.g. auth for your own endpoint.                                            |
| `fetch`                    | `globalThis.fetch`   | Injectable for tests.                                                                      |

### Why thinking is off by default

A rewrite should start streaming immediately. With thinking on, Claude emits thinking blocks
first, which reads as a silent pause in the editor. Raise it to `'adaptive'` when the prompt
needs real reasoning.

Two model-specific notes:

- `claude-fable-5` rejects an explicit `thinking: disabled` — pass `thinking: 'auto'`.
- `claude-opus-5` rejects disabled thinking above `high` effort. The `'low'` default is fine;
  if you raise `effort` to `xhigh` or `max`, set `thinking: 'adaptive'` too.

## Errors

The transport throws, and `extension-ai` surfaces the message in its plugin state
(`getAIState(state).error`):

- non-2xx responses, with the upstream body appended
- `error` events on the stream (`overloaded_error`, `rate_limit_error`, …)
- `stop_reason: "refusal"` — Claude declined the request

Thinking, tool-input, and signature deltas share the `content_block_delta` event with text.
Only `text_delta` is inserted into the document.
