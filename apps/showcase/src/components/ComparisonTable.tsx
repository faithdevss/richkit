import {
  COMPARISON_COLUMNS,
  COMPARISON_ROWS,
  type Cell,
  type CellState,
} from '../data/comparison'

const GLYPH: Record<CellState, string> = {
  open: '✓',
  paid: '$',
  partial: '~',
  none: '–',
}

function CellBody({ cell, showNote }: { cell: Cell; showNote: boolean }) {
  return (
    <>
      <span className={`cmp-mark is-${cell.state}`} aria-hidden>
        {GLYPH[cell.state]}
      </span>
      <span className="cmp-label">{cell.label}</span>
      {showNote && cell.note && <span className="cmp-note">{cell.note}</span>}
    </>
  )
}

export function ComparisonTable({ notes = true }: { notes?: boolean }) {
  return (
    <div className="cmp-scroll">
      <table className="cmp-table">
        <thead>
          <tr>
            <th scope="col">Feature</th>
            {COMPARISON_COLUMNS.map((c, i) => (
              <th scope="col" key={c} className={i === 0 ? 'is-us' : undefined}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row) => (
            <tr key={row.feature}>
              <th scope="row">
                <span className="cmp-feature">{row.feature}</span>
                {notes && <span className="cmp-detail">{row.detail}</span>}
              </th>
              {row.cells.map((cell, i) => (
                <td
                  key={COMPARISON_COLUMNS[i]}
                  className={`cmp-cell is-${cell.state}${i === 0 ? ' is-us' : ''}`}
                >
                  <CellBody cell={cell} showNote={notes} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
