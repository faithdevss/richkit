# @rich-editor/react

React bindings and UI components for [@rich-editor/core](https://www.npmjs.com/package/@rich-editor/core).

## Install

```sh
npm install @rich-editor/react @rich-editor/core @rich-editor/starter-kit
```

## Usage

```tsx
import { useEditor, EditorContent, DefaultToolbar } from '@rich-editor/react'
import { StarterKit } from '@rich-editor/starter-kit'

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
