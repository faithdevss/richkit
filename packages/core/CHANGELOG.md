# @richkitjs/core

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
