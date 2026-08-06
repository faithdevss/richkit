import { Editor } from '@richkit/core'
import { CodeBlock } from '@richkit/extension-code-block'
import { Heading } from '@richkit/extension-heading'
import { Paragraph } from '@richkit/extension-paragraph'
import { SlashCommands, getSlashState, closeSlash } from '@richkit/extension-slash-commands'
import { TextSelection } from 'prosemirror-state'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

function makeEditor(content: string) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return new Editor({
    element: el,
    extensions: [Paragraph, Heading, CodeBlock, SlashCommands],
    content,
  })
}

let editor: Editor

beforeEach(() => {
  editor = makeEditor('<p></p>')
})

afterEach(() => {
  editor.destroy()
  document.body.innerHTML = ''
})

function typeText(text: string) {
  editor.view.dispatch(editor.state.tr.insertText(text))
}

function placeCursorEnd() {
  const end = editor.state.doc.content.size - 1
  editor.view.dispatch(
    editor.state.tr.setSelection(TextSelection.create(editor.state.doc, end)),
  )
}

describe('slash commands plugin', () => {
  it('activates on "/" at block start', () => {
    typeText('/')
    const s = getSlashState(editor.state)
    expect(s?.active).toBe(true)
    expect(s?.query).toBe('')
  })

  it('tracks the query text after "/"', () => {
    typeText('/head')
    const s = getSlashState(editor.state)
    expect(s?.active).toBe(true)
    expect(s?.query).toBe('head')
  })

  it('activates after a space mid-paragraph', () => {
    typeText('some text /ta')
    const s = getSlashState(editor.state)
    expect(s?.active).toBe(true)
    expect(s?.query).toBe('ta')
  })

  it('does not activate mid-word', () => {
    typeText('path/to')
    const s = getSlashState(editor.state)
    expect(s?.active).toBe(false)
  })

  it('does not activate inside code blocks', () => {
    editor.setContent('<pre><code>abc</code></pre>')
    placeCursorEnd()
    typeText(' /')
    const s = getSlashState(editor.state)
    expect(s?.active).toBe(false)
  })

  it('closeSlash deactivates and suppresses until run left', () => {
    typeText('/he')
    expect(getSlashState(editor.state)?.active).toBe(true)
    closeSlash(editor.view)
    expect(getSlashState(editor.state)?.active).toBe(false)
    // typing more into the same run stays suppressed
    typeText('ad')
    expect(getSlashState(editor.state)?.active).toBe(false)
  })

  it('range covers slash and query', () => {
    typeText('/hi')
    const s = getSlashState(editor.state)
    expect(s?.range).toBeTruthy()
    const { from, to } = s!.range!
    expect(editor.state.doc.textBetween(from, to)).toBe('/hi')
  })
})
