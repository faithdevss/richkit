# @richkitjs/extension-task-list

## 0.2.1

### Patch Changes

- bd4933d: List buttons now toggle. `toggleBulletList`, `toggleOrderedList` and `toggleTaskList` were plain
  `wrapInList`, so clicking one inside a list did nothing. They now use the new core `toggleList`
  command: inside a list of the same type the selected items are lifted out, inside a list of
  another type that list is converted in place (items retyped for task lists), and outside a list
  the selection is wrapped as before. The list-style commands convert instead of nesting too.
- Updated dependencies [e100235]
- Updated dependencies [bd4933d]
- Updated dependencies [45334ad]
  - @richkitjs/core@0.2.0

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
