# @richkitjs/react

## 0.4.0

### Minor Changes

- 80bce48: HTML sanitizing and a read-only viewer.

  - `sanitizeHtml()` and `renderHtml()` in `@richkitjs/html` clean untrusted HTML, or render a `getJSON()` document, through the schema without mounting an editor.
  - `RichViewer` component for React and Vue displays stored content read-only.
  - `isSafeUrl`, `safeUrl` and `getSchema` exported from core. `htmlToDoc` and `docToHtml` take an optional `document` for server rendering.
  - Security: link, image, bookmark, media, mention and embed extensions now reject `javascript:`, `vbscript:`, `data:text/html` and other script-capable URLs on parse, on render and in their insert commands.
  - Security: `htmlToDoc` now parses inside an inert document, so `<img onerror>` in content no longer runs while it is being parsed.

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

- 80bce48: Fixes from integration feedback.

  - **Breaking (styles):** the stylesheet's CSS variables are now prefixed with `--rk-` (`--rk-bg`, `--rk-surface`, `--rk-accent`, …) so they no longer overwrite a host app's own `--bg`, `--surface` or `--text`. Rename any overrides: `--accent` becomes `--rk-accent`.
  - The question card and the formula input follow the theme instead of staying white in dark mode.
  - Lists keep their bullets and numbers under CSS resets such as Tailwind's preflight.
  - `QuestionEditor`: `showPoints` hides the points field; "Add option" and per-row remove controls, bounded by `minOptions` / `maxOptions`; optional `optionIds` in the value stay attached to their option as options are added or removed, with `createOptionId` for new ones. Removing the correct option sets `correct` to `-1`.
  - **Breaking (security):** `markdownToHtml()` now escapes raw HTML by default. Pass `{ extensions }` or `{ schema }` to keep RichKit's own HTML (underline, highlight, tables, sized images) cleaned through the schema, or `{ html: true }` for the previous unfiltered output.
  - Markdown now writes and reads math: `$…$` inline and `$$…$$` for display. Literal dollars are escaped when math is in the schema.
  - Markdown keeps table and image details by falling back to HTML: tables without a header row, merged cells, column widths or rich cell content, and images with a size, alignment or caption.

- 8850133: Read-only, dark theme and AI output fixes.

  - The bubble menu no longer shows on a read-only or disabled editor. Its buttons used to edit the document anyway (`MinimalEditor`, `NotionEditor`).
  - `AgentEditor` hides the agent while `readOnly` or `disabled`, and stops a running draft when either turns on.
  - Comments, Track changes and Agent pages follow the dark theme instead of staying white with light text. The question's points field does too.
  - `@richkitjs/extension-ai`: a new `parse` option turns the finished output into content, for example from Markdown. `aiPrompt` and `aiRetry` refuse to run on a read-only editor.
  - `NotionEditor` AI output lands as headings, lists and formatting instead of raw Markdown.

- Updated dependencies [80bce48]
- Updated dependencies [80bce48]
- Updated dependencies [8850133]
- Updated dependencies [80bce48]
  - @richkitjs/core@0.3.0
  - @richkitjs/markdown@0.2.0
  - @richkitjs/extension-track-changes@0.3.0
  - @richkitjs/extension-ai@0.3.0
  - @richkitjs/html@0.2.0
  - @richkitjs/extension-mention@0.2.2
  - @richkitjs/docx@0.3.0
  - @richkitjs/extension-comments@0.3.0
  - @richkitjs/extension-drag-handle@0.2.2
  - @richkitjs/extension-find-replace@0.1.2
  - @richkitjs/extension-slash-commands@0.1.2

## 0.3.0

### Minor Changes

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

- 4a2efdf: Fix toolbar rows never collapsing into the "more" popover under React 19.

  `ToolbarOverflow` reset its measuring pass from a `useEffect` keyed on the child count,
  which also fired on mount. React 19 batched that reset with the first pass's
  `setMeasuring(false)`, so the layout effect never re-ran and the row stayed stuck in
  `measuring`, rendering every button and overflowing its width. The reset now happens during
  render and only when the child count actually changes.

- Updated dependencies [e100235]
- Updated dependencies [01a839d]
- Updated dependencies [bd4933d]
- Updated dependencies [f79165d]
- Updated dependencies [3ec0ab4]
- Updated dependencies [45334ad]
  - @richkitjs/core@0.2.0
  - @richkitjs/docx@0.2.0
  - @richkitjs/extension-comments@0.2.0
  - @richkitjs/extension-track-changes@0.2.0
  - @richkitjs/extension-ai@0.2.0
  - @richkitjs/markdown@0.1.1
  - @richkitjs/extension-drag-handle@0.2.1
  - @richkitjs/extension-find-replace@0.1.1
  - @richkitjs/extension-mention@0.2.1
  - @richkitjs/extension-slash-commands@0.1.1

## 0.2.0

### Minor Changes

- 83cc996: Add block drag handles and a block actions menu.

  `@richkitjs/extension-drag-handle` is a new package: it resolves the top-level block under
  a pointer, starts a native drag for it, draws a drop indicator while one is in flight, and
  exposes block operations (`duplicateBlock`, `deleteBlock`, `insertBlockAfter`, `blockHTML`,
  `blockAnchorId`, …). It binds <kbd>Mod+D</kbd> to duplicate the current block and ships in
  `StarterKit`.

  `@richkitjs/react` gains `<BlockHandle>`, the gutter UI over it — an insert button, a drag
  handle, and a menu with Turn Into, Duplicate node, Copy to clipboard, Copy anchor link, and
  Delete. `SlashItem` also gained an optional `group`, so the slash menu now renders sectioned
  lists, and the default items carry icons.

- 83cc996: Close the gap against the documented Notion-style feature set.

  New nodes, all in `StarterKit`: callout (tip/info/warning/important/success),
  collapsible toggle, hard break, self-hosted video/audio/file, bookmark cards,
  and inline `@` mentions with a `MentionMenu` component.

  Fixes and additions to what was already there:
  - the slash menu's Heading 1/2/3 items all inserted an H1 — the level was
    passed positionally where the command expects `{ level }`
  - slash search falls back to fuzzy matching, and remembers recent commands
  - `- [ ]` starts a to-do list and `---` a divider
  - to-do items render a real checkbox instead of a styled attribute
  - `Tab`/`Shift-Tab` walk table cells
  - `Mod-K` opens the host app's link dialog via `Link.onEditLink`
  - pasted Markdown becomes blocks and a pasted URL becomes a link
  - images take alignment, a caption, and alt text from a node-view toolbar
  - code blocks show line numbers
  - the block menu's "Turn Into" submenu no longer tears down mid-click

### Patch Changes

- 0db73f6: Fix `useEditor` freezing event handlers at mount.

  `Editor` subscribes the handler functions it is constructed with exactly once, and
  `useEditor` only ever read its options ref when the effect first ran. Every callback —
  `onUpdate`, `onSelectionUpdate`, `onFocus`, `onBlur`, `onCreate`, `onDestroy` — therefore
  kept the closure from the first render and saw stale props and state for the editor's
  whole lifetime:

  ```tsx
  const [docId, setDocId] = useState('a')
  useEditor({
    extensions: StarterKit,
    onUpdate: ({ editor }) => save(docId, editor.getHTML()), // always saved to 'a'
  })
  ```

  The only workaround was listing state in `deps`, which destroys and rebuilds the editor on
  every change, losing content, selection, and undo history.

  The editor is now constructed with stable trampolines that dispatch to the current render's
  handlers, so callbacks always see fresh props and state while the instance itself is still
  never rebuilt. Adds the package's first test suite covering this, instance identity across
  re-renders, and teardown on unmount.

- Updated dependencies [83cc996]
- Updated dependencies [83cc996]
  - @richkitjs/extension-drag-handle@0.2.0
  - @richkitjs/extension-mention@0.2.0

## 0.1.0

### Minor Changes

- 534bdf5: Initial public release: headless ProseMirror core, 36 extensions, starter kit, markdown/HTML/DOCX converters, React and Vue 3 bindings.

### Patch Changes

- Updated dependencies [dd70dd2]
- Updated dependencies [534bdf5]
  - @richkitjs/extension-ai@0.1.0
  - @richkitjs/core@0.1.0
  - @richkitjs/docx@0.1.0
  - @richkitjs/extension-comments@0.1.0
  - @richkitjs/extension-find-replace@0.1.0
  - @richkitjs/extension-slash-commands@0.1.0
  - @richkitjs/extension-track-changes@0.1.0
  - @richkitjs/markdown@0.1.0
