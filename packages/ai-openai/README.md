# @richkitjs/ai-openai

OpenAI transport for [`@richkitjs/extension-ai`](../extension-ai). Streams the chat-completions
SSE response into the editor, one text delta at a time.

Zero runtime dependencies — it speaks the wire format over `fetch`, so a proxy route only has
to pipe OpenAI's response through unchanged.

## Install

```bash
pnpm add @richkitjs/extension-ai @richkitjs/ai-openai
```

## Usage

```ts
import { AI } from '@richkitjs/extension-ai'
import { openaiComplete } from '@richkitjs/ai-openai'
import { StarterKit } from '@richkitjs/starter-kit'

const editor = new Editor({
  element: document.querySelector('#editor')!,
  extensions: [
    StarterKit,
    AI.configure({
      complete: openaiComplete({ endpoint: '/api/ai' }),
    }),
  ],
})
```

Your `/api/ai` route holds the key and pipes OpenAI's SSE body straight back:

```ts
export async function POST(request: Request) {
  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: await request.text(),
  })
  return new Response(upstream.body, { status: upstream.status })
}
```

## Options

| Option                     | Type                     | Default            | Description                                               |
| -------------------------- | ------------------------ | ------------------ | --------------------------------------------------------- |
| `endpoint`                 | `string`                 | —                  | Your server route, which holds the API key.               |
| `dangerouslyBrowserApiKey` | `string`                 | —                  | Calls `api.openai.com` directly with this key. See below. |
| `model`                    | `string`                 | `'gpt-4o'`         | Model id.                                                 |
| `systemPrompt`             | `string`                 | built-in           | Overrides the built-in editing instructions.              |
| `headers`                  | `Record<string, string>` | `{}`               | Extra headers, e.g. auth for your own endpoint.           |
| `fetch`                    | `typeof fetch`           | `globalThis.fetch` | Injectable for tests.                                     |

Exactly one of `endpoint` or `dangerouslyBrowserApiKey` is required; passing both throws.

## About `dangerouslyBrowserApiKey`

> **Warning:** this sends the key from the browser. It is only correct when the key belongs to
> the person sitting in front of that browser — e.g. they pasted it into a settings panel.
>
> Never wire it to a build-time env var (`VITE_*`, `NEXT_PUBLIC_*`). Bundlers inline those, so
> your key ships to every visitor in readable JavaScript.

For anything user-facing, use `endpoint`.

## Errors

Non-2xx responses, missing bodies, and mid-stream failures are thrown, and
`@richkitjs/extension-ai` reports them in its plugin state:

```ts
import { getAIState } from '@richkitjs/extension-ai'

const { status, error } = getAIState(editor.state)! // status: 'error'
```

## License

Free for noncommercial use under [PolyForm Noncommercial 1.0.0](./LICENSE) — hobby
projects, learning, research, education and charities.

Commercial and business use requires a paid license: **$99 a year** for every
`@richkitjs` package, unlimited developers and unlimited products, after a free
90-day evaluation period. See [LICENSE-COMMERCIAL](./LICENSE-COMMERCIAL) or
[the pricing page](https://faithdevss.github.io/richkit/pricing).
