---
'@richkitjs/extension-code-block': minor
---

Ship a slim set of syntax-highlighting grammars by default.

The code block used to register lowlight's `common` set — 37 highlight.js grammars — so
every editor bundle carried about 165 KB of minified highlighting code whether or not it
ever showed a code block. It now registers 16 grammars out of the box (bash, css, diff,
go, java, javascript, json, markdown, php, python, rust, shell, sql, typescript, xml,
yaml), which roughly halves highlight.js and takes the full starter kit from about 208 KB
to 184 KB gzipped.

Other languages are one option away:

```ts
import { common } from 'lowlight'
import ruby from 'highlight.js/lib/languages/ruby'

CodeBlock.configure({ languages: common }) // the previous set
CodeBlock.configure({ languages: { ruby } }) // just what you need
```

Also:

- Language aliases now highlight, e.g. `language-js` and `language-html`.
- A block whose language has no registered grammar keeps that language in the picker
  instead of showing a blank selection.
- New exports: `defaultLanguages`, `createHighlighter`, `highlighterFor`, and the
  `Highlighter` and `LanguageFn` types. `getRegisteredLanguages` and
  `codeBlockHighlightPlugin` take an optional highlighter.
