# @richkitjs/react

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
