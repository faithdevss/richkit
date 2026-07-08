# @rich-editor/html

HTML serialization helpers for [@rich-editor/core](https://www.npmjs.com/package/@rich-editor/core). Re-exports `htmlToDoc` and `docToHtml` for standalone use (e.g. server-side rendering of stored documents).

## Install

```sh
npm install @rich-editor/html @rich-editor/core
```

## Usage

```ts
import { htmlToDoc, docToHtml } from '@rich-editor/html'

const html = docToHtml(editor.state.doc)
```

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
