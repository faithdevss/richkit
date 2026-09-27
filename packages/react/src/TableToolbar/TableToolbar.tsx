import type { Editor } from '@richkitjs/core'
import { useRef } from 'react'
import { useEditorAnchor } from '../Floating/useEditorAnchor'
import { ChevronDownIcon, TrashIcon } from '../icons'
import { MenuItem, MenuList, MenuSeparator } from '../Menu/MenuList'
import { Popover } from '../Toolbar/Popover'

export interface TableToolbarProps {
  editor: Editor | null
  className?: string
}

interface Action {
  label: string
  cmd: string
  danger?: boolean
}

const ROW: (Action | 'sep')[] = [
  { label: 'Insert row above', cmd: 'addRowBefore' },
  { label: 'Insert row below', cmd: 'addRowAfter' },
  'sep',
  { label: 'Toggle header row', cmd: 'toggleHeaderRow' },
  'sep',
  { label: 'Delete row', cmd: 'deleteRow', danger: true },
]
const COLUMN: (Action | 'sep')[] = [
  { label: 'Insert column left', cmd: 'addColumnBefore' },
  { label: 'Insert column right', cmd: 'addColumnAfter' },
  'sep',
  { label: 'Toggle header column', cmd: 'toggleHeaderColumn' },
  'sep',
  { label: 'Delete column', cmd: 'deleteColumn', danger: true },
]
const CELL: (Action | 'sep')[] = [
  { label: 'Merge cells', cmd: 'mergeCells' },
  { label: 'Split cell', cmd: 'splitCell' },
]

/** The table the selection is in, as its document position and DOM node. */
function currentTable(editor: Editor): { pos: number; dom: HTMLElement } | null {
  const { $from } = editor.state.selection
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name !== 'table') continue
    const pos = $from.before(d)
    const dom = editor.view.nodeDOM(pos)
    return dom instanceof HTMLElement ? { pos, dom } : null
  }
  return null
}

/**
 * Floats above the table the cursor is in with row, column and cell actions —
 * the same commands as the table right-click menu, for people who never
 * right-click. Needs the Table extension.
 */
export function TableToolbar({ editor, className }: TableToolbarProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEditorAnchor(
    editor,
    ref,
    (ed) => {
      if (!ed.isEditable) return null
      const table = currentTable(ed)
      if (!table) return null
      return { key: String(table.pos), rect: table.dom.getBoundingClientRect() }
    },
    'top-start',
  )

  const run = (cmd: string) => editor?.chain().call(cmd).focus().run()

  const menu = (label: string, actions: (Action | 'sep')[]) => (
    <Popover
      className="rk-table-toolbar-pop"
      trigger={
        <button type="button" className="tb-btn rk-table-toolbar-btn" aria-haspopup="menu">
          <span>{label}</span>
          <ChevronDownIcon className="tb-caret" />
        </button>
      }
    >
      {(close) => (
        <MenuList inline className="tb-menu" aria-label={`${label} actions`}>
          {actions.map((a, i) =>
            a === 'sep' ? (
              <MenuSeparator key={`sep-${i}`} />
            ) : (
              <MenuItem
                key={a.cmd}
                danger={a.danger}
                onSelect={() => {
                  run(a.cmd)
                  close()
                }}
              >
                {a.label}
              </MenuItem>
            ),
          )}
        </MenuList>
      )}
    </Popover>
  )

  return (
    <div
      ref={ref}
      className={`rk-table-toolbar${className ? ` ${className}` : ''}`}
      role="toolbar"
      aria-label="Table"
    >
      {editor && (
        <>
          {menu('Row', ROW)}
          {menu('Column', COLUMN)}
          {menu('Cell', CELL)}
          <span className="rk-float-sep" />
          <button
            type="button"
            className="tb-btn rk-table-toolbar-btn is-danger"
            title="Delete table"
            aria-label="Delete table"
            onMouseDown={(e) => {
              e.preventDefault()
              run('deleteTable')
            }}
            onClick={(e) => {
              if (e.detail === 0) run('deleteTable')
            }}
          >
            <TrashIcon />
          </button>
        </>
      )}
    </div>
  )
}
