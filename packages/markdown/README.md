# @richkit/markdown

Markdown serialization and parsing for [@richkit/core](https://www.npmjs.com/package/@richkit/core).

## Install

```sh
npm install @richkit/markdown @richkit/core
```

## Usage

```ts
import { docToMarkdown, markdownToDoc, setMarkdownContent } from '@richkit/markdown'

const md = docToMarkdown(editor.state.doc)
setMarkdownContent(editor, '# Hello\n\nWorld')
```

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
