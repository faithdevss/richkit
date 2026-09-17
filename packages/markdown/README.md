# @richkitjs/markdown

Markdown serialization and parsing for [@richkitjs/core](https://www.npmjs.com/package/@richkitjs/core).

## Install

```sh
npm install @richkitjs/markdown @richkitjs/core
```

## Usage

```ts
import { docToMarkdown, markdownToDoc, setMarkdownContent } from '@richkitjs/markdown'

const md = docToMarkdown(editor.state.doc)
setMarkdownContent(editor, '# Hello\n\nWorld')
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
