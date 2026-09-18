# @richkitjs/extension-math

Inline and block LaTeX formulas for [@richkitjs/core](https://www.npmjs.com/package/@richkitjs/core), rendered with [KaTeX](https://katex.org).

## Install

```sh
npm install @richkitjs/extension-math
```

KaTeX comes with it. Load the stylesheet once in your app — it brings KaTeX's styles and
fonts:

```ts
import '@richkitjs/extension-math/style.css'
```

## Usage

```ts
import { StarterKit } from '@richkitjs/starter-kit'
import { MathKit } from '@richkitjs/extension-math'

const editor = useEditor({ extensions: [...StarterKit, ...MathKit] })

editor.chain().call('insertMath', 'E = mc^2').run() // inline
editor.chain().call('insertMathBlock', '\\int_0^1 x^2\\,dx').run() // own line
editor.chain().call('updateMath', pos, '\\frac{a}{b}').run() // either kind
```

- Type `$x^2$` for an inline formula, or `$$x^2$$` in an empty paragraph for a block.
- Formulas are stored as `<span data-math="…">` and `<div data-math-block="…">` with the
  LaTeX as their text, so the source survives HTML export.
- Double-clicking a formula calls `onEdit`, so you can open your own editing UI. Without
  it, a `window.prompt` asks for the new LaTeX:

```ts
MathInline.configure({
  onEdit: ({ editor, pos, latex }) => openFormulaDialog({ editor, pos, latex }),
})
```

- `renderMath(element, latex)` renders into any element, e.g. a live preview.
- `katexOptions` is passed to every render, e.g. `{ macros: { '\\R': '\\mathbb{R}' } }`.

Rendered formulas carry the `rk-math` class, plus `rk-math-block` for block formulas.

## License

Free for noncommercial use under [PolyForm Noncommercial 1.0.0](./LICENSE) — hobby
projects, learning, research, education and charities.

Commercial and business use requires a paid license: **$99 a year** for every
`@richkitjs` package, unlimited developers and unlimited products, after a free
90-day evaluation period. See [LICENSE-COMMERCIAL](./LICENSE-COMMERCIAL) or
[the pricing page](https://faithdevss.github.io/richkit/pricing).
