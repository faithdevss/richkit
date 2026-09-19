---
'@richkitjs/core': minor
'@richkitjs/extension-bullet-list': patch
'@richkitjs/extension-ordered-list': patch
'@richkitjs/extension-task-list': patch
---

List buttons now toggle. `toggleBulletList`, `toggleOrderedList` and `toggleTaskList` were plain
`wrapInList`, so clicking one inside a list did nothing. They now use the new core `toggleList`
command: inside a list of the same type the selected items are lifted out, inside a list of
another type that list is converted in place (items retyped for task lists), and outside a list
the selection is wrapped as before. The list-style commands convert instead of nesting too.
