import { Editor } from '@richkit/core'
import {
  FindReplace,
  findMatches,
  getFindState,
  gotoNext,
  replaceAll,
  replaceCurrent,
  setQuery,
} from '@richkit/extension-find-replace'
import { Bold } from '@richkit/extension-bold'
import { Heading } from '@richkit/extension-heading'
import { Paragraph } from '@richkit/extension-paragraph'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

function makeEditor(content: string) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return new Editor({
    element: el,
    extensions: [Paragraph, Heading, Bold, FindReplace],
    content,
  })
}

let editor: Editor

beforeEach(() => {
  editor = makeEditor('<p>The quick brown fox jumps over the lazy dog. The fox runs.</p>')
})

afterEach(() => {
  editor.destroy()
  document.body.innerHTML = ''
})

describe('find-replace', () => {
  it('findMatches finds plain text occurrences', () => {
    const matches = findMatches(editor.state.doc, 'fox', false, false)
    expect(matches.length).toBe(2)
  })

  it('findMatches case-insensitive by default', () => {
    const matches = findMatches(editor.state.doc, 'THE', false, false)
    expect(matches.length).toBe(3)
  })

  it('findMatches case-sensitive when flag set', () => {
    const matches = findMatches(editor.state.doc, 'THE', false, true)
    expect(matches.length).toBe(0)
  })

  it('findMatches with regex pattern', () => {
    const matches = findMatches(editor.state.doc, '\\bfox\\b', true, false)
    expect(matches.length).toBe(2)
  })

  it('setQuery populates plugin state', () => {
    setQuery(editor.view, 'fox', false, false)
    const s = getFindState(editor.state)
    expect(s).toBeDefined()
    expect(s?.matches.length).toBe(2)
    expect(s?.current).toBe(0)
  })

  it('gotoNext advances and wraps', () => {
    setQuery(editor.view, 'fox', false, false)
    expect(getFindState(editor.state)?.current).toBe(0)
    gotoNext(editor.view)
    expect(getFindState(editor.state)?.current).toBe(1)
    gotoNext(editor.view)
    expect(getFindState(editor.state)?.current).toBe(0)
  })

  it('replaceCurrent replaces only active match', () => {
    setQuery(editor.view, 'fox', false, false)
    replaceCurrent(editor.view, 'cat')
    const text = editor.getText()
    expect(text).toContain('cat')
    expect(text.match(/fox/g)?.length).toBe(1)
  })

  it('replaceAll replaces every match', () => {
    setQuery(editor.view, 'fox', false, false)
    const n = replaceAll(editor.view, 'cat')
    expect(n).toBe(2)
    const text = editor.getText()
    expect(text.match(/fox/g)).toBeNull()
    expect(text.match(/cat/g)?.length).toBe(2)
  })

  it('no matches returns empty', () => {
    setQuery(editor.view, 'nonsensical-xyzzy', false, false)
    expect(getFindState(editor.state)?.matches.length).toBe(0)
    expect(getFindState(editor.state)?.current).toBe(-1)
  })

  it('invalid regex degrades to zero matches', () => {
    setQuery(editor.view, '[unterminated', true, false)
    expect(getFindState(editor.state)?.matches.length).toBe(0)
  })
})
