# @richkitjs/starter-kit

All standard extensions for [@richkitjs/core](https://www.npmjs.com/package/@richkitjs/core) in one package: paragraphs, headings, bold, italic, lists, tables, images, links, code blocks, task lists, track changes, comments, find & replace, and more.

## Install

```sh
npm install @richkitjs/starter-kit @richkitjs/core
```

## Usage

```ts
import { Editor } from '@richkitjs/core'
import { StarterKit } from '@richkitjs/starter-kit'

const editor = new Editor({
  extensions: [...StarterKit],
})
```

Individual extensions are also published separately as `@richkitjs/extension-*` if you want a smaller bundle.

## Docs

See the [repository](https://github.com/faithdevss/richkit#readme) for full documentation.

## License

Free for noncommercial use under [PolyForm Noncommercial 1.0.0](./LICENSE) — hobby
projects, learning, research, education and charities.

Commercial and business use requires a paid license: **$99 a year** for every
`@richkitjs` package, unlimited developers and unlimited products, after a free
90-day evaluation period. See [LICENSE-COMMERCIAL](./LICENSE-COMMERCIAL) or
[the pricing page](https://faithdevss.github.io/richkit/pricing).
