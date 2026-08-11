import { Editor } from '@richkitjs/core'
import { Bold } from '@richkitjs/extension-bold'
import { Comment, findCommentRange, getCommentsState } from '@richkitjs/extension-comments'
import { Heading } from '@richkitjs/extension-heading'
import { Paragraph } from '@richkitjs/extension-paragraph'
import { TextSelection } from 'prosemirror-state'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

function makeEditor(content: string) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return new Editor({
    element: el,
    extensions: [Paragraph, Heading, Bold, Comment],
    content,
  })
}

function selectRange(editor: Editor, from: number, to: number) {
  const tr = editor.view.state.tr.setSelection(
    TextSelection.create(editor.view.state.doc, from, to),
  )
  editor.view.dispatch(tr)
}

let editor: Editor

beforeEach(() => {
  editor = makeEditor('<p>The quick brown fox jumps over the lazy dog.</p>')
})

afterEach(() => {
  editor.destroy()
  document.body.innerHTML = ''
})

describe('comments extension', () => {
  it('addComment wraps selection with comment mark and stores thread', () => {
    selectRange(editor, 5, 16)
    editor.chain().call('addComment', { body: 'needs review', author: 'Alice' }).run()
    const s = getCommentsState(editor.state)
    expect(s).toBeDefined()
    const threads = Object.values(s!.threads)
    expect(threads.length).toBe(1)
    expect(threads[0]!.body).toBe('needs review')
    expect(threads[0]!.author).toBe('Alice')
    expect(threads[0]!.resolved).toBe(false)
    expect(editor.getHTML()).toContain('data-comment-id')
  })

  it('addComment refuses on empty selection', () => {
    const tr = editor.view.state.tr.setSelection(TextSelection.create(editor.view.state.doc, 2, 2))
    editor.view.dispatch(tr)
    const before = Object.keys(getCommentsState(editor.state)?.threads ?? {}).length
    editor.chain().call('addComment', { body: 'x' }).run()
    const after = Object.keys(getCommentsState(editor.state)?.threads ?? {}).length
    expect(after).toBe(before)
  })

  it('resolveComment marks thread resolved + mark attr', () => {
    selectRange(editor, 5, 16)
    editor.chain().call('addComment', { body: 'foo', id: 'c1' }).run()
    editor.chain().call('resolveComment', 'c1').run()
    const t = getCommentsState(editor.state)?.threads['c1']
    expect(t?.resolved).toBe(true)
    expect(editor.getHTML()).toContain('data-comment-resolved="true"')
  })

  it('reopenComment flips resolved back to false', () => {
    selectRange(editor, 5, 16)
    editor.chain().call('addComment', { body: 'foo', id: 'c1' }).run()
    editor.chain().call('resolveComment', 'c1').run()
    editor.chain().call('reopenComment', 'c1').run()
    const t = getCommentsState(editor.state)?.threads['c1']
    expect(t?.resolved).toBe(false)
  })

  it('addCommentReply appends to replies', () => {
    selectRange(editor, 5, 16)
    editor.chain().call('addComment', { body: 'top', id: 'c1', author: 'A' }).run()
    editor.chain().call('addCommentReply', { id: 'c1', body: 'r1', author: 'B' }).run()
    editor.chain().call('addCommentReply', { id: 'c1', body: 'r2', author: 'C' }).run()
    const t = getCommentsState(editor.state)?.threads['c1']
    expect(t?.replies.length).toBe(2)
    expect(t?.replies[0]?.body).toBe('r1')
    expect(t?.replies[1]?.author).toBe('C')
  })

  it('removeComment deletes thread + strips mark', () => {
    selectRange(editor, 5, 16)
    editor.chain().call('addComment', { body: 'x', id: 'c1' }).run()
    expect(editor.getHTML()).toContain('data-comment-id')
    editor.chain().call('removeComment', 'c1').run()
    expect(editor.getHTML()).not.toContain('data-comment-id')
    expect(getCommentsState(editor.state)?.threads['c1']).toBeUndefined()
  })

  it('findCommentRange returns marked range', () => {
    selectRange(editor, 5, 16)
    editor.chain().call('addComment', { body: 'x', id: 'c1' }).run()
    const range = findCommentRange(editor.state, 'c1')
    expect(range).toBeDefined()
    expect(range!.from).toBe(5)
    expect(range!.to).toBe(16)
  })

  it('multiple comments live independently', () => {
    selectRange(editor, 5, 10)
    editor.chain().call('addComment', { body: 'a', id: 'c1' }).run()
    selectRange(editor, 17, 22)
    editor.chain().call('addComment', { body: 'b', id: 'c2' }).run()
    const threads = getCommentsState(editor.state)?.threads ?? {}
    expect(Object.keys(threads).length).toBe(2)
    expect(threads['c1']?.body).toBe('a')
    expect(threads['c2']?.body).toBe('b')
  })

  it('comment mark survives HTML round trip', () => {
    selectRange(editor, 5, 16)
    editor.chain().call('addComment', { body: 'x', id: 'persisted' }).run()
    const html = editor.getHTML()
    editor.setContent(html)
    expect(editor.getHTML()).toContain('persisted')
  })
})
