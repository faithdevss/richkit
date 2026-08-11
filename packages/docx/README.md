# @richkitjs/docx

DOCX import and export for [@richkitjs/core](https://www.npmjs.com/package/@richkitjs/core).

## Install

```sh
npm install @richkitjs/docx @richkitjs/core
```

## Usage

```ts
import { exportToDocx, downloadDocx, importDocxFile } from '@richkitjs/docx'

await downloadDocx(editor, { filename: 'document.docx' })

const result = await importDocxFile(file)
```

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
