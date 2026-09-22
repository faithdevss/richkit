# @richkitjs/extension-heading

## 0.1.2

### Patch Changes

- Updated dependencies [80bce48]
- Updated dependencies [80bce48]
  - @richkitjs/core@0.3.0

## 0.1.1

### Patch Changes

- 04b4cc6: A second click now undoes the first for headings, highlight and alignment.
  `setHeading({ level })` on a heading of that level turns it back into a paragraph,
  `setHighlight(color)` removes the highlight when the selection already has that color, and
  `setTextAlign(align)` resets the alignment when every selected block already has it. The
  keyboard shortcuts for headings and alignment still only set.
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
