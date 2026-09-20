# @richkitjs/editors-pro

The [RichKit Pro](https://faithdevss.github.io/richkit/pricing) ready-made React editors. Each one
works like a form input: `value` in, `onChange` out — the same contract, props and `ref` handle as
the free [`@richkitjs/editors`](https://www.npmjs.com/package/@richkitjs/editors).

| Component            | What it is                                                         |
| -------------------- | ------------------------------------------------------------------ |
| `SimpleEditor`       | Full StarterKit behind a one-row toolbar, with a theme toggle      |
| `NotionEditor`       | Block page: drag handle, `/` commands, `@` mentions, outline, AI   |
| `ClassicEditor`      | Labelled form field: menubar, toolbar, helper text, error state    |
| `QuestionEditor`     | Multiple-choice question with formulas; value is a `QuestionValue` |
| `DocxEditor`         | Word-processor page with .docx import/export, zoom and print       |
| `CommentsEditor`     | Anchored comment threads with a sidebar                            |
| `TrackChangesEditor` | Suggesting mode with accept/reject                                 |
| `AgentEditor`        | Document with an agent dock that drafts sections                   |

## Install

```sh
npm install @richkitjs/editors-pro @richkitjs/editors @richkitjs/license
```

```tsx
import '@richkitjs/editors/style.css'
import { NotificationsHost } from '@richkitjs/editors'
import { setLicenseKey } from '@richkitjs/license'

setLicenseKey('YOUR-LICENCE-KEY')
```

The stylesheet and `<NotificationsHost />` come from `@richkitjs/editors` and are shared by both
packages. Mount `NotificationsHost` once near your app root.

## Use it like an input

```tsx
import { useState } from 'react'
import { NotionEditor } from '@richkitjs/editors-pro'

function PostForm() {
  const [body, setBody] = useState('<p>Hello</p>')
  return <NotionEditor value={body} onChange={setBody} />
}
```

`ClassicEditor` is built for forms, with `label`, `helperText` and `error`:

```tsx
<Controller
  name="description"
  control={control}
  rules={{ required: true }}
  render={({ field, fieldState }) => (
    <ClassicEditor {...field} label="Description" error={!!fieldState.error} />
  )}
/>
```

The shared props are documented in the
[`@richkitjs/editors` README](https://www.npmjs.com/package/@richkitjs/editors#shared-props).
Each editor also has its own, for example `NotionEditor`'s `mentions`, `ai`, `header` and
`footer`, or `DocxEditor`'s `title` and `filename`.

### AgentEditor

Pass a streaming AI transport and drafted sections stream straight into the document:

```tsx
import { anthropicComplete } from '@richkitjs/ai-anthropic'

;<AgentEditor complete={anthropicComplete({ endpoint: '/api/ai' })} />
```

`/api/ai` is your own route: it holds the API key and pipes the model's stream through (see
the `@richkitjs/ai-anthropic` README). Or pass `onDraft(prompt, editor)` and return the
section as HTML yourself.

### QuestionEditor

Its value is structured. Each text in it is HTML:

```ts
interface QuestionValue {
  stem: string
  options: string[]
  correct: number
  points: number
}
```

It needs the math styles: `import '@richkitjs/extension-math/style.css'`.

## License

Part of **RichKit Pro**, licensed under the [RichKit Pro License Agreement](./LICENSE).
It runs without a key on localhost and other development hosts. Production use
needs a licence key — plans start at $99 a year, see
[the pricing page](https://faithdevss.github.io/richkit/pricing).

The key is checked locally; nothing is sent anywhere. Without one, a small
"unlicensed" badge shows on production sites — the editor never stops working.
