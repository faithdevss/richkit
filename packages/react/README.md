# @richkit/react

React bindings and UI components for [@richkit/core](https://www.npmjs.com/package/@richkit/core).

## Install

```sh
npm install @richkit/react @richkit/core @richkit/starter-kit
```

## Usage

```tsx
import { useEditor, EditorContent, DefaultToolbar } from '@richkit/react'
import { StarterKit } from '@richkit/starter-kit'

export function MyEditor() {
  const editor = useEditor({
    extensions: [...StarterKit],
    content: '<p>Hello world</p>',
  })

  return (
    <div>
      <DefaultToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
```

Includes toolbar, menubar, bubble menu, slash menu, comments sidebar, track-changes sidebar, find & replace, outline, and print helpers.

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
