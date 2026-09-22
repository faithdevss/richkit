import type { Editor } from '@richkitjs/core'
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import { useEffect, useRef, type ReactNode } from 'react'

export interface BubbleMenuProps {
  editor: Editor | null
  children: ReactNode
  className?: string
}

export function BubbleMenu({ editor, children, className }: BubbleMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editor || !ref.current) return
    const el = ref.current
    el.style.position = 'absolute'
    el.style.visibility = 'hidden'

    const update = () => {
      const { from, to, empty } = editor.state.selection
      // A selection spanning only block boundaries (a double-click past the end
      // of a line) has nothing to format or comment on. Leaf nodes such as
      // images count as content. A read-only or disabled editor gets no menu:
      // its commands would still dispatch and edit the document.
      if (
        !editor.isEditable ||
        empty ||
        !editor.state.doc.textBetween(from, to, '', '\ufffc')
      ) {
        el.style.visibility = 'hidden'
        return
      }
      const start = editor.view.coordsAtPos(from)
      const end = editor.view.coordsAtPos(to)
      const virtual = {
        getBoundingClientRect: () => ({
          x: Math.min(start.left, end.left),
          y: Math.min(start.top, end.top),
          width: Math.abs(end.right - start.left),
          height: Math.abs(end.bottom - start.top),
          top: Math.min(start.top, end.top),
          left: Math.min(start.left, end.left),
          right: Math.max(start.right, end.right),
          bottom: Math.max(start.bottom, end.bottom),
          toJSON() {
            return this
          },
        }),
      }
      void computePosition(virtual, el, {
        placement: 'top',
        middleware: [offset(8), flip(), shift({ padding: 8 })],
      }).then(({ x, y }) => {
        el.style.left = `${x}px`
        el.style.top = `${y}px`
        el.style.visibility = 'visible'
      })
    }

    const offUpdate = editor.on('selectionUpdate', update)
    // Every transaction, not just doc changes, so toggling read-only with a
    // selection in place hides the menu.
    const offDocUpdate = editor.on('transaction', update)
    const cleanup = autoUpdate(
      { getBoundingClientRect: () => el.getBoundingClientRect() },
      el,
      update,
    )

    return () => {
      offUpdate()
      offDocUpdate()
      cleanup()
    }
  }, [editor])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
