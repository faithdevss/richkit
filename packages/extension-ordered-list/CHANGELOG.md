# @richkitjs/extension-ordered-list

## 0.1.2

### Patch Changes

- Updated dependencies [80bce48]
- Updated dependencies [80bce48]
  - @richkitjs/core@0.3.0

## 0.1.1

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

## 0.1.0

### Minor Changes

- 534bdf5: Initial public release: headless ProseMirror core, 36 extensions, starter kit, markdown/HTML/DOCX converters, React and Vue 3 bindings.

### Patch Changes

- Updated dependencies [534bdf5]
  - @richkitjs/core@0.1.0
