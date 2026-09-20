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

[MIT](./LICENSE) — free for any use, commercial or not.

Need DOCX, track changes, comments, AI or the Pro editors (Notion, Classic, Question…)? Those are
[RichKit Pro](https://faithdevss.github.io/richkit/pricing).
