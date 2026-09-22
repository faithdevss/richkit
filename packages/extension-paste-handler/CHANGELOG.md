# @richkitjs/extension-paste-handler

## 0.2.2

### Patch Changes

- 80bce48: Fixes from integration feedback.

  - **Breaking (styles):** the stylesheet's CSS variables are now prefixed with `--rk-` (`--rk-bg`, `--rk-surface`, `--rk-accent`, …) so they no longer overwrite a host app's own `--bg`, `--surface` or `--text`. Rename any overrides: `--accent` becomes `--rk-accent`.
  - The question card and the formula input follow the theme instead of staying white in dark mode.
  - Lists keep their bullets and numbers under CSS resets such as Tailwind's preflight.
  - `QuestionEditor`: `showPoints` hides the points field; "Add option" and per-row remove controls, bounded by `minOptions` / `maxOptions`; optional `optionIds` in the value stay attached to their option as options are added or removed, with `createOptionId` for new ones. Removing the correct option sets `correct` to `-1`.
  - **Breaking (security):** `markdownToHtml()` now escapes raw HTML by default. Pass `{ extensions }` or `{ schema }` to keep RichKit's own HTML (underline, highlight, tables, sized images) cleaned through the schema, or `{ html: true }` for the previous unfiltered output.
  - Markdown now writes and reads math: `$…$` inline and `$$…$$` for display. Literal dollars are escaped when math is in the schema.
  - Markdown keeps table and image details by falling back to HTML: tables without a header row, merged cells, column widths or rich cell content, and images with a size, alignment or caption.

- Updated dependencies [80bce48]
- Updated dependencies [80bce48]
- Updated dependencies [80bce48]
  - @richkitjs/core@0.3.0
  - @richkitjs/markdown@0.2.0

## 0.2.1

### Patch Changes

- Updated dependencies [e100235]
- Updated dependencies [bd4933d]
- Updated dependencies [f79165d]
- Updated dependencies [45334ad]
  - @richkitjs/core@0.2.0
  - @richkitjs/markdown@0.1.1

## 0.2.0

### Minor Changes

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

## 0.1.0

### Minor Changes

- 534bdf5: Initial public release: headless ProseMirror core, 36 extensions, starter kit, markdown/HTML/DOCX converters, React and Vue 3 bindings.

### Patch Changes

- Updated dependencies [534bdf5]
  - @richkitjs/core@0.1.0
