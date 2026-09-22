# @richkitjs/editors

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

- 80bce48: Fixes from integration feedback.

  - **Breaking (styles):** the stylesheet's CSS variables are now prefixed with `--rk-` (`--rk-bg`, `--rk-surface`, `--rk-accent`, …) so they no longer overwrite a host app's own `--bg`, `--surface` or `--text`. Rename any overrides: `--accent` becomes `--rk-accent`.
  - The question card and the formula input follow the theme instead of staying white in dark mode.
  - Lists keep their bullets and numbers under CSS resets such as Tailwind's preflight.
  - `QuestionEditor`: `showPoints` hides the points field; "Add option" and per-row remove controls, bounded by `minOptions` / `maxOptions`; optional `optionIds` in the value stay attached to their option as options are added or removed, with `createOptionId` for new ones. Removing the correct option sets `correct` to `-1`.
  - **Breaking (security):** `markdownToHtml()` now escapes raw HTML by default. Pass `{ extensions }` or `{ schema }` to keep RichKit's own HTML (underline, highlight, tables, sized images) cleaned through the schema, or `{ html: true }` for the previous unfiltered output.
  - Markdown now writes and reads math: `$…$` inline and `$$…$$` for display. Literal dollars are escaped when math is in the schema.
  - Markdown keeps table and image details by falling back to HTML: tables without a header row, merged cells, column widths or rich cell content, and images with a size, alignment or caption.

### Patch Changes

- 8850133: Read-only, dark theme and AI output fixes.

  - The bubble menu no longer shows on a read-only or disabled editor. Its buttons used to edit the document anyway (`MinimalEditor`, `NotionEditor`).
  - `AgentEditor` hides the agent while `readOnly` or `disabled`, and stops a running draft when either turns on.
  - Comments, Track changes and Agent pages follow the dark theme instead of staying white with light text. The question's points field does too.
  - `@richkitjs/extension-ai`: a new `parse` option turns the finished output into content, for example from Markdown. `aiPrompt` and `aiRetry` refuse to run on a read-only editor.
  - `NotionEditor` AI output lands as headings, lists and formatting instead of raw Markdown.

- 80bce48: HTML sanitizing and a read-only viewer.

  - `sanitizeHtml()` and `renderHtml()` in `@richkitjs/html` clean untrusted HTML, or render a `getJSON()` document, through the schema without mounting an editor.
  - `RichViewer` component for React and Vue displays stored content read-only.
  - `isSafeUrl`, `safeUrl` and `getSchema` exported from core. `htmlToDoc` and `docToHtml` take an optional `document` for server rendering.
  - Security: link, image, bookmark, media, mention and embed extensions now reject `javascript:`, `vbscript:`, `data:text/html` and other script-capable URLs on parse, on render and in their insert commands.
  - Security: `htmlToDoc` now parses inside an inert document, so `<img onerror>` in content no longer runs while it is being parsed.

- Updated dependencies [80bce48]
- Updated dependencies [80bce48]
- Updated dependencies [8850133]
- Updated dependencies [80bce48]
  - @richkitjs/core@0.3.0
  - @richkitjs/markdown@0.2.0
  - @richkitjs/react@0.4.0
  - @richkitjs/extension-mention@0.2.2
  - @richkitjs/extension-find-replace@0.1.2
  - @richkitjs/extension-math@0.1.1
  - @richkitjs/extension-placeholder@0.1.2
  - @richkitjs/extension-word-count@0.1.2
  - @richkitjs/starter-kit@0.3.1

## 0.2.0

### Minor Changes

- 3ec0ab4: RichKit is now open-core.

  The core editor, the React and Vue bindings, the starter kit, HTML, Markdown and every basic
  extension stay **MIT** — free for any use.

  `docx`, `extension-track-changes`, `extension-comments`, `extension-ai`, `ai-openai`,
  `ai-anthropic` and the new `editors-pro` become **RichKit Pro**, under the RichKit Pro License Agreement.
  They run without a key on localhost and other development hosts. In production, register the
  key you receive after purchase:

  ```ts
  import { setLicenseKey } from '@richkitjs/license'

  setLicenseKey('YOUR-LICENCE-KEY')
  ```

  The new `@richkitjs/license` package verifies the key offline — no activation call, no
  telemetry. Without a valid key, Pro packages show a small "unlicensed" badge and log one
  warning; they never stop working or block editing. A key keeps working, forever, with every
  release up to its "updates until" date.

  **Breaking — `@richkitjs/starter-kit`:** `StarterKit` no longer includes `Comment` or
  `TrackChangesKit`, and no longer re-exports them. Add them yourself:

  ```ts
  import { Comment } from '@richkitjs/extension-comments'
  import { TrackChangesKit } from '@richkitjs/extension-track-changes'

  useEditor({ extensions: [...StarterKit, Comment, ...TrackChangesKit] })
  ```

  **Breaking — `@richkitjs/editors`:** `SimpleEditor`, `NotionEditor`, `ClassicEditor`, `QuestionEditor`,
  `CommentsEditor`, `TrackChangesEditor`, `DocxEditor` and `AgentEditor` moved to the new
  `@richkitjs/editors-pro`. `@richkitjs/editors` keeps the free editors (Minimal, HTML,
  Markdown, Mentions, Comment box, Find & replace), is MIT, and now exports its field helpers
  (`useEditorField`, `FieldValue`, `useTheme`, `withPlaceholder`, `cx`) for building your own.
  Both packages share `@richkitjs/editors/style.css`.

  `AgentEditor` gains a `complete` prop that takes the same streaming transport as
  `@richkitjs/extension-ai` (e.g. `anthropicComplete({ endpoint: '/api/ai' })`). Drafted sections
  stream into the document as Markdown-rendered content, land as one undo step, and can be
  stopped mid-stream.

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

- f013bfd: Add undo and redo buttons to `DocxEditor`. Fix the image toolbar showing permanently (its
  `display: flex` overrode the `hidden` attribute) and overflowing narrow frames, and stop the
  Notion editor stacking two left gutters on phones.
- Updated dependencies [e100235]
- Updated dependencies [bd4933d]
- Updated dependencies [f79165d]
- Updated dependencies [a8e0ea2]
- Updated dependencies [3ec0ab4]
- Updated dependencies [45334ad]
- Updated dependencies [4a2efdf]
  - @richkitjs/core@0.2.0
  - @richkitjs/markdown@0.1.1
  - @richkitjs/extension-math@0.1.0
  - @richkitjs/starter-kit@0.3.0
  - @richkitjs/react@0.3.0
  - @richkitjs/extension-find-replace@0.1.1
  - @richkitjs/extension-mention@0.2.1
  - @richkitjs/extension-placeholder@0.1.1
  - @richkitjs/extension-word-count@0.1.1
