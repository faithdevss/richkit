# @richkit/extension-ai

AI authoring for RichKit. Streams a model's output into the document, and — when
[`@richkit/extension-track-changes`](../extension-track-changes) is installed — lands every
edit as a suggestion the user can accept or reject.

The extension never talks to a provider itself. You hand it a `complete` transport, which is
the only vendor-specific seam:

- [`@richkit/ai-openai`](../ai-openai) — OpenAI chat completions
- [`@richkit/ai-anthropic`](../ai-anthropic) — Anthropic Messages API

## Install

```bash
pnpm add @richkit/extension-ai @richkit/ai-openai
```

## Usage

```ts
import { Editor } from '@richkit/core'
import { StarterKit } from '@richkit/starter-kit'
import { AI } from '@richkit/extension-ai'
import { openaiComplete } from '@richkit/ai-openai'

const editor = new Editor({
  element: document.querySelector('#editor')!,
  extensions: [
    StarterKit,
    AI.configure({
      // Your own route, holding the API key server-side.
      complete: openaiComplete({ endpoint: '/api/ai' }),
      attributeAs: 'AI Assistant',
      track: true,
    }),
  ],
})

// Rewrite the selection.
editor.commands.aiPrompt({ prompt: 'Make this more concise' })
```

## Options

| Option        | Type                 | Default          | Description                                                                     |
| ------------- | -------------------- | ---------------- | ------------------------------------------------------------------------------- |
| `complete`    | `AIComplete \| null` | `null`           | Transport. Commands no-op while this is `null`.                                 |
| `attributeAs` | `string`             | `'AI Assistant'` | Author recorded on the suggestions it produces.                                 |
| `track`       | `boolean`            | `true`           | Route output through track-changes. Inert when that extension is not installed. |

## Commands

| Command                        | Description                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `aiPrompt({ prompt, range? })` | Run against `range`, or the current selection. No-ops while a run is streaming. |
| `aiCancel()`                   | Abort the in-flight run. The transport's `signal` fires.                        |
| `aiRetry()`                    | Drop the last attempt and re-run the same prompt against the same target.       |
| `aiAccept()`                   | Keep the AI text: drop what it replaced, strip the suggestion marks.            |
| `aiReject()`                   | Discard the AI text and restore what it replaced.                               |

With `track: true`, a rewrite marks the original text deleted rather than removing it, so
`aiReject` can restore it. Without tracking there is nothing to fall back to, and the original
is deleted outright.

## Plugin state

```ts
import { getAIState, isAIStreaming } from '@richkit/extension-ai'

const state = getAIState(editor.state)
// { status: 'idle' | 'streaming' | 'error', prompt, error, range, replaced }

if (isAIStreaming(editor.state)) {
  // show a stop button
}
```

Transport failures — non-2xx responses, stream errors, refusals — surface as
`status: 'error'` with the thrown message in `error`.

## Writing a transport

Any async generator of text chunks works:

```ts
import type { AIComplete } from '@richkit/extension-ai'

const complete: AIComplete = async function* (req, { signal }) {
  // req: { prompt, selection, documentText }
  const res = await fetch('/api/ai', {
    method: 'POST',
    body: JSON.stringify(req),
    signal,
  })
  for await (const chunk of readChunks(res.body!)) {
    if (signal.aborted) return
    yield chunk
  }
}
```

`selection` is the text being rewritten, or `''` when inserting at a cursor. Transports must
honour `signal` so `aiCancel` actually stops the request.

## License

MIT
