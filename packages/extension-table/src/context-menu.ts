import { NodeSelection, Plugin, PluginKey, TextSelection } from 'prosemirror-state'
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  deleteColumn,
  deleteRow,
  deleteTable,
  mergeCells,
  splitCell,
  toggleHeaderColumn,
  toggleHeaderRow,
} from 'prosemirror-tables'
import type { EditorView } from 'prosemirror-view'

const MENU_CLASS = 'richkit-table-ctx'

interface MenuItem {
  label: string
  onClick: () => void
  disabled?: boolean
  separator?: false
}
interface Separator {
  separator: true
}
type Entry = MenuItem | Separator

interface MenuState {
  el: HTMLDivElement | null
}

export const tableContextKey = new PluginKey('tableContextMenu')

export function tableContextMenu(): Plugin {
  return new Plugin({
    key: tableContextKey,
    view(view) {
      const state: MenuState = { el: null }

      const onContextMenu = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null
        if (!target) return
        const tableEl = target.closest('table')
        if (!tableEl || !view.dom.contains(tableEl)) return
        e.preventDefault()
        openMenu(view, state, e.clientX, e.clientY, tableEl)
      }

      const onWindowClick = (e: MouseEvent) => {
        if (!state.el) return
        if (state.el.contains(e.target as Node)) return
        closeMenu(state)
      }

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeMenu(state)
      }

      view.dom.addEventListener('contextmenu', onContextMenu)
      window.addEventListener('mousedown', onWindowClick)
      window.addEventListener('keydown', onKey)
      window.addEventListener('scroll', () => closeMenu(state), true)

      return {
        destroy() {
          view.dom.removeEventListener('contextmenu', onContextMenu)
          window.removeEventListener('mousedown', onWindowClick)
          window.removeEventListener('keydown', onKey)
          closeMenu(state)
        },
      }
    },
  })
}

function openMenu(
  view: EditorView,
  state: MenuState,
  x: number,
  y: number,
  tableEl: HTMLTableElement,
) {
  closeMenu(state)

  placeCaretInTable(view, tableEl, x, y)

  const run = (fn: (s: typeof view.state, d: typeof view.dispatch) => boolean) => () => {
    fn(view.state, view.dispatch.bind(view))
    view.focus()
    closeMenu(state)
  }

  const selectTable = () => {
    const tablePos = findTablePos(view, tableEl)
    if (tablePos == null) return
    const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, tablePos))
    view.dispatch(tr)
    view.focus()
  }

  const copy = () => {
    selectTable()
    setTimeout(() => {
      document.execCommand('copy')
      closeMenu(state)
    }, 0)
  }

  const cut = () => {
    selectTable()
    setTimeout(() => {
      document.execCommand('cut')
      closeMenu(state)
    }, 0)
  }

  const items: Entry[] = [
    {
      label: 'Select table',
      onClick: () => {
        selectTable()
        closeMenu(state)
      },
    },
    { separator: true },
    { label: 'Cut', onClick: cut },
    { label: 'Copy', onClick: copy },
    { separator: true },
    { label: 'Add row above', onClick: run(addRowBefore) },
    { label: 'Add row below', onClick: run(addRowAfter) },
    { label: 'Add column left', onClick: run(addColumnBefore) },
    { label: 'Add column right', onClick: run(addColumnAfter) },
    { separator: true },
    { label: 'Merge cells', onClick: run(mergeCells) },
    { label: 'Split cell', onClick: run(splitCell) },
    { separator: true },
    { label: 'Toggle header row', onClick: run(toggleHeaderRow) },
    { label: 'Toggle header column', onClick: run(toggleHeaderColumn) },
    { separator: true },
    { label: 'Delete row', onClick: run(deleteRow) },
    { label: 'Delete column', onClick: run(deleteColumn) },
    { label: 'Delete table', onClick: run(deleteTable) },
  ]

  const el = document.createElement('div')
  el.className = MENU_CLASS
  el.setAttribute('role', 'menu')
  el.style.position = 'fixed'
  el.style.zIndex = '40'

  for (const entry of items) {
    if ('separator' in entry && entry.separator) {
      const sep = document.createElement('div')
      sep.className = `${MENU_CLASS}-sep`
      el.appendChild(sep)
      continue
    }
    const item = entry as MenuItem
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = `${MENU_CLASS}-item`
    btn.textContent = item.label
    btn.addEventListener('mousedown', (ev) => {
      ev.preventDefault()
      ev.stopPropagation()
      item.onClick()
    })
    el.appendChild(btn)
  }

  document.body.appendChild(el)
  state.el = el

  const rect = el.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const left = Math.min(x, vw - rect.width - 8)
  const top = Math.min(y, vh - rect.height - 8)
  el.style.left = `${Math.max(4, left)}px`
  el.style.top = `${Math.max(4, top)}px`
}

function closeMenu(state: MenuState) {
  if (state.el) {
    state.el.remove()
    state.el = null
  }
}

function placeCaretInTable(view: EditorView, tableEl: HTMLTableElement, x: number, y: number) {
  try {
    const posInfo = view.posAtCoords({ left: x, top: y })
    if (!posInfo) return
    const $pos = view.state.doc.resolve(posInfo.pos)
    const tr = view.state.tr.setSelection(TextSelection.near($pos))
    view.dispatch(tr)
  } catch {
    void tableEl
  }
}

function findTablePos(view: EditorView, tableEl: HTMLTableElement): number | null {
  try {
    const pos = view.posAtDOM(tableEl, 0)
    if (pos == null) return null
    let p = pos
    for (let i = 0; i < 4; i++) {
      const $p = view.state.doc.resolve(p)
      for (let d = $p.depth; d >= 0; d--) {
        if ($p.node(d).type.name === 'table') {
          return $p.before(d)
        }
      }
      p--
      if (p < 0) break
    }
  } catch {
    // ignore
  }
  return null
}
