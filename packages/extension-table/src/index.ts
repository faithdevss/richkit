import { Extension, Node, type Command } from '@richkitjs/core'
import { NodeSelection, TextSelection } from 'prosemirror-state'
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  columnResizing,
  deleteColumn,
  deleteRow,
  deleteTable,
  goToNextCell,
  mergeCells,
  splitCell,
  tableEditing,
  tableNodes,
  toggleHeaderCell,
  toggleHeaderColumn,
  toggleHeaderRow,
} from 'prosemirror-tables'
import { tableContextMenu } from './context-menu'
import { tableResize } from './resize-plugin'

const specs = tableNodes({
  tableGroup: 'block',
  cellContent: 'block+',
  cellAttributes: {
    height: {
      default: null,
      getFromDOM: (dom) => {
        const h = (dom as HTMLElement).style.height
        const n = h ? parseFloat(h) : NaN
        return Number.isFinite(n) ? n : null
      },
      setDOMAttr: (value, attrs) => {
        if (value == null) return
        const existing = typeof attrs.style === 'string' ? attrs.style : ''
        attrs.style = `${existing}height: ${value}px;`
      },
    },
  },
})

export const Table = Node.create({
  name: 'table',
  group: 'block',
  content: 'table_row+',
  isolating: true,
  addNodeSpec: () => specs.table,
  addCommands: () => ({
    insertTable: (...args: unknown[]): Command => {
      const [opts] = args as [
        { rows?: number; cols?: number; withHeaderRow?: boolean; colWidth?: number }?,
      ]
      const rows = Math.max(1, opts?.rows ?? 3)
      const cols = Math.max(1, opts?.cols ?? 3)
      const withHeader = opts?.withHeaderRow ?? true
      const colWidth = opts?.colWidth ?? 120
      return ({ state, dispatch }) => {
        const tableType = state.schema.nodes['table']
        const rowType = state.schema.nodes['table_row']
        const cellType = state.schema.nodes['table_cell']
        const headerType = state.schema.nodes['table_header']
        if (!tableType || !rowType || !cellType || !headerType) return false
        const buildCell = (header: boolean) =>
          (header ? headerType : cellType).createAndFill({ colwidth: [colWidth] })!
        const buildRow = (isHeader: boolean) =>
          rowType.create(
            null,
            Array.from({ length: cols }, () => buildCell(isHeader)),
          )
        const tableRows = []
        for (let r = 0; r < rows; r++) tableRows.push(buildRow(r === 0 && withHeader))
        const tableNode = tableType.create(null, tableRows)

        let tr = state.tr
        let insertPos: number
        const { $from, empty } = state.selection
        if (empty && $from.parent.isTextblock && $from.parent.content.size === 0) {
          insertPos = $from.before($from.depth)
          tr = tr.replaceWith(insertPos, insertPos + $from.parent.nodeSize, tableNode)
        } else if (empty && $from.parent.isTextblock) {
          insertPos = $from.after($from.depth)
          tr = tr.insert(insertPos, tableNode)
        } else {
          insertPos = state.selection.from
          tr = tr.replaceSelectionWith(tableNode)
        }
        // Land the cursor in the first cell. Without this the selection stays
        // wherever it was, outside the new table, and every table command —
        // deleteTable included — reports false until the user clicks a cell.
        const firstCell = tr.doc.resolve(Math.min(insertPos + 3, tr.doc.content.size))
        tr = tr.setSelection(TextSelection.near(firstCell))
        if (dispatch) dispatch(tr.scrollIntoView())
        return true
      }
    },
    addColumnBefore:
      () =>
      ({ state, dispatch }) =>
        addColumnBefore(state, dispatch ?? undefined),
    addColumnAfter:
      () =>
      ({ state, dispatch }) =>
        addColumnAfter(state, dispatch ?? undefined),
    addRowBefore:
      () =>
      ({ state, dispatch }) =>
        addRowBefore(state, dispatch ?? undefined),
    addRowAfter:
      () =>
      ({ state, dispatch }) =>
        addRowAfter(state, dispatch ?? undefined),
    deleteColumn:
      () =>
      ({ state, dispatch }) =>
        deleteColumn(state, dispatch ?? undefined),
    deleteRow:
      () =>
      ({ state, dispatch }) =>
        deleteRow(state, dispatch ?? undefined),
    deleteTable:
      () =>
      ({ state, dispatch }) =>
        deleteTable(state, dispatch ?? undefined),
    mergeCells:
      () =>
      ({ state, dispatch }) =>
        mergeCells(state, dispatch ?? undefined),
    splitCell:
      () =>
      ({ state, dispatch }) =>
        splitCell(state, dispatch ?? undefined),
    toggleHeaderRow:
      () =>
      ({ state, dispatch }) =>
        toggleHeaderRow(state, dispatch ?? undefined),
    toggleHeaderColumn:
      () =>
      ({ state, dispatch }) =>
        toggleHeaderColumn(state, dispatch ?? undefined),
    toggleHeaderCell:
      () =>
      ({ state, dispatch }) =>
        toggleHeaderCell(state, dispatch ?? undefined),
    selectTable:
      (): Command =>
      ({ state, dispatch }) => {
        const { $from } = state.selection
        for (let depth = $from.depth; depth > 0; depth--) {
          const node = $from.node(depth)
          if (node.type.name === 'table') {
            const pos = $from.before(depth)
            if (dispatch) dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)))
            return true
          }
        }
        return false
      },
  }),
})

export const TableRow = Node.create({
  name: 'table_row',
  content: '(table_cell | table_header)*',
  addNodeSpec: () => specs.table_row,
})

export const TableCell = Node.create({
  name: 'table_cell',
  content: 'block+',
  isolating: true,
  addNodeSpec: () => specs.table_cell,
})

export const TableHeader = Node.create({
  name: 'table_header',
  content: 'block+',
  isolating: true,
  addNodeSpec: () => specs.table_header,
})

function nextCell(direction: 1 | -1): Command {
  return ({ state, dispatch }) => goToNextCell(direction)(state, dispatch ?? undefined)
}

export const TablePlugins = Extension.create({
  name: 'tablePlugins',
  // Tab is the spreadsheet-style cell walk. It only claims the key inside a
  // table, so list indentation keeps it everywhere else.
  addKeyboardShortcuts: () => ({
    Tab: nextCell(1),
    'Shift-Tab': nextCell(-1),
  }),
  addProseMirrorPlugins: () => [
    columnResizing(),
    tableEditing(),
    tableResize(),
    tableContextMenu(),
  ],
})

export const TableKit = [Table, TableRow, TableCell, TableHeader, TablePlugins]
