# @rich-editor/starter-kit

All standard extensions for [@rich-editor/core](https://www.npmjs.com/package/@rich-editor/core) in one package: paragraphs, headings, bold, italic, lists, tables, images, links, code blocks, task lists, track changes, comments, find & replace, and more.

## Install

```sh
npm install @rich-editor/starter-kit @rich-editor/core
```

## Usage

```ts
import { Editor } from '@rich-editor/core'
import { StarterKit } from '@rich-editor/starter-kit'

const editor = new Editor({
  extensions: [...StarterKit],
})
```

Individual extensions are also published separately as `@rich-editor/extension-*` if you want a smaller bundle.

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
