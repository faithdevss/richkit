import { Editor } from '@richkit/core'
import { Bold } from '@richkit/extension-bold'
import { Heading } from '@richkit/extension-heading'
import { Paragraph } from '@richkit/extension-paragraph'
import {
  TrackChangesKit,
  getSuggestions,
  getTrackState,
  trackKey,
} from '@richkit/extension-track-changes'
import { TextSelection } from 'prosemirror-state'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

function makeEditor(content: string) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return new Editor({
    element: el,
    extensions: [Paragraph, Heading, Bold, ...TrackChangesKit],
    content,
  })
}

function selectRange(editor: Editor, from: number, to: number) {
  const tr = editor.view.state.tr.setSelection(
    TextSelection.create(editor.view.state.doc, from, to),
  )
  editor.view.dispatch(tr)
}

function placeCaret(editor: Editor, pos: number) {
  selectRange(editor, pos, pos)
}

let editor: Editor

beforeEach(() => {
  editor = makeEditor('<p>Hello world.</p>')
})

afterEach(() => {
  editor.destroy()
  document.body.innerHTML = ''
})

describe('track changes', () => {
  it('default state: disabled', () => {
    const ts = getTrackState(editor.state)
    expect(ts?.enabled).toBe(false)
  })

  it('enableTrackChanges flips state', () => {
    editor.chain().call('enableTrackChanges', 'Alice').run()
    const ts = getTrackState(editor.state)
    expect(ts?.enabled).toBe(true)
    expect(ts?.author).toBe('Alice')
  })

  it('typed text gets insertion mark when enabled', () => {
    editor.chain().call('enableTrackChanges', 'Alice').run()
    placeCaret(editor, 7)
    editor.view.dispatch(editor.view.state.tr.insertText('cruel '))
    const html = editor.getHTML()
    expect(html).toContain('data-suggestion="insertion"')
    expect(html).toContain('cruel ')
  })

  it('typed text does NOT get insertion mark when disabled', () => {
    placeCaret(editor, 7)
    editor.view.dispatch(editor.view.state.tr.insertText('cruel '))
    expect(editor.getHTML()).not.toContain('data-suggestion="insertion"')
  })

  it('getSuggestions reflects insertion ranges', () => {
    editor.chain().call('enableTrackChanges', 'Bob').run()
    placeCaret(editor, 7)
    editor.view.dispatch(editor.view.state.tr.insertText('big '))
    const sugg = getSuggestions(editor.state)
    expect(sugg.length).toBe(1)
    expect(sugg[0]!.type).toBe('insertion')
    expect(sugg[0]!.author).toBe('Bob')
    expect(sugg[0]!.text).toBe('big ')
  })

  it('acceptSuggestion on insertion strips mark, keeps text', () => {
    editor.chain().call('enableTrackChanges', 'A').run()
    placeCaret(editor, 7)
    editor.view.dispatch(editor.view.state.tr.insertText('big '))
    const sugg = getSuggestions(editor.state)
    expect(sugg.length).toBe(1)
    editor.chain().call('acceptSuggestion', sugg[0]!.id).run()
    const html = editor.getHTML()
    expect(html).not.toContain('data-suggestion="insertion"')
    expect(editor.getText()).toContain('big ')
    expect(getSuggestions(editor.state).length).toBe(0)
  })

  it('rejectSuggestion on insertion removes the inserted text', () => {
    editor.chain().call('enableTrackChanges', 'A').run()
    placeCaret(editor, 7)
    editor.view.dispatch(editor.view.state.tr.insertText('big '))
    const sugg = getSuggestions(editor.state)
    editor.chain().call('rejectSuggestion', sugg[0]!.id).run()
    expect(editor.getText()).not.toContain('big')
    expect(getSuggestions(editor.state).length).toBe(0)
  })

  it('Backspace simulation adds deletion mark instead of deleting', () => {
    editor.chain().call('enableTrackChanges', 'A').run()
    expect(getSuggestions(editor.state).length).toBe(0)
    const delType = editor.schema.marks['deletion']!
    const tr = editor.view.state.tr
      .addMark(7, 12, delType.create({ id: 'd1', author: 'A', createdAt: 0 }))
      .setMeta(trackKey, { skip: true })
    editor.view.dispatch(tr)
    const sugg = getSuggestions(editor.state)
    expect(sugg.find((s) => s.type === 'deletion')).toBeDefined()
    expect(editor.getText()).toContain('world')
  })

  it('acceptSuggestion on deletion removes text', () => {
    const delType = editor.schema.marks['deletion']!
    const tr = editor.view.state.tr.addMark(
      7,
      12,
      delType.create({ id: 'd1', author: 'A', createdAt: 0 }),
    )
    editor.view.dispatch(tr)
    expect(editor.getText()).toContain('world')
    editor.chain().call('acceptSuggestion', 'd1').run()
    expect(editor.getText()).not.toContain('world')
  })

  it('rejectSuggestion on deletion keeps text and removes mark', () => {
    const delType = editor.schema.marks['deletion']!
    const tr = editor.view.state.tr.addMark(
      7,
      12,
      delType.create({ id: 'd1', author: 'A', createdAt: 0 }),
    )
    editor.view.dispatch(tr)
    editor.chain().call('rejectSuggestion', 'd1').run()
    expect(editor.getText()).toContain('world')
    expect(editor.getHTML()).not.toContain('data-suggestion="deletion"')
  })

  it('acceptAllSuggestions resolves every suggestion', () => {
    editor.chain().call('enableTrackChanges', 'A').run()
    placeCaret(editor, 7)
    editor.view.dispatch(editor.view.state.tr.insertText('foo '))
    placeCaret(editor, 13)
    editor.view.dispatch(editor.view.state.tr.insertText('bar '))
    expect(getSuggestions(editor.state).length).toBeGreaterThanOrEqual(1)
    editor.chain().call('acceptAllSuggestions').run()
    expect(getSuggestions(editor.state).length).toBe(0)
  })

  it('disableTrackChanges stops marking new typing', () => {
    editor.chain().call('enableTrackChanges', 'A').run()
    placeCaret(editor, 7)
    editor.view.dispatch(editor.view.state.tr.insertText('x'))
    editor.chain().call('disableTrackChanges').run()
    placeCaret(editor, editor.state.doc.content.size - 2)
    editor.view.dispatch(editor.view.state.tr.insertText('y'))
    const sugg = getSuggestions(editor.state)
    // only the 'x' should be a suggestion, not the 'y'
    const totalText = sugg.map((s) => s.text).join('')
    expect(totalText).toContain('x')
    expect(totalText).not.toContain('y')
  })
})
