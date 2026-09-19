---
'@richkitjs/extension-heading': patch
'@richkitjs/extension-highlight': patch
'@richkitjs/extension-text-align': patch
---

A second click now undoes the first for headings, highlight and alignment.
`setHeading({ level })` on a heading of that level turns it back into a paragraph,
`setHighlight(color)` removes the highlight when the selection already has that color, and
`setTextAlign(align)` resets the alignment when every selected block already has it. The
keyboard shortcuts for headings and alignment still only set.
