# @richkitjs/starter-kit

## 0.3.0

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

### Patch Changes

- Updated dependencies [e100235]
- Updated dependencies [bd4933d]
- Updated dependencies [45334ad]
- Updated dependencies [08f0dc7]
- Updated dependencies [7e383d9]
- Updated dependencies [04b4cc6]
  - @richkitjs/core@0.2.0
  - @richkitjs/extension-bullet-list@0.1.1
  - @richkitjs/extension-ordered-list@0.1.1
  - @richkitjs/extension-task-list@0.2.1
  - @richkitjs/extension-code-block@0.3.0
  - @richkitjs/extension-table@0.2.1
  - @richkitjs/extension-heading@0.1.1
  - @richkitjs/extension-highlight@0.1.1
  - @richkitjs/extension-text-align@0.1.1
  - @richkitjs/extension-blockquote@0.1.1
  - @richkitjs/extension-bold@0.1.1
  - @richkitjs/extension-bookmark@0.2.1
  - @richkitjs/extension-callout@0.2.1
  - @richkitjs/extension-case-change@0.1.1
  - @richkitjs/extension-code@0.1.1
  - @richkitjs/extension-drag-handle@0.2.1
  - @richkitjs/extension-embed@0.1.1
  - @richkitjs/extension-find-replace@0.1.1
  - @richkitjs/extension-hard-break@0.2.1
  - @richkitjs/extension-history@0.1.1
  - @richkitjs/extension-horizontal-rule@0.1.1
  - @richkitjs/extension-image@0.2.1
  - @richkitjs/extension-italic@0.1.1
  - @richkitjs/extension-line-height@0.1.1
  - @richkitjs/extension-link@0.2.1
  - @richkitjs/extension-list-item@0.1.1
  - @richkitjs/extension-markdown-shortcuts@0.2.1
  - @richkitjs/extension-media@0.2.1
  - @richkitjs/extension-mention@0.2.1
  - @richkitjs/extension-page-break@0.1.1
  - @richkitjs/extension-paragraph@0.1.1
  - @richkitjs/extension-paste-handler@0.2.1
  - @richkitjs/extension-placeholder@0.1.1
  - @richkitjs/extension-slash-commands@0.1.1
  - @richkitjs/extension-strike@0.1.1
  - @richkitjs/extension-subscript@0.1.1
  - @richkitjs/extension-superscript@0.1.1
  - @richkitjs/extension-text-style@0.1.1
  - @richkitjs/extension-toggle@0.2.1
  - @richkitjs/extension-typography@0.1.1
  - @richkitjs/extension-underline@0.1.1
  - @richkitjs/extension-word-count@0.1.1

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

- Updated dependencies [83cc996]
- Updated dependencies [83cc996]
  - @richkitjs/extension-drag-handle@0.2.0
  - @richkitjs/extension-markdown-shortcuts@0.2.0
  - @richkitjs/extension-paste-handler@0.2.0
  - @richkitjs/extension-hard-break@0.2.0
  - @richkitjs/extension-bookmark@0.2.0
  - @richkitjs/extension-callout@0.2.0
  - @richkitjs/extension-mention@0.2.0
  - @richkitjs/extension-toggle@0.2.0
  - @richkitjs/extension-media@0.2.0
  - @richkitjs/extension-task-list@0.2.0
  - @richkitjs/extension-code-block@0.2.0
  - @richkitjs/extension-image@0.2.0
  - @richkitjs/extension-table@0.2.0
  - @richkitjs/extension-link@0.2.0

## 0.1.0

### Minor Changes

- 534bdf5: Initial public release: headless ProseMirror core, 36 extensions, starter kit, markdown/HTML/DOCX converters, React and Vue 3 bindings.

### Patch Changes

- Updated dependencies [534bdf5]
  - @richkitjs/core@0.1.0
  - @richkitjs/extension-blockquote@0.1.0
  - @richkitjs/extension-bold@0.1.0
  - @richkitjs/extension-bullet-list@0.1.0
  - @richkitjs/extension-case-change@0.1.0
  - @richkitjs/extension-code@0.1.0
  - @richkitjs/extension-code-block@0.1.0
  - @richkitjs/extension-comments@0.1.0
  - @richkitjs/extension-embed@0.1.0
  - @richkitjs/extension-find-replace@0.1.0
  - @richkitjs/extension-heading@0.1.0
  - @richkitjs/extension-highlight@0.1.0
  - @richkitjs/extension-history@0.1.0
  - @richkitjs/extension-horizontal-rule@0.1.0
  - @richkitjs/extension-image@0.1.0
  - @richkitjs/extension-italic@0.1.0
  - @richkitjs/extension-line-height@0.1.0
  - @richkitjs/extension-link@0.1.0
  - @richkitjs/extension-list-item@0.1.0
  - @richkitjs/extension-markdown-shortcuts@0.1.0
  - @richkitjs/extension-ordered-list@0.1.0
  - @richkitjs/extension-page-break@0.1.0
  - @richkitjs/extension-paragraph@0.1.0
  - @richkitjs/extension-paste-handler@0.1.0
  - @richkitjs/extension-placeholder@0.1.0
  - @richkitjs/extension-slash-commands@0.1.0
  - @richkitjs/extension-strike@0.1.0
  - @richkitjs/extension-subscript@0.1.0
  - @richkitjs/extension-superscript@0.1.0
  - @richkitjs/extension-table@0.1.0
  - @richkitjs/extension-task-list@0.1.0
  - @richkitjs/extension-text-align@0.1.0
  - @richkitjs/extension-text-style@0.1.0
  - @richkitjs/extension-track-changes@0.1.0
  - @richkitjs/extension-typography@0.1.0
  - @richkitjs/extension-underline@0.1.0
  - @richkitjs/extension-word-count@0.1.0
