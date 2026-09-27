import type { Editor } from '@richkitjs/core'
import { autoUpdate, computePosition, flip, offset, shift, type Placement } from '@floating-ui/dom'
import { useEffect, useRef, useState, type RefObject } from 'react'

/** Viewport rectangle a floating element is pinned to. */
export type AnchorRect = Pick<
  DOMRect,
  'x' | 'y' | 'width' | 'height' | 'top' | 'left' | 'right' | 'bottom'
>

/**
 * Pins `ref` next to whatever `getAnchor` returns for the current editor
 * state, re-measuring on every transaction, scroll and resize. Returns an
 * `anchorKey` that changes whenever the anchor appears, disappears or moves
 * to another place in the document, so a component can reset its own state
 * (an open edit form, say) when it follows the cursor somewhere else.
 */
export function useEditorAnchor(
  editor: Editor | null,
  ref: RefObject<HTMLElement | null>,
  getAnchor: (editor: Editor) => { key: string; rect: AnchorRect } | null,
  placement: Placement = 'bottom-start',
): string | null {
  const [anchorKey, setAnchorKey] = useState<string | null>(null)
  const getAnchorRef = useRef(getAnchor)
  getAnchorRef.current = getAnchor

  useEffect(() => {
    const el = ref.current
    if (!editor || !el) return
    el.style.position = 'absolute'
    el.style.visibility = 'hidden'

    // computePosition resolves async; a hide that lands first must win
    let seq = 0
    const hide = () => {
      seq++
      el.style.visibility = 'hidden'
      setAnchorKey(null)
    }
    const update = () => {
      // the element may be mid-unmount when a late transaction lands
      if (editor.isDestroyed) return
      // only while someone is working in this editor (or in the element)
      const focused = editor.view.hasFocus() || el.contains(document.activeElement)
      const anchor = focused ? getAnchorRef.current(editor) : null
      if (!anchor) return hide()
      setAnchorKey(anchor.key)
      const mine = ++seq
      // copy the fields: a DOMRect's are prototype getters, lost to a spread
      const { x, y, width, height, top, left, right, bottom } = anchor.rect
      const rect = { x, y, width, height, top, left, right, bottom }
      const virtual = { getBoundingClientRect: () => ({ ...rect, toJSON: () => rect }) }
      void computePosition(virtual, el, {
        placement,
        middleware: [offset(6), flip(), shift({ padding: 8 })],
      }).then((pos) => {
        if (mine !== seq) return
        el.style.left = `${pos.x}px`
        el.style.top = `${pos.y}px`
        el.style.visibility = 'visible'
      })
    }

    const offTransaction = editor.on('transaction', update)
    // focus moving between the editor and the element keeps it open;
    // leaving both closes it
    const offBlur = editor.on('blur', ({ event }) => {
      if (!el.contains(event.relatedTarget as Node | null)) hide()
    })
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null
      if (!el.contains(next) && !editor.view.dom.contains(next)) hide()
    }
    el.addEventListener('focusout', onFocusOut)
    const offFocus = editor.on('focus', update)
    const stop = autoUpdate(editor.view.dom, el, update)
    update()

    return () => {
      offTransaction()
      offBlur()
      offFocus()
      el.removeEventListener('focusout', onFocusOut)
      stop()
    }
  }, [editor, ref, placement])

  return anchorKey
}

/** Bounding box of a document range, from ProseMirror's coordinates. */
export function rangeRect(editor: Editor, from: number, to: number): AnchorRect {
  const start = editor.view.coordsAtPos(from)
  const end = editor.view.coordsAtPos(to)
  const left = Math.min(start.left, end.left)
  const right = Math.max(start.right, end.right)
  const top = Math.min(start.top, end.top)
  const bottom = Math.max(start.bottom, end.bottom)
  return { x: left, y: top, left, top, right, bottom, width: right - left, height: bottom - top }
}
