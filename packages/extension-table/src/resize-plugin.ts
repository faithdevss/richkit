import { Plugin, PluginKey } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

export const tableResizeKey = new PluginKey('tableResize')

const CORNER_CLASS = 'richkit-table-corner'
const ROW_HANDLE_CLASS = 'richkit-table-row-handle'
const OVERLAY_CLASS = 'richkit-table-overlay'
const MIN_COL = 40
const MIN_ROW = 24

interface HandleSet {
  table: HTMLTableElement
  corner: HTMLDivElement
  rowHandles: HTMLDivElement[]
}

interface State {
  overlay: HTMLDivElement
  handles: HandleSet[]
  raf: number | null
}

export function tableResize(): Plugin {
  return new Plugin({
    key: tableResizeKey,
    view(view) {
      const overlay = document.createElement('div')
      overlay.className = OVERLAY_CLASS
      overlay.style.cssText =
        'position:fixed;top:0;left:0;pointer-events:none;z-index:30;width:0;height:0'
      document.body.appendChild(overlay)

      const state: State = { overlay, handles: [], raf: null }
      const schedule = () => {
        if (state.raf != null) return
        state.raf = requestAnimationFrame(() => {
          state.raf = null
          syncOverlay(view, state)
        })
      }

      schedule()
      window.addEventListener('scroll', schedule, true)
      window.addEventListener('resize', schedule)

      return {
        update: schedule,
        destroy() {
          if (state.raf != null) cancelAnimationFrame(state.raf)
          window.removeEventListener('scroll', schedule, true)
          window.removeEventListener('resize', schedule)
          state.overlay.remove()
        },
      }
    },
  })
}

function syncOverlay(view: EditorView, state: State) {
  const tables = Array.from(view.dom.querySelectorAll<HTMLTableElement>('table'))

  while (state.handles.length > tables.length) {
    const old = state.handles.pop()!
    old.corner.remove()
    old.rowHandles.forEach((h) => h.remove())
  }

  tables.forEach((table, i) => {
    let set = state.handles[i]
    const rowCount = table.rows.length
    if (!set || set.table !== table || set.rowHandles.length !== rowCount) {
      if (set) {
        set.corner.remove()
        set.rowHandles.forEach((h) => h.remove())
      }
      set = createHandles(view, state.overlay, table)
      state.handles[i] = set
    }
    positionHandles(set, table)
  })
}

function createHandles(view: EditorView, overlay: HTMLElement, table: HTMLTableElement): HandleSet {
  const corner = document.createElement('div')
  corner.className = CORNER_CLASS
  corner.setAttribute('title', 'Drag to resize table')
  corner.style.pointerEvents = 'auto'
  corner.innerHTML =
    '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
    '<path d="M14 4v10H4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
    '<path d="M9 14h5v-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>'
  corner.addEventListener('mousedown', (e) => startCornerDrag(view, e, table))
  overlay.appendChild(corner)

  const rows = Array.from(table.rows)
  const rowHandles = rows.map((_, idx) => {
    const el = document.createElement('div')
    el.className = ROW_HANDLE_CLASS
    el.setAttribute('title', 'Drag to resize row')
    el.style.pointerEvents = 'auto'
    el.addEventListener('mousedown', (e) => startRowDrag(view, e, table, idx))
    overlay.appendChild(el)
    return el
  })

  return { table, corner, rowHandles }
}

interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * The part of the viewport where `el` can actually be seen: the viewport
 * intersected with every clipping ancestor. The handles live in a fixed
 * overlay on <body>, so nothing clips them for us — without this they float
 * over the toolbar, or past the frame, once the table scrolls out of view.
 */
function visibleArea(el: HTMLElement): Box {
  const box: Box = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const style = getComputedStyle(p)
    if (style.overflowX === 'visible' && style.overflowY === 'visible') continue
    const r = p.getBoundingClientRect()
    box.left = Math.max(box.left, r.left)
    box.top = Math.max(box.top, r.top)
    box.right = Math.min(box.right, r.right)
    box.bottom = Math.min(box.bottom, r.bottom)
  }
  return box
}

const SLACK = 2

function positionHandles(set: HandleSet, table: HTMLTableElement) {
  const rect = table.getBoundingClientRect()
  const area = visibleArea(table)
  const shown = rect.width > 0 && rect.height > 0

  const cornerVisible =
    shown &&
    rect.right >= area.left - SLACK &&
    rect.right <= area.right + SLACK &&
    rect.bottom >= area.top - SLACK &&
    rect.bottom <= area.bottom + SLACK
  set.corner.style.display = cornerVisible ? '' : 'none'
  set.corner.style.left = `${rect.right - 8}px`
  set.corner.style.top = `${rect.bottom - 8}px`

  const rows = Array.from(table.rows)
  while (set.rowHandles.length > rows.length) {
    set.rowHandles.pop()!.remove()
  }
  rows.forEach((row, i) => {
    const h = set.rowHandles[i]
    if (!h) return
    const r = row.getBoundingClientRect()
    const left = Math.max(rect.left, area.left)
    const right = Math.min(rect.right, area.right)
    const visible = shown && right > left && r.bottom >= area.top && r.bottom <= area.bottom
    h.style.display = visible ? '' : 'none'
    h.style.left = `${left}px`
    h.style.top = `${r.bottom - 3}px`
    h.style.width = `${Math.max(0, right - left)}px`
    h.style.height = '6px'
  })
}

function startCornerDrag(view: EditorView, e: MouseEvent, table: HTMLTableElement) {
  e.preventDefault()
  e.stopPropagation()

  const startX = e.clientX
  const startY = e.clientY
  const startWidth = table.offsetWidth
  const startHeight = table.offsetHeight

  const colgroup = table.querySelector(':scope > colgroup')
  const cols = colgroup ? (Array.from(colgroup.children) as HTMLTableColElement[]) : []
  const startColWidths = cols.map(
    (c) => parseFloat(c.style.width) || c.getBoundingClientRect().width,
  )

  const rows = Array.from(table.rows)
  const startRowHeights = rows.map((r) => r.getBoundingClientRect().height)

  const totalColWidth = startColWidths.reduce((s, w) => s + w, 0) || startWidth
  const wrapper = table.parentElement as HTMLElement | null
  const editorEl = wrapper?.closest<HTMLElement>('.ProseMirror')
  const maxTableWidth = editorEl
    ? editorEl.clientWidth -
      (table.getBoundingClientRect().left - editorEl.getBoundingClientRect().left) -
      8
    : Number.POSITIVE_INFINITY

  let lastColWidths: number[] = [...startColWidths]
  let lastRowHeights: number[] = [...startRowHeights]

  const onMove = (ev: MouseEvent) => {
    const dx = ev.clientX - startX
    const dy = ev.clientY - startY
    const minColScale = (MIN_COL * cols.length) / Math.max(totalColWidth, 1)
    const maxColScale =
      maxTableWidth > 0 ? maxTableWidth / Math.max(totalColWidth, 1) : Number.POSITIVE_INFINITY
    let scaleX = (totalColWidth + dx) / Math.max(totalColWidth, 1)
    scaleX = Math.max(minColScale, Math.min(scaleX, maxColScale))
    const minRowScale = (MIN_ROW * rows.length) / Math.max(startHeight, 1)
    let scaleY = (startHeight + dy) / Math.max(startHeight, 1)
    scaleY = Math.max(minRowScale, scaleY)

    lastColWidths = startColWidths.map((w) => Math.max(MIN_COL, w * scaleX))
    lastRowHeights = startRowHeights.map((h) => Math.max(MIN_ROW, h * scaleY))

    cols.forEach((col, i) => {
      col.style.width = `${lastColWidths[i]}px`
    })
    rows.forEach((row, i) => {
      Array.from(row.cells).forEach((cell) => {
        cell.style.height = `${lastRowHeights[i]}px`
      })
    })
  }

  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    commitTableDimsExplicit(
      view,
      table,
      lastColWidths.map(Math.round),
      lastRowHeights.map(Math.round),
    )
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function startRowDrag(view: EditorView, e: MouseEvent, table: HTMLTableElement, rowIndex: number) {
  e.preventDefault()
  e.stopPropagation()

  const row = table.rows[rowIndex]
  if (!row) return
  const startY = e.clientY
  const startHeight = row.getBoundingClientRect().height
  const cells = Array.from(row.cells)
  let lastHeight = startHeight

  const onMove = (ev: MouseEvent) => {
    const dy = ev.clientY - startY
    lastHeight = Math.max(MIN_ROW, startHeight + dy)
    cells.forEach((cell) => {
      cell.style.height = `${lastHeight}px`
    })
  }

  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    commitRowHeight(view, table, rowIndex, Math.round(lastHeight))
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function commitTableDimsExplicit(
  view: EditorView,
  tableDOM: HTMLTableElement,
  colWidths: number[],
  rowHeights: number[],
) {
  const tr = view.state.tr
  let changed = false

  Array.from(tableDOM.rows).forEach((rowDOM, rowIdx) => {
    Array.from(rowDOM.cells).forEach((cellDOM, colIdx) => {
      const pos = cellPos(view, cellDOM)
      if (pos == null) return
      const node = tr.doc.nodeAt(pos)
      if (!node) return
      const nextColwidth = colIdx < colWidths.length ? [colWidths[colIdx]] : null
      const attrs = {
        ...node.attrs,
        colwidth: nextColwidth,
        height: rowHeights[rowIdx] ?? node.attrs.height,
      }
      tr.setNodeMarkup(pos, undefined, attrs)
      changed = true
    })
  })

  if (changed) view.dispatch(tr)
}

function commitRowHeight(
  view: EditorView,
  tableDOM: HTMLTableElement,
  rowIndex: number,
  height: number,
) {
  const tr = view.state.tr
  const rowDOM = tableDOM.rows[rowIndex]
  if (!rowDOM) return
  let changed = false
  Array.from(rowDOM.cells).forEach((cellDOM) => {
    const pos = cellPos(view, cellDOM)
    if (pos == null) return
    const node = tr.doc.nodeAt(pos)
    if (!node) return
    tr.setNodeMarkup(pos, undefined, { ...node.attrs, height })
    changed = true
  })
  if (changed) view.dispatch(tr)
}

function cellPos(view: EditorView, cellDOM: HTMLElement): number | null {
  try {
    const inner = view.posAtDOM(cellDOM, 0)
    if (inner == null) return null
    return inner - 1
  } catch {
    return null
  }
}
