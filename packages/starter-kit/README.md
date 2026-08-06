# @richkit/starter-kit

All standard extensions for [@richkit/core](https://www.npmjs.com/package/@richkit/core) in one package: paragraphs, headings, bold, italic, lists, tables, images, links, code blocks, task lists, track changes, comments, find & replace, and more.

## Install

```sh
npm install @richkit/starter-kit @richkit/core
```

## Usage

```ts
import { Editor } from '@richkit/core'
import { StarterKit } from '@richkit/starter-kit'

const editor = new Editor({
  extensions: [...StarterKit],
})
```

Individual extensions are also published separately as `@richkit/extension-*` if you want a smaller bundle.

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
