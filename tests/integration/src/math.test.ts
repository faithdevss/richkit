import { Editor } from '@richkitjs/core'
import { MathBlock, MathInline, MathKit } from '@richkitjs/extension-math'
import { Paragraph } from '@richkitjs/extension-paragraph'
import { TextSelection } from 'prosemirror-state'
import { afterEach, describe, expect, it, vi } from 'vitest'

let editor: Editor

function makeEditor(content: string, extensions: unknown[] = [Paragraph, ...MathKit]) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  editor = new Editor({ element: el, extensions, content } as never)
  return editor
}

// Types `text` one character at a time through the view's text-input
// handlers, so input rules fire exactly as they would for a user.
function type(text: string) {
  for (const ch of text) {
    const { from, to } = editor.state.selection
    const handled = editor.view.someProp('handleTextInput', (f) =>
      f(editor.view, from, to, ch, () => editor.state.tr.insertText(ch, from, to)),
    )
    if (!handled) editor.view.dispatch(editor.state.tr.insertText(ch, from, to))
  }
}

function placeCaretAtEnd() {
  const end = editor.state.doc.content.size - 1
  editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, end)))
}

function mathNodes() {
  const found: { type: string; latex: string }[] = []
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'math' || node.type.name === 'mathBlock') {
      found.push({ type: node.type.name, latex: node.attrs.latex as string })
    }
  })
  return found
}

afterEach(() => {
  editor.destroy()
  document.body.innerHTML = ''
})

describe('math', () => {
  it('round-trips inline and block formulas through HTML', () => {
    makeEditor(
      '<p>Energy <span data-math="E = mc^2"></span> holds.</p><div data-math-block="\\int_0^1 x\\,dx"></div>',
    )
    expect(mathNodes()).toEqual([
      { type: 'math', latex: 'E = mc^2' },
      { type: 'mathBlock', latex: '\\int_0^1 x\\,dx' },
    ])
    const html = editor.getHTML()
    expect(html).toContain('<span data-math="E = mc^2" class="rk-math">E = mc^2</span>')
    expect(html).toContain('data-math-block="\\int_0^1 x\\,dx"')
  })

  it('renders formulas with KaTeX in the editor', () => {
    makeEditor('<p><span data-math="x^2"></span></p>')
    expect(editor.view.dom.querySelector('.rk-math .katex')).not.toBeNull()
  })

  it('inserts and updates formulas by command', () => {
    makeEditor('<p>a</p>')
    placeCaretAtEnd()
    expect(editor.chain().call('insertMath', ' \\pi ').run()).toBe(true)
    expect(mathNodes()).toEqual([{ type: 'math', latex: '\\pi' }])

    let pos = -1
    editor.state.doc.descendants((node, p) => {
      if (node.type.name === 'math') pos = p
    })
    expect(editor.chain().call('updateMath', pos, '\\tau').run()).toBe(true)
    expect(mathNodes()).toEqual([{ type: 'math', latex: '\\tau' }])
  })

  it('refuses empty formulas and non-math positions', () => {
    makeEditor('<p>a</p>')
    expect(editor.chain().call('insertMath', '   ').run()).toBe(false)
    expect(editor.chain().call('updateMath', 1, 'x').run()).toBe(false)
  })

  it('turns $…$ into an inline formula as you type', () => {
    makeEditor('<p>Area is</p>')
    placeCaretAtEnd()
    type(' $\\pi r^2$')
    expect(mathNodes()).toEqual([{ type: 'math', latex: '\\pi r^2' }])
    expect(editor.state.doc.textContent).toBe('Area is ')
  })

  it('leaves prices alone', () => {
    makeEditor('<p>x</p>')
    placeCaretAtEnd()
    type(' costs $5 and $')
    expect(mathNodes()).toEqual([])
  })

  it('turns $$…$$ in an empty paragraph into a block formula', () => {
    makeEditor('<p></p>')
    placeCaretAtEnd()
    type('$$x^2$$')
    expect(mathNodes()).toEqual([{ type: 'mathBlock', latex: 'x^2' }])
  })

  it('calls onEdit on double-click instead of prompting', () => {
    const onEdit = vi.fn()
    const prompt = vi.spyOn(window, 'prompt')
    makeEditor('<p><span data-math="x"></span></p>', [
      Paragraph,
      MathInline.configure({ onEdit }),
      MathBlock,
    ])
    editor.view.dom.querySelector('.rk-math')!.dispatchEvent(new MouseEvent('dblclick'))
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ latex: 'x', displayMode: false }))
    expect(prompt).not.toHaveBeenCalled()
    prompt.mockRestore()
  })
})
