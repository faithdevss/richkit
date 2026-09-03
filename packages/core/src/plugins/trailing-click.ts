import { Plugin, TextSelection } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

/** How far the pointer may travel and still count as a click, in pixels. */
const SLOP = 3

/** True when the pointer is in the editor's own space under the last block. */
function belowContent(view: EditorView, event: MouseEvent): boolean {
  // the editor's background, not a block, a widget or a menu drawn inside it
  if (event.target !== view.dom) return false
  const last = view.dom.lastElementChild
  return !!last && event.clientY > last.getBoundingClientRect().bottom
}

/**
 * Clicking the empty space under the last block starts a new paragraph there.
 *
 * ProseMirror puts the caret in the nearest text position instead, which is
 * inside the trailing block — so a document that ends in a code block or a
 * table has no way to grow with the mouse. Notion-style editors always leave
 * that landing strip, and this keeps it without stuffing a permanent empty
 * paragraph into every document.
 *
 * The press and the release both have to land on that empty space: a drag that
 * merely ends there is a text selection, and a menu that closes on mousedown
 * would otherwise release onto the background and add a stray block.
 */
export function trailingClick(): Plugin {
  let press: { x: number; y: number } | null = null

  return new Plugin({
    props: {
      handleDOMEvents: {
        mousedown: (view, event) => {
          press =
            view.editable && event.button === 0 && belowContent(view, event)
              ? { x: event.clientX, y: event.clientY }
              : null
          return false
        },
        mouseup: (view, event) => {
          const start = press
          press = null
          if (!start || !belowContent(view, event)) return false
          if (Math.abs(event.clientX - start.x) > SLOP) return false
          if (Math.abs(event.clientY - start.y) > SLOP) return false

          const { state } = view
          const paragraph = state.schema.nodes['paragraph']
          if (!paragraph) return false
          const tail = state.doc.lastChild
          // an empty paragraph is already a landing strip — ProseMirror has
          // put the caret there itself
          if (tail && tail.type === paragraph && tail.content.size === 0) return false

          const end = state.doc.content.size
          const tr = state.tr.insert(end, paragraph.create())
          tr.setSelection(TextSelection.near(tr.doc.resolve(end + 1)))
          view.dispatch(tr.scrollIntoView())
          view.focus()
          return true
        },
      },
    },
  })
}
