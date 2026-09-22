# @richkitjs/markdown

## 0.2.0

### Minor Changes

- 80bce48: Fixes from integration feedback.

  - **Breaking (styles):** the stylesheet's CSS variables are now prefixed with `--rk-` (`--rk-bg`, `--rk-surface`, `--rk-accent`, …) so they no longer overwrite a host app's own `--bg`, `--surface` or `--text`. Rename any overrides: `--accent` becomes `--rk-accent`.
  - The question card and the formula input follow the theme instead of staying white in dark mode.
  - Lists keep their bullets and numbers under CSS resets such as Tailwind's preflight.
  - `QuestionEditor`: `showPoints` hides the points field; "Add option" and per-row remove controls, bounded by `minOptions` / `maxOptions`; optional `optionIds` in the value stay attached to their option as options are added or removed, with `createOptionId` for new ones. Removing the correct option sets `correct` to `-1`.
  - **Breaking (security):** `markdownToHtml()` now escapes raw HTML by default. Pass `{ extensions }` or `{ schema }` to keep RichKit's own HTML (underline, highlight, tables, sized images) cleaned through the schema, or `{ html: true }` for the previous unfiltered output.
  - Markdown now writes and reads math: `$…$` inline and `$$…$$` for display. Literal dollars are escaped when math is in the schema.
  - Markdown keeps table and image details by falling back to HTML: tables without a header row, merged cells, column widths or rich cell content, and images with a size, alignment or caption.

### Patch Changes

- 80bce48: Fixes from testing every ready-made editor as a user.

  - **Breaking (styles):** the stylesheet's `demo-*` classes are now `rk-*` (`.rk-frame`, `.rk-page`, `.rk-scroll`, `.rk-toolbar`, `.rk-frame.rk-notion`, …). Rename any selectors that target them.
  - `MarkdownEditor` keeps formulas: `$…$` and `$$…$$` no longer lose their dollars on the first edit. Load `@richkitjs/extension-math/style.css` to render them.
  - Markdown read into a schema without math keeps `$…$` as written instead of dropping the dollars.
  - `TrackChangesEditor`: a new `value` from the parent (a reset, a loaded record) is no longer recorded as a suggestion. Core now marks `setContent` transactions with `SET_CONTENT_META`, which edit-tracking plugins can skip.
  - The stylesheet now carries ProseMirror's required styles, so spaces are no longer typed and saved as `&nbsp;`.
  - `ref.clear()` fires `onChange` with `''`, so a controlled parent stays in sync. `setValue()` is documented as meant for uncontrolled editors.
  - `DocxEditor` in light theme sits on a grey desk instead of a black one.
  - `QuestionEditor` answer options are one paragraph: Enter no longer adds lines, and pasted paragraphs join. The docs now show how formulas are written in the value.
  - `NotionEditor`'s `footer` renders in a styled slot under the status bar.
  - Picking a mention inserts a space after it.
  - The bubble menu no longer appears for a selection with no text, and commenting on one shows the "select some text" hint instead of silently doing nothing.
  - `AgentEditor` shows its Ctrl/⌘+Enter shortcut, and its dock controls are labelled.
  - Icon-only toolbar and editor buttons have an `aria-label`, not just a tooltip.

- Updated dependencies [80bce48]
- Updated dependencies [80bce48]
  - @richkitjs/core@0.3.0

## 0.1.1

### Patch Changes

- f79165d: Upgrade `markdown-it` to v15, which ships its own type definitions, so `@types/markdown-it`
  is no longer needed.
- Updated dependencies [e100235]
- Updated dependencies [bd4933d]
- Updated dependencies [45334ad]
  - @richkitjs/core@0.2.0

## 0.1.0

### Minor Changes

- 534bdf5: Initial public release: headless ProseMirror core, 36 extensions, starter kit, markdown/HTML/DOCX converters, React and Vue 3 bindings.

### Patch Changes

- Updated dependencies [534bdf5]
  - @richkitjs/core@0.1.0
