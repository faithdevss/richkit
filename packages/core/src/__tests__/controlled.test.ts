import { describe, expect, it } from 'vitest'
import { Editor } from '../editor'
import { Node } from '../extension/node'

const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'p' }],
  renderHTML: () => ['p', 0],
})

const Image = Node.create({
  name: 'image',
  group: 'inline',
  inline: true,
  atom: true,
  attrs: { src: { default: '' } },
  parseHTML: () => [{ tag: 'img', getAttrs: (el) => ({ src: el.getAttribute('src') }) }],
  renderHTML: (node) => ['img', { src: node.attrs.src }],
})

const make = (content?: string) => new Editor({ extensions: [Paragraph, Image], content })

describe('setContent options', () => {
  it('emits update by default', () => {
    const editor = make('<p>a</p>')
    let updates = 0
    editor.on('update', () => updates++)
    editor.setContent('<p>b</p>')
    expect(updates).toBe(1)
    expect(editor.getHTML()).toBe('<p>b</p>')
  })

  it('stays silent with emitUpdate: false', () => {
    const editor = make('<p>a</p>')
    let updates = 0
    editor.on('update', () => updates++)
    editor.setContent('<p>b</p>', { emitUpdate: false })
    expect(updates).toBe(0)
    expect(editor.getHTML()).toBe('<p>b</p>')
  })
})

describe('setEditable', () => {
  it('toggles the view without rebuilding', () => {
    const editor = make('<p>a</p>')
    const view = editor.view
    expect(editor.isEditable).toBe(true)
    editor.setEditable(false)
    expect(editor.isEditable).toBe(false)
    expect(view.dom.getAttribute('contenteditable')).toBe('false')
    editor.setEditable(true)
    expect(editor.view).toBe(view)
    expect(editor.isEditable).toBe(true)
  })

  it('honours editable: false at construction', () => {
    const editor = new Editor({ extensions: [Paragraph], editable: false })
    expect(editor.isEditable).toBe(false)
  })
})

describe('isEmpty', () => {
  it('is true for no content and for blank paragraphs', () => {
    expect(make().isEmpty).toBe(true)
    expect(make('<p></p><p>   </p>').isEmpty).toBe(true)
  })

  it('is false once there is text or a leaf node', () => {
    expect(make('<p>hi</p>').isEmpty).toBe(false)
    expect(make('<p><img src="x.png"></p>').isEmpty).toBe(false)
  })
})
