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

const Bold = Mark.create({
  name: 'bold',
  parseHTML: () => [{ tag: 'strong' }, { tag: 'b' }],
  renderHTML: () => ['strong', 0],
})

describe('schema build', () => {
  it('composes schema from node + mark extensions', () => {
    const editor = new Editor({ extensions: [Paragraph, Bold], content: '<p>hi</p>' })
    expect(editor.schema.nodes['paragraph']).toBeTruthy()
    expect(editor.schema.marks['bold']).toBeTruthy()
    editor.destroy()
  })

  it('parses initial HTML content', () => {
    const editor = new Editor({
      extensions: [Paragraph, Bold],
      content: '<p>hello <strong>world</strong></p>',
    })
    expect(editor.getText()).toBe('hello world')
    editor.destroy()
  })

  it('round-trips HTML', () => {
    const editor = new Editor({
      extensions: [Paragraph, Bold],
      content: '<p>hello <strong>world</strong></p>',
    })
    const html = editor.getHTML()
    expect(html).toContain('<strong>world</strong>')
    editor.destroy()
  })
})
