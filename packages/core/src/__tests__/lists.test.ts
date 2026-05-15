import { describe, expect, it } from 'vitest'
import { wrapInList } from '../commands/blocks'
import { Editor } from '../editor'
import { Node } from '../extension/node'

const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'p' }],
  renderHTML: () => ['p', 0],
})
const ListItem = Node.create({
  name: 'listItem',
  content: 'paragraph block*',
  defining: true,
  parseHTML: () => [{ tag: 'li' }],
  renderHTML: () => ['li', 0],
})
const BulletList = Node.create({
  name: 'bulletList',
  group: 'block list',
  content: 'listItem+',
  parseHTML: () => [{ tag: 'ul' }],
  renderHTML: () => ['ul', 0],
  addCommands: () => ({ toggleBulletList: () => wrapInList('bulletList') }),
})
const OrderedList = Node.create({
  name: 'orderedList',
  group: 'block list',
  content: 'listItem+',
  attrs: { start: { default: 1 } },
  parseHTML: () => [{ tag: 'ol' }],
  renderHTML: () => ['ol', 0],
  addCommands: () => ({ toggleOrderedList: () => wrapInList('orderedList') }),
})

describe('lists', () => {
  it('wraps paragraph in bullet list', () => {
    const editor = new Editor({
      extensions: [Paragraph, ListItem, BulletList, OrderedList],
      content: '<p>one</p>',
    })
    editor.commands.toggleBulletList!()
    expect(editor.getHTML()).toContain('<ul>')
    expect(editor.getHTML()).toContain('<li>')
    editor.destroy()
  })

  it('wraps paragraph in ordered list', () => {
    const editor = new Editor({
      extensions: [Paragraph, ListItem, BulletList, OrderedList],
      content: '<p>one</p>',
    })
    editor.commands.toggleOrderedList!()
    expect(editor.getHTML()).toContain('<ol>')
    editor.destroy()
  })

  it('round-trips nested ul', () => {
    const editor = new Editor({
      extensions: [Paragraph, ListItem, BulletList, OrderedList],
      content: '<ul><li><p>a</p><ul><li><p>b</p></li></ul></li></ul>',
    })
    expect(editor.getHTML()).toContain('<ul>')
    expect(editor.getText()).toContain('a')
    expect(editor.getText()).toContain('b')
    editor.destroy()
  })
})
