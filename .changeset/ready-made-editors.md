---
'@richkitjs/editors': minor
'@richkitjs/react': minor
'@richkitjs/core': minor
---

New `@richkitjs/editors`: the showcase editors — Notion, Simple, Minimal, Classic
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
