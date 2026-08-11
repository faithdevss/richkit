import { Bold } from '@richkitjs/extension-bold'
import { CaseChange } from '@richkitjs/extension-case-change'
import { Heading } from '@richkitjs/extension-heading'
import { Highlight } from '@richkitjs/extension-highlight'
import { HorizontalRule } from '@richkitjs/extension-horizontal-rule'
import { LineHeight } from '@richkitjs/extension-line-height'
import { PageBreak } from '@richkitjs/extension-page-break'
import { Paragraph } from '@richkitjs/extension-paragraph'
import { TextAlign } from '@richkitjs/extension-text-align'
import { TextStyle } from '@richkitjs/extension-text-style'
import { TextSelection } from 'prosemirror-state'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Editor } from '@richkitjs/core'

function makeEditor(content = '<p></p>') {
  const element = document.createElement('div')
  document.body.appendChild(element)
  return new Editor({
    element,
    extensions: [
      Paragraph,
      Heading,
      Bold,
      TextStyle,
      Highlight,
      HorizontalRule,
      PageBreak,
      TextAlign,
      LineHeight,
      CaseChange,
    ],
    content,
  })
}

function selectAll(ed: Editor) {
  const tr = ed.view.state.tr.setSelection(
    TextSelection.create(ed.view.state.doc, 0, ed.view.state.doc.content.size),
  )
  ed.view.dispatch(tr)
}

let editor: Editor

beforeEach(() => {
  editor = makeEditor()
})

afterEach(() => {
  editor.destroy()
  document.body.innerHTML = ''
})

describe('horizontal-rule extension', () => {
  it('inserts <hr> via command', () => {
    editor.command('insertHorizontalRule')
    expect(editor.getHTML()).toContain('<hr')
  })

  it('round-trips through HTML', () => {
    editor.setContent('<p>before</p><hr><p>after</p>')
    const html = editor.getHTML()
    expect(html).toContain('<hr')
    expect(html).toContain('before')
    expect(html).toContain('after')
  })
})

describe('page-break extension', () => {
  it('inserts page break via command', () => {
    editor.command('insertPageBreak')
    const html = editor.getHTML()
    expect(html).toContain('data-page-break')
  })

  it('round-trips with print CSS', () => {
    editor.command('insertPageBreak')
    const html = editor.getHTML()
    expect(html).toMatch(/page-break-after/)
  })
})

describe('text-align extension', () => {
  it('sets textAlign on paragraph', () => {
    editor.setContent('<p>hello</p>')
    selectAll(editor)
    editor.command('setTextAlign', 'center')
    expect(editor.getHTML()).toContain('text-align: center')
  })

  it('sets textAlign on heading', () => {
    editor.setContent('<h2>hi</h2>')
    selectAll(editor)
    editor.command('setTextAlign', 'right')
    expect(editor.getHTML()).toContain('text-align: right')
  })

  it('unsetTextAlign removes attr', () => {
    editor.setContent('<p style="text-align: center">x</p>')
    selectAll(editor)
    editor.command('unsetTextAlign')
    expect(editor.getHTML()).not.toContain('text-align')
  })

  it('parses inline style', () => {
    editor.setContent('<p style="text-align: justify">x</p>')
    expect(editor.getHTML()).toContain('text-align: justify')
  })
})

describe('line-height extension', () => {
  it('sets line-height', () => {
    editor.setContent('<p>hi</p>')
    selectAll(editor)
    editor.command('setLineHeight', '1.5')
    expect(editor.getHTML()).toContain('line-height: 1.5')
  })

  it('coexists with textAlign', () => {
    editor.setContent('<p>hi</p>')
    selectAll(editor)
    editor.command('setTextAlign', 'center')
    editor.command('setLineHeight', '2.0')
    const html = editor.getHTML()
    expect(html).toContain('text-align: center')
    expect(html).toMatch(/line-height:\s*2(\.0)?/)
  })
})

describe('highlight mark', () => {
  it('applies color attr', () => {
    editor.setContent('<p>hi</p>')
    selectAll(editor)
    editor.command('setHighlight', '#fff59d')
    const html = editor.getHTML()
    expect(html).toMatch(/background-color:\s*(#fff59d|rgb\(255,\s*245,\s*157\))/i)
  })

  it('unsetHighlight removes mark', () => {
    editor.setContent('<p><mark style="background-color: #fff59d">x</mark></p>')
    selectAll(editor)
    editor.command('unsetHighlight')
    expect(editor.getHTML()).not.toContain('<mark')
  })
})

describe('text-style mark (color/font)', () => {
  it('setColor wraps selection in span', () => {
    editor.setContent('<p>hi</p>')
    selectAll(editor)
    editor.command('setColor', '#dc2626')
    const html = editor.getHTML()
    expect(html).toMatch(/<span[^>]*style=/)
    expect(html).toMatch(/color:\s*(#dc2626|rgb\(220,\s*38,\s*38\))/i)
  })

  it('setFontFamily applies', () => {
    editor.setContent('<p>hi</p>')
    selectAll(editor)
    editor.command('setFontFamily', 'Georgia')
    expect(editor.getHTML()).toContain('font-family: Georgia')
  })

  it('setFontSize applies', () => {
    editor.setContent('<p>hi</p>')
    selectAll(editor)
    editor.command('setFontSize', '20px')
    expect(editor.getHTML()).toContain('font-size: 20px')
  })

  it('attrs merge (color preserves font-family)', () => {
    editor.setContent('<p>hi</p>')
    selectAll(editor)
    editor.command('setFontFamily', 'Georgia')
    selectAll(editor)
    editor.command('setColor', '#000000')
    const html = editor.getHTML()
    expect(html).toMatch(/color:\s*(#000000|rgb\(0,\s*0,\s*0\))/i)
    expect(html).toContain('font-family: Georgia')
  })
})

describe('case-change extension', () => {
  it('upper transforms selection', () => {
    editor.setContent('<p>hello world</p>')
    selectAll(editor)
    editor.command('changeCase', 'upper')
    expect(editor.getText()).toBe('HELLO WORLD')
  })

  it('lower transforms selection', () => {
    editor.setContent('<p>HELLO WORLD</p>')
    selectAll(editor)
    editor.command('changeCase', 'lower')
    expect(editor.getText()).toBe('hello world')
  })

  it('title transforms selection', () => {
    editor.setContent('<p>hello world</p>')
    selectAll(editor)
    editor.command('changeCase', 'title')
    expect(editor.getText()).toBe('Hello World')
  })

  it('toggle inverts case', () => {
    editor.setContent('<p>Hello</p>')
    selectAll(editor)
    editor.command('changeCase', 'toggle')
    expect(editor.getText()).toBe('hELLO')
  })

  it('returns false for empty selection', () => {
    editor.setContent('<p>hi</p>')
    const ok = editor.command('changeCase', 'upper')
    expect(ok).toBe(false)
  })
})

describe('core util commands', () => {
  it('selectAll selects entire doc', () => {
    editor.setContent('<p>abc</p>')
    editor.command('selectAll')
    const { from, to } = editor.state.selection
    expect(to - from).toBeGreaterThan(0)
  })

  it('clearFormatting removes marks in selection', () => {
    editor.setContent('<p><strong>hello</strong></p>')
    selectAll(editor)
    editor.command('clearFormatting')
    expect(editor.getHTML()).not.toContain('<strong')
  })
})
