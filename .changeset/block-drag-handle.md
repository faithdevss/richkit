---
'@richkitjs/extension-drag-handle': minor
'@richkitjs/starter-kit': minor
'@richkitjs/react': minor
---

Add block drag handles and a block actions menu.

`@richkitjs/extension-drag-handle` is a new package: it resolves the top-level block under
a pointer, starts a native drag for it, draws a drop indicator while one is in flight, and
exposes block operations (`duplicateBlock`, `deleteBlock`, `insertBlockAfter`, `blockHTML`,
`blockAnchorId`, …). It binds <kbd>Mod+D</kbd> to duplicate the current block and ships in
`StarterKit`.

`@richkitjs/react` gains `<BlockHandle>`, the gutter UI over it — an insert button, a drag
handle, and a menu with Turn Into, Duplicate node, Copy to clipboard, Copy anchor link, and
Delete. `SlashItem` also gained an optional `group`, so the slash menu now renders sectioned
lists, and the default items carry icons.
