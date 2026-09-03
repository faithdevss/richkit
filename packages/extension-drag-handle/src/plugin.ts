import { DOMSerializer, type Node as PMNode } from 'prosemirror-model'
import { NodeSelection, Plugin, PluginKey, TextSelection } from 'prosemirror-state'
import { Decoration, DecorationSet, type EditorView } from 'prosemirror-view'

export interface BlockTarget {
  /** position directly before the block node */
  pos: number
  /** position directly after the block node */
  end: number
  node: PMNode
  dom: HTMLElement
}

export interface DragHandleState {
  /** document position the dragged block would land at, while a drag is live */
  dropPos: number | null
}

export interface DragHandleMeta {
  dropPos: number | null
}

export const dragHandleKey = new PluginKey<DragHandleState>('dragHandle')

/** The top-level block containing `pos`, with the DOM node rendering it. */
export function blockAt(view: EditorView, pos: number): BlockTarget | null {
  const { doc } = view.state
  const clamped = Math.max(0, Math.min(pos, doc.content.size))
  const $pos = doc.resolve(clamped)
  let blockPos: number
  if ($pos.depth === 0) {
    // Between top-level nodes: prefer the one after the position.
    if ($pos.nodeAfter) blockPos = clamped
    else if ($pos.nodeBefore) blockPos = clamped - $pos.nodeBefore.nodeSize
    else return null
  } else {
    blockPos = $pos.before(1)
  }
  const node = doc.nodeAt(blockPos)
  if (!node) return null
  const dom = view.nodeDOM(blockPos)
  if (!(dom instanceof HTMLElement)) return null
  return { pos: blockPos, end: blockPos + node.nodeSize, node, dom }
}

/**
 * The top-level block under the pointer. Horizontal coordinates outside the
 * content column are clamped into it, so the gutter a handle lives in still
 * resolves to the block beside it.
 */
export function blockAtCoords(
  view: EditorView,
  coords: { left: number; top: number },
): BlockTarget | null {
  const rect = view.dom.getBoundingClientRect()
  const left = Math.min(Math.max(coords.left, rect.left + 2), rect.right - 2)
  const found = view.posAtCoords({ left, top: coords.top })
  if (!found) return null
  return blockAt(view, found.inside >= 0 ? found.inside : found.pos)
}

function setDropPos(view: EditorView, dropPos: number | null): void {
  const current = dragHandleKey.getState(view.state)?.dropPos ?? null
  if (current === dropPos) return
  view.dispatch(view.state.tr.setMeta(dragHandleKey, { dropPos } satisfies DragHandleMeta))
}

/** Where a drop at these coordinates would insert: before or after a block. */
function dropPosAt(view: EditorView, coords: { left: number; top: number }): number | null {
  const target = blockAtCoords(view, coords)
  if (!target) return null
  const rect = target.dom.getBoundingClientRect()
  return coords.top > rect.top + rect.height / 2 ? target.end : target.pos
}

/** Puts a NodeSelection on the block, so commands and copy act on all of it. */
export function selectBlock(view: EditorView, pos: number): boolean {
  const node = view.state.doc.nodeAt(pos)
  if (!node) return false
  view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)))
  return true
}

/** Puts the text cursor inside the block, which is what block commands expect. */
export function focusBlock(view: EditorView, pos: number): boolean {
  const node = view.state.doc.nodeAt(pos)
  if (!node) return false
  const $inside = view.state.doc.resolve(Math.min(pos + 1, view.state.doc.content.size))
  view.dispatch(view.state.tr.setSelection(TextSelection.near($inside)))
  view.focus()
  return true
}

export function duplicateBlock(view: EditorView, pos: number): boolean {
  const node = view.state.doc.nodeAt(pos)
  if (!node) return false
  const at = pos + node.nodeSize
  const tr = view.state.tr.insert(at, node.copy(node.content))
  tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(at + 1, tr.doc.content.size))))
  view.dispatch(tr)
  view.focus()
  return true
}

export function deleteBlock(view: EditorView, pos: number): boolean {
  const node = view.state.doc.nodeAt(pos)
  if (!node) return false
  view.dispatch(view.state.tr.delete(pos, pos + node.nodeSize))
  view.focus()
  return true
}

/** Inserts an empty paragraph after the block and returns its position. */
export function insertBlockAfter(view: EditorView, pos: number, text = ''): number | null {
  const node = view.state.doc.nodeAt(pos)
  const paragraph = view.state.schema.nodes['paragraph']
  if (!node || !paragraph) return null
  const at = pos + node.nodeSize
  const content = text ? view.state.schema.text(text) : null
  const tr = view.state.tr.insert(at, paragraph.create(null, content))
  tr.setSelection(TextSelection.near(tr.doc.resolve(at + 1 + text.length)))
  view.dispatch(tr)
  view.focus()
  return at
}

export function blockHTML(view: EditorView, pos: number): string {
  const node = view.state.doc.nodeAt(pos)
  if (!node) return ''
  const dom = DOMSerializer.fromSchema(view.state.schema).serializeNode(node)
  const container = document.createElement('div')
  container.appendChild(dom)
  return container.innerHTML
}

export function blockText(view: EditorView, pos: number): string {
  return view.state.doc.nodeAt(pos)?.textContent ?? ''
}

/**
 * A stable-ish anchor for the block: a slug of its text, or its index in the
 * document when it has none (images, dividers, empty paragraphs).
 */
export function blockAnchorId(view: EditorView, pos: number): string {
  const node = view.state.doc.nodeAt(pos)
  if (!node) return ''
  const slug = node.textContent
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
  if (slug) return slug
  let index = 0
  view.state.doc.forEach((_child, offset) => {
    if (offset < pos) index += 1
  })
  return `block-${index + 1}`
}

/** Anything that ends the hold: the drag finishing, or the reader scrolling. */
const RELEASE_EVENTS = ['drop', 'dragend', 'wheel', 'touchmove', 'keydown'] as const

function scrollableAncestors(el: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = []
  for (let node = el.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node)
    if (/auto|scroll|overlay/.test(`${style.overflowY} ${style.overflowX}`)) out.push(node)
  }
  return out
}

/**
 * Records the scroll positions so a drag can put them back.
 *
 * Chromium scrolls the drag source into view as the drag begins, and it does
 * so *before* any dragstart handler runs — so the positions have to be taken
 * earlier, on mousedown. Call the returned function once the drag has started:
 * it restores what was recorded and holds it until the drag is under way (the
 * first dragover), so a late scroll cannot reintroduce the jump.
 */
export function captureBlockDragScroll(view: EditorView): () => void {
  const nodes = scrollableAncestors(view.dom as HTMLElement)
  const saved = nodes.map((node) => ({ node, top: node.scrollTop, left: node.scrollLeft }))
  const pageX = window.scrollX
  const pageY = window.scrollY

  const restore = () => {
    for (const at of saved) {
      if (at.node.scrollTop !== at.top) at.node.scrollTop = at.top
      if (at.node.scrollLeft !== at.left) at.node.scrollLeft = at.left
    }
    if (window.scrollX !== pageX || window.scrollY !== pageY) window.scrollTo(pageX, pageY)
  }

  return () => {
    // A scroll listener is not enough: the browser applies its scroll between
    // frames, and it can arrive well after the drag begins. Re-asserting every
    // frame is what actually holds the document still.
    //
    // The hold lasts the whole drag, because the browser keeps wanting to
    // bring the selected source back into view — but any deliberate scroll
    // (wheel, touch, keyboard) releases it immediately, so dragging toward an
    // off-screen target still works.
    let frame = 0
    const hold = () => {
      restore()
      frame = requestAnimationFrame(hold)
    }
    const release = () => {
      cancelAnimationFrame(frame)
      for (const type of RELEASE_EVENTS) window.removeEventListener(type, release, true)
    }
    hold()
    for (const type of RELEASE_EVENTS) window.addEventListener(type, release, true)
  }
}

/**
 * Starts a native drag of the whole block. ProseMirror's own drop handling
 * moves it once `view.dragging` is set; the plugin only draws the indicator.
 */
export function startBlockDrag(view: EditorView, target: BlockTarget, event: DragEvent): void {
  selectBlock(view, target.pos)
  const dt = event.dataTransfer
  if (dt) {
    dt.effectAllowed = 'move'
    dt.clearData()
    dt.setData('text/html', blockHTML(view, target.pos))
    dt.setData('text/plain', blockText(view, target.pos))
    dt.setDragImage(target.dom, 12, 12)
  }
  view.dragging = { slice: view.state.selection.content(), move: true }
}

export function dragHandlePlugin(): Plugin<DragHandleState> {
  return new Plugin<DragHandleState>({
    key: dragHandleKey,
    state: {
      init: () => ({ dropPos: null }),
      apply(tr, prev) {
        const meta = tr.getMeta(dragHandleKey) as DragHandleMeta | undefined
        if (meta) return { dropPos: meta.dropPos }
        if (prev.dropPos === null) return prev
        // keep the indicator anchored while the document changes under it
        return { dropPos: tr.mapping.map(prev.dropPos) }
      },
    },
    props: {
      decorations(state) {
        const dropPos = dragHandleKey.getState(state)?.dropPos
        if (dropPos === null || dropPos === undefined) return null
        const widget = Decoration.widget(
          dropPos,
          () => {
            const el = document.createElement('div')
            el.className = 'rk-drop-indicator'
            el.setAttribute('aria-hidden', 'true')
            return el
          },
          { key: 'rk-drop-indicator', side: -1 },
        )
        return DecorationSet.create(state.doc, [widget])
      },
      handleDOMEvents: {
        dragover(view, event) {
          if (!view.dragging) return false
          setDropPos(view, dropPosAt(view, { left: event.clientX, top: event.clientY }))
          return false
        },
        dragleave(view, event) {
          const to = event.relatedTarget
          if (to instanceof Node && view.dom.contains(to)) return false
          setDropPos(view, null)
          return false
        },
        drop(view) {
          setDropPos(view, null)
          return false
        },
        dragend(view) {
          setDropPos(view, null)
          return false
        },
      },
    },
  })
}

export function getDragHandleState(view: EditorView): DragHandleState | undefined {
  return dragHandleKey.getState(view.state)
}
