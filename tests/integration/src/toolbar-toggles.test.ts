import { Editor } from '@richkitjs/core'
import { StarterKit } from '@richkitjs/starter-kit'
import { TextSelection } from 'prosemirror-state'
import { afterEach, describe, expect, it } from 'vitest'

/**
 * Toolbar contract: clicking a formatting button a second time undoes the
 * first click, clicking a sibling button switches between the two, and Mod-Z
 * reverts any single click. Picker commands (color, font, size, case, line
 * height) set a value rather than toggle, so they are only held to undo.
 */

type Call = [command: string, ...args: unknown[]]

interface Case {
  name: string
  content: string
  /** Text selection to apply before running commands; default is cursor at 1. */
  select?: [from: number, to: number]
  call: Call
}

const PLAIN = '<p>hello world</p>'
const WORD: [number, number] = [1, 6]

const markCases: Case[] = [
  { name: 'bold', content: PLAIN, select: WORD, call: ['toggleBold'] },
  { name: 'italic', content: PLAIN, select: WORD, call: ['toggleItalic'] },
  { name: 'underline', content: PLAIN, select: WORD, call: ['toggleUnderline'] },
  { name: 'strike', content: PLAIN, select: WORD, call: ['toggleStrike'] },
  { name: 'inline code', content: PLAIN, select: WORD, call: ['toggleCode'] },
  { name: 'subscript', content: PLAIN, select: WORD, call: ['toggleSubscript'] },
  { name: 'superscript', content: PLAIN, select: WORD, call: ['toggleSuperscript'] },
  { name: 'highlight', content: PLAIN, select: WORD, call: ['setHighlight', '#fff59d'] },
]

const pickerCases: Case[] = [
  { name: 'text color', content: PLAIN, select: WORD, call: ['setColor', '#dc2626'] },
  {
    name: 'font family',
    content: PLAIN,
    select: WORD,
    call: ['setFontFamily', 'Georgia, serif'],
  },
  { name: 'font size', content: PLAIN, select: WORD, call: ['setFontSize', '18px'] },
  { name: 'change case upper', content: PLAIN, select: WORD, call: ['changeCase', 'upper'] },
  { name: 'line height', content: PLAIN, call: ['setLineHeight', '1.5'] },
]

const blockCases: Case[] = [
  { name: 'blockquote', content: PLAIN, call: ['toggleBlockquote'] },
  { name: 'code block', content: PLAIN, call: ['toggleCodeBlock'] },
  { name: 'bullet list', content: PLAIN, call: ['toggleBulletList'] },
  { name: 'ordered list', content: PLAIN, call: ['toggleOrderedList'] },
  { name: 'task list', content: PLAIN, call: ['toggleTaskList'] },
  { name: 'callout', content: PLAIN, call: ['toggleCallout'] },
  { name: 'heading 1', content: PLAIN, call: ['setHeading', { level: 1 }] },
  { name: 'heading 3', content: PLAIN, call: ['setHeading', { level: 3 }] },
  { name: 'align center', content: PLAIN, call: ['setTextAlign', 'center'] },
]

const LISTS = {
  bullet: { command: 'toggleBulletList', tag: '<ul>' },
  ordered: { command: 'toggleOrderedList', tag: '<ol>' },
  task: { command: 'toggleTaskList', tag: '<ul data-type="task-list">' },
} as const

let editor: Editor | undefined

function make(content: string, select?: [number, number]): Editor {
  const element = document.createElement('div')
  document.body.appendChild(element)
  editor = new Editor({ element, extensions: StarterKit, content })
  const [from, to] = select ?? [1, 1]
  const { state } = editor.view
  editor.view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, from, to)))
  return editor
}

function run(ed: Editor, [command, ...args]: Call): boolean {
  return ed.command(command, ...args)
}

afterEach(() => {
  editor?.destroy()
  editor = undefined
  document.body.innerHTML = ''
})

describe('clicking the same button twice restores the original', () => {
  it.each([...markCases, ...blockCases])('$name', ({ content, select, call }) => {
    const ed = make(content, select)
    const before = ed.getHTML()
    expect(run(ed, call), 'first click applies').toBe(true)
    expect(ed.getHTML(), 'first click changes the doc').not.toBe(before)
    run(ed, call)
    expect(ed.getHTML()).toBe(before)
  })
})

describe('undo (Mod-Z) reverts a single click', () => {
  it.each([...markCases, ...blockCases, ...pickerCases])('$name', ({ content, select, call }) => {
    const ed = make(content, select)
    const before = ed.getHTML()
    expect(run(ed, call)).toBe(true)
    expect(run(ed, ['undo']), 'undo runs').toBe(true)
    expect(ed.getHTML()).toBe(before)
  })
})

describe('switching list type converts in place', () => {
  const pairs = Object.entries(LISTS).flatMap(([from, a]) =>
    Object.entries(LISTS)
      .filter(([to]) => to !== from)
      .map(([to, b]) => ({ name: `${from} → ${to}`, from: a, to: b })),
  )
  it.each(pairs)('$name', ({ from, to }) => {
    const ed = make(PLAIN)
    run(ed, [from.command])
    run(ed, [to.command])
    const html = ed.getHTML()
    expect(html.startsWith(to.tag), html).toBe(true)
    expect(html).not.toContain(from.tag)
    expect(ed.getText()).toContain('hello world')
  })
})

describe('switching between sibling buttons', () => {
  it('subscript → superscript leaves only superscript', () => {
    const ed = make(PLAIN, WORD)
    run(ed, ['toggleSubscript'])
    run(ed, ['toggleSuperscript'])
    expect(ed.getHTML()).toContain('<sup>hello</sup>')
    expect(ed.getHTML()).not.toContain('<sub>')
  })

  it('superscript → subscript leaves only subscript', () => {
    const ed = make(PLAIN, WORD)
    run(ed, ['toggleSuperscript'])
    run(ed, ['toggleSubscript'])
    expect(ed.getHTML()).toContain('<sub>hello</sub>')
    expect(ed.getHTML()).not.toContain('<sup>')
  })

  it('heading 1 → heading 2 switches level', () => {
    const ed = make(PLAIN)
    run(ed, ['setHeading', { level: 1 }])
    run(ed, ['setHeading', { level: 2 }])
    expect(ed.getHTML()).toBe('<h2>hello world</h2>')
  })

  it('highlight with a different color replaces, not removes', () => {
    const ed = make(PLAIN, WORD)
    run(ed, ['setHighlight', '#fff59d'])
    run(ed, ['setHighlight', '#bbf7d0'])
    expect(ed.getHTML()).toContain('background-color: rgb(187, 247, 208)')
  })

  it('align center → right switches alignment', () => {
    const ed = make(PLAIN)
    run(ed, ['setTextAlign', 'center'])
    run(ed, ['setTextAlign', 'right'])
    expect(ed.getHTML()).toBe('<p style="text-align: right;">hello world</p>')
  })
})
