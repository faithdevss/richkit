# @rich-editor/markdown

Markdown serialization and parsing for [@rich-editor/core](https://www.npmjs.com/package/@rich-editor/core).

## Install

```sh
npm install @rich-editor/markdown @rich-editor/core
```

## Usage

```ts
import { docToMarkdown, markdownToDoc, setMarkdownContent } from '@rich-editor/markdown'

const md = docToMarkdown(editor.state.doc)
setMarkdownContent(editor, '# Hello\n\nWorld')
```

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
