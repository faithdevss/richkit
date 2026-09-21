# @richkitjs/extension-drag-handle

## 0.2.1

### Patch Changes

- Updated dependencies [e100235]
- Updated dependencies [bd4933d]
- Updated dependencies [45334ad]
  - @richkitjs/core@0.2.0

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
