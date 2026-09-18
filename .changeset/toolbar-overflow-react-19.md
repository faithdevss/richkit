---
'@richkitjs/react': patch
---

Fix toolbar rows never collapsing into the "more" popover under React 19.

`ToolbarOverflow` reset its measuring pass from a `useEffect` keyed on the child count,
which also fired on mount. React 19 batched that reset with the first pass's
`setMeasuring(false)`, so the layout effect never re-ran and the row stayed stuck in
`measuring`, rendering every button and overflowing its width. The reset now happens during
render and only when the child count actually changes.
