import { Editor } from '@rich-editor/core'
import { Paragraph } from '@rich-editor/extension-paragraph'
import { Subscript } from '@rich-editor/extension-subscript'
import { Superscript } from '@rich-editor/extension-superscript'
import { TextSelection } from 'prosemirror-state'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

function makeEditor(content: string) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return new Editor({
    element: el,
    extensions: [Paragraph, Subscript, Superscript],
    content,
  })
}

let editor: Editor

beforeEach(() => {
  editor = makeEditor('<p>H2O and E=mc2</p>')
})

afterEach(() => {
  editor.destroy()
  document.body.innerHTML = ''
})

function selectRange(from: number, to: number) {
  const tr = editor.state.tr.setSelection(TextSelection.create(editor.state.doc, from, to))
  editor.view.dispatch(tr)
}

describe('subscript/superscript', () => {
  it('toggleSubscript wraps selection in <sub>', () => {
    selectRange(2, 3) // the "2" in H2O
    editor.chain().call('toggleSubscript').run()
    expect(editor.getHTML()).toContain('<sub>')
    expect(editor.isActive('subscript')).toBe(true)
  })

  it('toggleSuperscript wraps selection in <sup>', () => {
    selectRange(2, 3)
    editor.chain().call('toggleSuperscript').run()
    expect(editor.getHTML()).toContain('<sup>')
    expect(editor.isActive('superscript')).toBe(true)
  })

  it('sub and sup are mutually exclusive', () => {
    selectRange(2, 3)
    editor.chain().call('toggleSubscript').run()
    expect(editor.isActive('subscript')).toBe(true)
    editor.chain().call('toggleSuperscript').run()
    expect(editor.isActive('superscript')).toBe(true)
    expect(editor.isActive('subscript')).toBe(false)
    expect(editor.getHTML()).not.toContain('<sub>')
  })

  it('round-trips sub/sup through HTML', () => {
    editor.setContent('<p>a<sub>1</sub>b<sup>2</sup></p>')
    const html = editor.getHTML()
    expect(html).toContain('<sub>1</sub>')
    expect(html).toContain('<sup>2</sup>')
  })
})
