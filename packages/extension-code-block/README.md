# @richkitjs/extension-code-block

Code block extension for [@richkitjs/core](https://www.npmjs.com/package/@richkitjs/core), a headless ProseMirror-based rich text editor.

## Install

```sh
npm install @richkitjs/extension-code-block @richkitjs/core
```

Most users should install [@richkitjs/starter-kit](https://www.npmjs.com/package/@richkitjs/starter-kit) instead, which bundles all extensions.

## Syntax highlighting

Code blocks are highlighted with [lowlight](https://github.com/wooorm/lowlight). To keep
bundles small, 16 common grammars are registered by default: bash, css, diff, go, java,
javascript, json, markdown, php, python, rust, shell, sql, typescript, xml and yaml.

Register more through the `languages` option:

```ts
import { CodeBlock } from '@richkitjs/extension-code-block'
import { common } from 'lowlight'
import ruby from 'highlight.js/lib/languages/ruby'

CodeBlock.configure({ languages: { ruby } }) // one extra grammar
CodeBlock.configure({ languages: common }) // lowlight's 37-language set
```

## Docs

See the [repository](https://github.com/faithdevss/richkit#readme) for usage and API documentation.

## License

Free for noncommercial use under [PolyForm Noncommercial 1.0.0](./LICENSE) — hobby
projects, learning, research, education and charities.

Commercial and business use requires a paid license: **$99 a year** for every
`@richkitjs` package, unlimited developers and unlimited products, after a free
90-day evaluation period. See [LICENSE-COMMERCIAL](./LICENSE-COMMERCIAL) or
[the pricing page](https://faithdevss.github.io/richkit/pricing).
