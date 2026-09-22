# @richkitjs/core

## 0.3.0

### Minor Changes

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

- 80bce48: HTML sanitizing and a read-only viewer.

  - `sanitizeHtml()` and `renderHtml()` in `@richkitjs/html` clean untrusted HTML, or render a `getJSON()` document, through the schema without mounting an editor.
  - `RichViewer` component for React and Vue displays stored content read-only.
  - `isSafeUrl`, `safeUrl` and `getSchema` exported from core. `htmlToDoc` and `docToHtml` take an optional `document` for server rendering.
  - Security: link, image, bookmark, media, mention and embed extensions now reject `javascript:`, `vbscript:`, `data:text/html` and other script-capable URLs on parse, on render and in their insert commands.
  - Security: `htmlToDoc` now parses inside an inert document, so `<img onerror>` in content no longer runs while it is being parsed.

## 0.2.0

### Minor Changes

- bd4933d: List buttons now toggle. `toggleBulletList`, `toggleOrderedList` and `toggleTaskList` were plain
  `wrapInList`, so clicking one inside a list did nothing. They now use the new core `toggleList`
  command: inside a list of the same type the selected items are lifted out, inside a list of
  another type that list is converted in place (items retyped for task lists), and outside a list
  the selection is wrapped as before. The list-style commands convert instead of nesting too.
- 45334ad: New `@richkitjs/editors`: the showcase editors — Notion, Simple, Minimal, Classic
  (form field), Question, Markdown, HTML, DOCX, Comments, Track changes, Mentions,
  Comment box, Find & replace, Agent — as installable components. Each one is a
  form input: `value`/`defaultValue`/`onChange` in HTML (or `format="markdown" |
"text" | "json"`), `name` for native forms, `onBlur`, `disabled`, `readOnly`,
  and a ref with `focus()`, so `{...field}` from react-hook-form spreads straight
  on. Styles ship as `@richkitjs/editors/style.css`.

  `@richkitjs/react` adds `useControlledEditor` — `useEditor` with the same
  input contract — plus `getEditorValue`/`toEditorContent`. `useEditor` now
  re-renders on every transaction, not only on `update`/`selectionUpdate`, and
  `Toolbar` goes inert while its editor is read-only.

  `@richkitjs/core` adds `setContent(content, { emitUpdate, addToHistory })`,
  `setEditable()` and `isEmpty`.

### Patch Changes

- e100235: `configure()` now returns a configured copy instead of changing the extension in place.

  Before, `Placeholder.configure({ placeholder: 'Reply…' })` also changed the `Placeholder`
  inside `StarterKit`, so every editor on the page picked up the last placeholder configured
  anywhere, and `Link.configure(...)` in one editor changed links in all of them. Code that
  uses the returned value, which is how `configure` is documented, needs no change.

## 0.1.0

### Minor Changes

- 534bdf5: Initial public release: headless ProseMirror core, 36 extensions, starter kit, markdown/HTML/DOCX converters, React and Vue 3 bindings.
