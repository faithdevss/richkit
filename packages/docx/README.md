# @richkit/docx

DOCX import and export for [@richkit/core](https://www.npmjs.com/package/@richkit/core).

## Install

```sh
npm install @richkit/docx @richkit/core
```

## Usage

```ts
import { exportToDocx, downloadDocx, importDocxFile } from '@richkit/docx'

await downloadDocx(editor, { filename: 'document.docx' })

const result = await importDocxFile(file)
```

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
