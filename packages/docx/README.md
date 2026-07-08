# @rich-editor/docx

DOCX import and export for [@rich-editor/core](https://www.npmjs.com/package/@rich-editor/core).

## Install

```sh
npm install @rich-editor/docx @rich-editor/core
```

## Usage

```ts
import { exportToDocx, downloadDocx, importDocxFile } from '@rich-editor/docx'

await downloadDocx(editor, { filename: 'document.docx' })

const result = await importDocxFile(file)
```

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
