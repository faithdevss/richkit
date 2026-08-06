# @richkit/html

HTML serialization helpers for [@richkit/core](https://www.npmjs.com/package/@richkit/core). Re-exports `htmlToDoc` and `docToHtml` for standalone use (e.g. server-side rendering of stored documents).

## Install

```sh
npm install @richkit/html @richkit/core
```

## Usage

```ts
import { htmlToDoc, docToHtml } from '@richkit/html'

const html = docToHtml(editor.state.doc)
```

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
