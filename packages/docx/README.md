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

See the [repository](https://github.com/faithdevss/richkit#readme) for full documentation.

## License

Part of **RichKit Pro**, licensed under the [RichKit Pro License Agreement](./LICENSE).
It runs without a key on localhost and other development hosts. Production use
needs a licence key — plans start at $99 a year, see
[the pricing page](https://faithdevss.github.io/richkit/pricing).

```ts
import { setLicenseKey } from '@richkitjs/license'

setLicenseKey('YOUR-LICENCE-KEY')
```

The key is checked locally; nothing is sent anywhere. Without one, a small
"unlicensed" badge shows on production sites — the editor never stops working.
