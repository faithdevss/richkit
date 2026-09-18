---
'@richkitjs/extension-math': minor
---

New package: inline and block LaTeX formulas, rendered with KaTeX.

```ts
import { MathKit } from '@richkitjs/extension-math'
import '@richkitjs/extension-math/style.css'

useEditor({ extensions: [...StarterKit, ...MathKit] })
```

- `MathInline` (`<span data-math="…">`) and `MathBlock` (`<div data-math-block="…">`) keep
  the LaTeX source in the HTML, so formulas survive export.
- Type `$x^2$` for an inline formula, or `$$x^2$$` in an empty paragraph for a block one.
  Prices such as "$5 and $6" are left alone.
- Commands: `insertMath`, `insertMathBlock` and `updateMath`.
- `onEdit` is called when a formula is double-clicked, so the app can open its own editor.
  Without it, a `window.prompt` asks for the new LaTeX.
- `renderMath(element, latex)` renders a live preview. `katexOptions` is passed through to
  KaTeX.

KaTeX is bundled as a dependency; `@richkitjs/extension-math/style.css` brings its styles
and fonts.
