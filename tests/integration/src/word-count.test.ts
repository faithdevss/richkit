import { Editor } from '@richkit/core'
import { Heading } from '@richkit/extension-heading'
import { Paragraph } from '@richkit/extension-paragraph'
import { getWordCount, WordCount } from '@richkit/extension-word-count'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

function makeEditor(content: string) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return new Editor({
    element: el,
    extensions: [Paragraph, Heading, WordCount],
    content,
  })
}

let editor: Editor

afterEach(() => {
  editor?.destroy()
  document.body.innerHTML = ''
})

describe('word count', () => {
  beforeEach(() => {
    editor = makeEditor('<p></p>')
  })

  it('empty doc counts zero', () => {
    const s = getWordCount(editor.state.doc)
    expect(s.words).toBe(0)
    expect(s.charactersNoSpaces).toBe(0)
    expect(s.readingTimeMinutes).toBe(0)
  })

  it('counts words across blocks', () => {
    editor.setContent('<h1>Hello world</h1><p>three more words</p>')
    const s = getWordCount(editor.state.doc)
    expect(s.words).toBe(5)
  })

  it('collapses whitespace runs', () => {
    editor.setContent('<p>one     two&nbsp;&nbsp;three</p>')
    const s = getWordCount(editor.state.doc)
    expect(s.words).toBe(3)
  })

  it('reading time rounds up', () => {
    const words = new Array(201).fill('word').join(' ')
    editor.setContent(`<p>${words}</p>`)
    const s = getWordCount(editor.state.doc)
    expect(s.words).toBe(201)
    expect(s.readingTimeMinutes).toBe(2)
  })

  it('charactersNoSpaces excludes whitespace', () => {
    editor.setContent('<p>ab cd</p>')
    const s = getWordCount(editor.state.doc)
    expect(s.charactersNoSpaces).toBe(4)
    expect(s.characters).toBeGreaterThanOrEqual(5)
  })
})
