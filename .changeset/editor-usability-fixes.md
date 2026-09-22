---
'@richkitjs/core': minor
'@richkitjs/markdown': patch
'@richkitjs/extension-track-changes': patch
'@richkitjs/react': patch
'@richkitjs/editors': minor
'@richkitjs/editors-pro': minor
---

Fixes from testing every ready-made editor as a user.

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
