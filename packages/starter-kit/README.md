# @richkitjs/starter-kit

All standard extensions for [@richkitjs/core](https://www.npmjs.com/package/@richkitjs/core) in one package: paragraphs, headings, bold, italic, lists, tables, images, links, code blocks, task lists, track changes, comments, find & replace, and more.

## Install

```sh
npm install @richkitjs/starter-kit @richkitjs/core
```

## Usage

```ts
import { Editor } from '@richkitjs/core'
import { StarterKit } from '@richkitjs/starter-kit'

const editor = new Editor({
  extensions: [...StarterKit],
})
```

Individual extensions are also published separately as `@richkitjs/extension-*` if you want a smaller bundle.

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
