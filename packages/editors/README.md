# @richkitjs/editors

Ready-made React editors for [RichKit](https://faithdevss.github.io/richkit/). Each one works like
a form input: `value` in, `onChange` out.

| Component           | What it is                                                  |
| ------------------- | ----------------------------------------------------------- |
| `MinimalEditor`     | Paragraphs, bold, italic, links; bubble menu only           |
| `MarkdownEditor`    | Rich editing beside live Markdown source; value is Markdown |
| `HtmlEditor`        | Rich editing beside live HTML source                        |
| `MentionsEditor`    | Chat composer: `@` mentions, Enter sends                    |
| `CommentBoxEditor`  | Reply box with a character limit                            |
| `FindReplaceEditor` | Editor under an always-open find and replace bar            |

MIT, free for any use. The Simple, Notion, Classic, Question, Comments, Track changes, DOCX and Agent
editors are [RichKit Pro](https://faithdevss.github.io/richkit/pricing), in
[`@richkitjs/editors-pro`](https://www.npmjs.com/package/@richkitjs/editors-pro).

## Install

```sh
npm install @richkitjs/editors
```

```tsx
import '@richkitjs/editors/style.css'
```

Mount `<NotificationsHost />` once near your app root. The link, image and prompt dialogs render through it:

```tsx
import { NotificationsHost } from '@richkitjs/editors'
```

## Use it like an input

```tsx
import { useState } from 'react'
import { MinimalEditor } from '@richkitjs/editors'

function PostForm() {
  const [body, setBody] = useState('<p>Hello</p>')
  return <MinimalEditor value={body} onChange={setBody} />
}
```

An empty document reads as `''`, not `<p></p>`, so `required` and dirty checks behave like they
do for a `<textarea>`. When the parent changes `value` (a form reset, a loaded record), the
editor replaces its content. It does not fire `onChange` for that and does not add it to undo
history. When `value` is only the editor's own `onChange` coming back, nothing happens, so the
caret does not jump.

### react-hook-form

```tsx
<Controller
  name="description"
  control={control}
  rules={{ required: true }}
  render={({ field, fieldState }) => <MinimalEditor {...field} aria-invalid={!!fieldState.error} />}
/>
```

`field.ref` gets a handle with `focus()`, so focus-on-error works.

### Native forms

```tsx
<form action="/posts" method="post">
  <MinimalEditor name="body" defaultValue="" />
  <button>Save</button>
</form>
```

`name` renders a hidden input that holds the current value.

## Shared props

| Prop                          | Type                                       |                                                            |
| ----------------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| `value` / `defaultValue`      | `string` (or JSON with `format="json"`)    | controlled / uncontrolled content                          |
| `onChange`                    | `(value) => void`                          | after every edit                                           |
| `format`                      | `'html' \| 'markdown' \| 'text' \| 'json'` | default `'html'` (`MarkdownEditor`: markdown)              |
| `onBlur` / `onFocus`          | `() => void`                               |                                                            |
| `name`                        | `string`                                   | hidden input for native form submit                        |
| `disabled` / `readOnly`       | `boolean`                                  | toggles in place, no rebuild                               |
| `placeholder`                 | `string`                                   |                                                            |
| `autoFocus`                   | `boolean`                                  |                                                            |
| `theme`                       | `'light' \| 'dark'`                        |                                                            |
| `className` / `style`         |                                            | on the root element                                        |
| `aria-label` / `aria-invalid` |                                            | on the editable element                                    |
| `onEditorReady`               | `(editor: Editor) => void`                 | the live editor, for any command                           |
| `ref`                         | `EditorHandle`                             | `editor`, `focus`, `blur`, `getValue`, `setValue`, `clear` |

Each editor also has its own props, for example `MentionsEditor`'s `mentions` or
`CommentBoxEditor`'s `limit`. All of them are typed and documented in the package's type
definitions.

## Build your own

The components are built from `@richkitjs/react`. `useControlledEditor` gives any custom editor
the same input contract:

```tsx
import { useControlledEditor, EditorContent } from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'

function MyEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useControlledEditor({ extensions: StarterKit, value, onChange })
  return <EditorContent editor={editor} />
}
```

## License

[MIT](./LICENSE) — free for any use, commercial or not.
