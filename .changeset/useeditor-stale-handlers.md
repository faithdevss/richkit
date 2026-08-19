---
'@richkitjs/react': patch
---

Fix `useEditor` freezing event handlers at mount.

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
