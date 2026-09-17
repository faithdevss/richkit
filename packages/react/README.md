# @richkitjs/react

React bindings and UI components for [@richkitjs/core](https://www.npmjs.com/package/@richkitjs/core).

## Install

```sh
npm install @richkitjs/react @richkitjs/core @richkitjs/starter-kit
```

## Usage

```tsx
import { useEditor, EditorContent, DefaultToolbar } from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'

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

See the [repository](https://github.com/faithdevss/richkit#readme) for full documentation.

## License

Free for noncommercial use under [PolyForm Noncommercial 1.0.0](./LICENSE) — hobby
projects, learning, research, education and charities.

Commercial and business use requires a paid license: **$99 a year** for every
`@richkitjs` package, unlimited developers and unlimited products, after a free
90-day evaluation period. See [LICENSE-COMMERCIAL](./LICENSE-COMMERCIAL) or
[the pricing page](https://faithdevss.github.io/richkit/pricing).
