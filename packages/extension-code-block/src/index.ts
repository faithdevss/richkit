import { Node, toggleBlockType } from '@rich-editor/core'

export const CodeBlock = Node.create({
  name: 'codeBlock',
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,
  whitespace: 'pre',
  parseHTML: () => [{ tag: 'pre', preserveWhitespace: 'full' }],
  renderHTML: () => ['pre', ['code', 0]],
  addCommands: () => ({
    toggleCodeBlock: () => toggleBlockType('codeBlock', 'paragraph'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-Alt-c': toggleBlockType('codeBlock', 'paragraph'),
    'Mod-Alt-C': toggleBlockType('codeBlock', 'paragraph'),
  }),
})
