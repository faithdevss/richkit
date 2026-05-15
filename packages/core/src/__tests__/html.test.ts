import { describe, expect, it } from 'vitest'
import { Editor } from '../editor'
import { Mark } from '../extension/mark'
import { Node } from '../extension/node'

const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'p' }],
  renderHTML: () => ['p', 0],
})
const Heading = Node.create({
  name: 'heading',
  group: 'block',
  content: 'inline*',
  attrs: { level: { default: 1 } },
  parseHTML: () => [
    { tag: 'h1', attrs: { level: 1 } },
    { tag: 'h2', attrs: { level: 2 } },
    { tag: 'h3', attrs: { level: 3 } },
  ],
  renderHTML: (node) => [`h${node.attrs.level}`, 0],
})
const Blockquote = Node.create({
  name: 'blockquote',
  group: 'block',
  content: 'block+',
  parseHTML: () => [{ tag: 'blockquote' }],
  renderHTML: () => ['blockquote', 0],
})
const Bold = Mark.create({
  name: 'bold',
  parseHTML: () => [{ tag: 'strong' }, { tag: 'b' }],
  renderHTML: () => ['strong', 0],
})
const Italic = Mark.create({
  name: 'italic',
  parseHTML: () => [{ tag: 'em' }, { tag: 'i' }],
  renderHTML: () => ['em', 0],
})

const exts = [Paragraph, Heading, Blockquote, Bold, Italic]

describe('html i/o', () => {
  it('round-trips nested marks', () => {
    const editor = new Editor({
      extensions: exts,
      content: '<p>a <strong>b <em>c</em></strong> d</p>',
    })
    expect(editor.getHTML()).toContain('<strong>b <em>c</em></strong>')
    editor.destroy()
  })

  it('preserves heading levels', () => {
    const editor = new Editor({
      extensions: exts,
      content: '<h1>one</h1><h2>two</h2><h3>three</h3>',
    })
    const html = editor.getHTML()
    expect(html).toContain('<h1>one</h1>')
    expect(html).toContain('<h2>two</h2>')
    expect(html).toContain('<h3>three</h3>')
    editor.destroy()
  })

  it('preserves nested blockquote', () => {
    const editor = new Editor({
      extensions: exts,
      content: '<blockquote><p>quoted</p></blockquote>',
    })
    expect(editor.getHTML()).toBe('<blockquote><p>quoted</p></blockquote>')
    editor.destroy()
  })

  it('drops unknown tags', () => {
    const editor = new Editor({
      extensions: exts,
      content: '<p>hi</p><script>evil()</script><iframe></iframe>',
    })
    const html = editor.getHTML()
    expect(html).not.toContain('<script')
    expect(html).not.toContain('<iframe')
    editor.destroy()
  })

  it('setContent replaces existing doc', () => {
    const editor = new Editor({
      extensions: exts,
      content: '<p>first</p>',
    })
    editor.setContent('<h2>replaced</h2>')
    expect(editor.getHTML()).toContain('<h2>replaced</h2>')
    expect(editor.getHTML()).not.toContain('first')
    editor.destroy()
  })

  it('getJSON returns valid ProseMirror doc shape', () => {
    const editor = new Editor({ extensions: exts, content: '<p>hi</p>' })
    const json = editor.getJSON()
    expect(json.type).toBe('doc')
    expect(Array.isArray(json.content)).toBe(true)
    editor.destroy()
  })
})
