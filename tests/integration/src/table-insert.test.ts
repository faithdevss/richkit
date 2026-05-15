import { Editor } from '@rich-editor/core'
import { Paragraph } from '@rich-editor/extension-paragraph'
import { TextSelection } from 'prosemirror-state'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Table, TableCell, TableHeader, TablePlugins, TableRow } from '@rich-editor/extension-table'

function makeEditor(content = '<p></p>'): Editor {
  const element = document.createElement('div')
  document.body.appendChild(element)
  return new Editor({
    element,
    extensions: [Paragraph, Table, TableRow, TableCell, TableHeader, TablePlugins],
    content,
  })
}

let editor: Editor

beforeEach(() => {
  editor = makeEditor()
})

afterEach(() => {
  editor.destroy()
  document.body.innerHTML = ''
})

describe('insertTable command', () => {
  it('inserts default 3x3 table with header row', () => {
    const ok = editor.command('insertTable')
    expect(ok).toBe(true)
    let tableCount = 0
    let rowCount = 0
    let headerCount = 0
    let cellCount = 0
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'table') tableCount++
      if (node.type.name === 'table_row') rowCount++
      if (node.type.name === 'table_header') headerCount++
      if (node.type.name === 'table_cell') cellCount++
      return true
    })
    expect(tableCount).toBe(1)
    expect(rowCount).toBe(3)
    expect(headerCount).toBe(3)
    expect(cellCount).toBe(6)
  })

  it('honors custom rows/cols', () => {
    editor.command('insertTable', { rows: 4, cols: 5, withHeaderRow: true })
    let rowCount = 0
    let cellPlusHeader = 0
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'table_row') rowCount++
      if (node.type.name === 'table_cell' || node.type.name === 'table_header') cellPlusHeader++
      return true
    })
    expect(rowCount).toBe(4)
    expect(cellPlusHeader).toBe(20)
  })

  it('skips header row when withHeaderRow=false', () => {
    editor.command('insertTable', { rows: 2, cols: 2, withHeaderRow: false })
    let headerCount = 0
    let cellCount = 0
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'table_header') headerCount++
      if (node.type.name === 'table_cell') cellCount++
      return true
    })
    expect(headerCount).toBe(0)
    expect(cellCount).toBe(4)
  })

  it('sets colwidth on cells', () => {
    editor.command('insertTable', { rows: 2, cols: 3, colWidth: 80 })
    const cells: { colwidth: number[] | null }[] = []
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'table_cell' || node.type.name === 'table_header') {
        cells.push({ colwidth: node.attrs.colwidth as number[] | null })
      }
      return true
    })
    expect(cells).toHaveLength(6)
    for (const c of cells) expect(c.colwidth).toEqual([80])
  })

  it('clamps rows/cols to minimum 1', () => {
    editor.command('insertTable', { rows: 0, cols: 0 })
    let rowCount = 0
    let cellCount = 0
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'table_row') rowCount++
      if (node.type.name === 'table_cell' || node.type.name === 'table_header') cellCount++
      return true
    })
    expect(rowCount).toBe(1)
    expect(cellCount).toBe(1)
  })

  it('inserts table when cursor is in empty paragraph (replaces paragraph)', () => {
    expect(editor.state.doc.childCount).toBe(1)
    expect(editor.state.doc.firstChild?.type.name).toBe('paragraph')
    editor.command('insertTable', { rows: 2, cols: 2 })
    expect(editor.state.doc.firstChild?.type.name).toBe('table')
  })

  it('inserts table after non-empty paragraph (preserves text)', () => {
    editor.setContent('<p>Hello world</p>')
    editor.command('insertTable', { rows: 2, cols: 2 })
    const types: string[] = []
    editor.state.doc.forEach((n) => types.push(n.type.name))
    expect(types).toContain('paragraph')
    expect(types).toContain('table')
    expect(editor.getText()).toContain('Hello world')
  })

  it('insertTable returns true', () => {
    const ok = editor.command('insertTable')
    expect(ok).toBe(true)
  })

  it('chain().call("insertTable") inserts a table', () => {
    const ok = editor.chain().call('insertTable', { rows: 2, cols: 3 }).run()
    expect(ok).toBe(true)
    let tableFound = false
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'table') tableFound = true
      return true
    })
    expect(tableFound).toBe(true)
  })

  it('handles cursor in middle of paragraph', () => {
    editor.setContent('<p>Hello</p>')
    const tr = editor.view.state.tr.setSelection(
      TextSelection.create(editor.view.state.doc, 3),
    )
    editor.view.dispatch(tr)
    editor.command('insertTable', { rows: 2, cols: 2 })
    let tableFound = false
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'table') tableFound = true
      return true
    })
    expect(tableFound).toBe(true)
  })
})

describe('table manipulation', () => {
  beforeEach(() => {
    editor.command('insertTable', { rows: 2, cols: 2 })
  })

  it('addRowAfter increases row count', () => {
    let before = 0
    editor.state.doc.descendants((n) => {
      if (n.type.name === 'table_row') before++
      return true
    })
    placeCursorInFirstCell(editor)
    editor.command('addRowAfter')
    let after = 0
    editor.state.doc.descendants((n) => {
      if (n.type.name === 'table_row') after++
      return true
    })
    expect(after).toBe(before + 1)
  })

  it('addColumnAfter increases column count', () => {
    placeCursorInFirstCell(editor)
    editor.command('addColumnAfter')
    let perRow = 0
    let rows = 0
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'table_row') {
        rows++
        if (rows === 1) {
          node.forEach(() => perRow++)
        }
      }
      return true
    })
    expect(perRow).toBe(3)
  })

  it('deleteTable removes the table', () => {
    placeCursorInFirstCell(editor)
    editor.command('deleteTable')
    let tableFound = false
    editor.state.doc.descendants((n) => {
      if (n.type.name === 'table') tableFound = true
      return true
    })
    expect(tableFound).toBe(false)
  })
})

function placeCursorInFirstCell(ed: Editor) {
  let pos: number | null = null
  ed.state.doc.descendants((node, p) => {
    if (pos !== null) return false
    if (node.type.name === 'table_cell' || node.type.name === 'table_header') {
      pos = p + 1
      return false
    }
    return true
  })
  if (pos == null) return
  const tr = ed.view.state.tr.setSelection(
    TextSelection.create(ed.view.state.doc, pos),
  )
  ed.view.dispatch(tr)
}
