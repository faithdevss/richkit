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

[MIT](./LICENSE) — free for any use, commercial or not.

Need DOCX, track changes, comments, AI or the Pro editors (Notion, Classic, Question…)? Those are
[RichKit Pro](https://faithdevss.github.io/richkit/pricing).
