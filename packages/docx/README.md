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

Free for noncommercial use under [PolyForm Noncommercial 1.0.0](./LICENSE) — hobby
projects, learning, research, education and charities.

Commercial and business use requires a paid license: **$99 a year** for every
`@richkitjs` package, unlimited developers and unlimited products, after a free
90-day evaluation period. See [LICENSE-COMMERCIAL](./LICENSE-COMMERCIAL) or
[the pricing page](https://faithdevss.github.io/richkit/pricing).
