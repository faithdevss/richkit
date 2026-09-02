import type { Editor } from '@richkitjs/core'
import { useState } from 'react'
import { ChevronDownIcon, TableIcon } from '../icons'
import { Popover } from './Popover'

export interface TableMenuProps {
  editor: Editor
  maxRows?: number
  maxCols?: number
}

// Everything prosemirror-tables can do to an existing table. Splitting them out
// keeps the in-table panel one flat list to scan.
const TABLE_ACTIONS: { label: string; cmd: string; separatorBefore?: boolean }[] = [
  { label: 'Add row above', cmd: 'addRowBefore' },
  { label: 'Add row below', cmd: 'addRowAfter' },
  { label: 'Add column left', cmd: 'addColumnBefore' },
  { label: 'Add column right', cmd: 'addColumnAfter' },
  { label: 'Merge cells', cmd: 'mergeCells', separatorBefore: true },
  { label: 'Split cell', cmd: 'splitCell' },
  { label: 'Toggle header row', cmd: 'toggleHeaderRow', separatorBefore: true },
  { label: 'Toggle header column', cmd: 'toggleHeaderColumn' },
  { label: 'Delete row', cmd: 'deleteRow', separatorBefore: true },
  { label: 'Delete column', cmd: 'deleteColumn' },
  { label: 'Delete table', cmd: 'deleteTable' },
]

export function TableMenu({ editor, maxRows = 8, maxCols = 10 }: TableMenuProps) {
  // Inside a table the grid is useless — what you need is row/column editing and
  // a way back out, so the same button switches to the actions list.
  const inTable = editor.isActive('table')
  return (
    <Popover
      className="tb-pop-table"
      trigger={
        <button
          type="button"
          className={`tb-btn tb-btn-split${inTable ? ' is-active' : ''}`}
          title={inTable ? 'Table' : 'Insert table'}
        >
          <TableIcon />
          <ChevronDownIcon className="tb-caret" />
        </button>
      }
    >
      {(close) =>
        inTable ? (
          <div className="tb-menu" role="menu">
            {TABLE_ACTIONS.map((a) => (
              <button
                key={a.cmd}
                type="button"
                role="menuitem"
                className={`tb-menu-item${a.separatorBefore ? ' has-separator' : ''}${
                  a.cmd === 'deleteTable' ? ' is-danger' : ''
                }`}
                onMouseDown={(e) => {
                  e.preventDefault()
                  editor.chain().call(a.cmd).focus().run()
                  close()
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        ) : (
          <TableGrid
            maxRows={maxRows}
            maxCols={maxCols}
            onPick={(rows, cols) => {
              editor.chain().call('insertTable', { rows, cols, withHeaderRow: true }).focus().run()
              close()
            }}
          />
        )
      }
    </Popover>
  )
}

interface GridProps {
  maxRows: number
  maxCols: number
  onPick: (rows: number, cols: number) => void
}

function TableGrid({ maxRows, maxCols, onPick }: GridProps) {
  const [hover, setHover] = useState<{ r: number; c: number }>({ r: 0, c: 0 })
  const [rows, setRows] = useState('3')
  const [cols, setCols] = useState('3')

  return (
    <div className="tb-table-menu">
      <div className="tb-table-label">{hover.r > 0 ? `${hover.r} × ${hover.c}` : 'Pick size'}</div>
      <div
        className="tb-table-grid"
        style={{ gridTemplateColumns: `repeat(${maxCols}, 18px)` }}
        onMouseLeave={() => setHover({ r: 0, c: 0 })}
      >
        {Array.from({ length: maxRows * maxCols }).map((_, i) => {
          const r = Math.floor(i / maxCols) + 1
          const c = (i % maxCols) + 1
          const active = r <= hover.r && c <= hover.c
          return (
            <div
              key={i}
              className={`tb-cell ${active ? 'is-active' : ''}`}
              onMouseEnter={() => setHover({ r, c })}
              onMouseDown={(e) => {
                e.preventDefault()
                onPick(r, c)
              }}
            />
          )
        })}
      </div>
      <div className="tb-table-custom">
        <span>Custom:</span>
        <input
          type="number"
          min={1}
          max={50}
          value={rows}
          onChange={(e) => setRows(e.target.value)}
          aria-label="Rows"
        />
        <span>×</span>
        <input
          type="number"
          min={1}
          max={50}
          value={cols}
          onChange={(e) => setCols(e.target.value)}
          aria-label="Columns"
        />
        <button
          type="button"
          className="tb-table-insert"
          onMouseDown={(e) => {
            e.preventDefault()
            const r = Math.max(1, Math.min(50, parseInt(rows, 10) || 0))
            const c = Math.max(1, Math.min(50, parseInt(cols, 10) || 0))
            onPick(r, c)
          }}
        >
          Insert
        </button>
      </div>
    </div>
  )
}
