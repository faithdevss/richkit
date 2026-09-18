# @richkitjs/starter-kit

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
