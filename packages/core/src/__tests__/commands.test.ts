import { TextSelection } from 'prosemirror-state'
import { describe, expect, it } from 'vitest'
import { setBlockType as setBlockTypeCmd } from '../commands/blocks'
import { toggleMark } from '../commands/marks'
import { Editor } from '../editor'
import { Mark } from '../extension/mark'
import { Node } from '../extension/node'

const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'p' }],
  renderHTML: () => ['p', 0],
  addCommands: () => ({ setParagraph: () => setBlockTypeCmd('paragraph') }),
})

const Heading = Node.create({
  name: 'heading',
  group: 'block',
  content: 'inline*',
  attrs: { level: { default: 1 } },
  parseHTML: () => [
    { tag: 'h1', attrs: { level: 1 } },
    { tag: 'h2', attrs: { level: 2 } },
  ],
  renderHTML: (node) => [`h${node.attrs.level}`, 0],
  addCommands: () => ({
    setHeading: (...args: unknown[]) => {
      const [opts] = args as [{ level: number }]
      return setBlockTypeCmd('heading', { level: opts.level })
    },
  }),
})

const Bold = Mark.create({
  name: 'bold',
  parseHTML: () => [{ tag: 'strong' }],
  renderHTML: () => ['strong', 0],
  addCommands: () => ({ toggleBold: () => toggleMark('bold') }),
})

describe('commands', () => {
  it('toggleBold marks selection', () => {
    const editor = new Editor({
      extensions: [Paragraph, Heading, Bold],
      content: '<p>hello world</p>',
    })
    const sel = TextSelection.create(editor.state.doc, 1, 6)
    editor.view.dispatch(editor.state.tr.setSelection(sel))
    editor.commands.toggleBold!()
    expect(editor.getHTML()).toContain('<strong>hello</strong>')
    editor.destroy()
  })

  it('setHeading changes block type', () => {
    const editor = new Editor({
      extensions: [Paragraph, Heading, Bold],
      content: '<p>title</p>',
    })
    editor.commands.setHeading!({ level: 2 })
    expect(editor.getHTML()).toContain('<h2>title</h2>')
    editor.destroy()
  })

  it('isActive detects mark and node', () => {
    const editor = new Editor({
      extensions: [Paragraph, Heading, Bold],
      content: '<h1>title</h1>',
    })
    expect(editor.isActive('heading')).toBe(true)
    expect(editor.isActive('heading', { level: 1 })).toBe(true)
    expect(editor.isActive('heading', { level: 2 })).toBe(false)
    expect(editor.isActive('bold')).toBe(false)
    editor.destroy()
  })
})
