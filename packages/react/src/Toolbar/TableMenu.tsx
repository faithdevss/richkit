import type { Editor } from '@richkit/core'
import { useState } from 'react'
import { ChevronDownIcon, TableIcon } from '../icons'
import { Popover } from './Popover'

export interface TableMenuProps {
  editor: Editor
  maxRows?: number
  maxCols?: number
}

export function TableMenu({ editor, maxRows = 8, maxCols = 10 }: TableMenuProps) {
  return (
    <Popover
      className="tb-pop-table"
      trigger={
        <button type="button" className="tb-btn tb-btn-split" title="Insert table">
          <TableIcon />
          <ChevronDownIcon className="tb-caret" />
        </button>
      }
    >
      {(close) => (
        <TableGrid
          maxRows={maxRows}
          maxCols={maxCols}
          onPick={(rows, cols) => {
            editor.chain().call('insertTable', { rows, cols, withHeaderRow: true }).focus().run()
            close()
          }}
        />
      )}
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
