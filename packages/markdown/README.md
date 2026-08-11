# @richkitjs/markdown

Markdown serialization and parsing for [@richkitjs/core](https://www.npmjs.com/package/@richkitjs/core).

## Install

```sh
npm install @richkitjs/markdown @richkitjs/core
```

## Usage

```ts
import { docToMarkdown, markdownToDoc, setMarkdownContent } from '@richkitjs/markdown'

const md = docToMarkdown(editor.state.doc)
setMarkdownContent(editor, '# Hello\n\nWorld')
```

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
