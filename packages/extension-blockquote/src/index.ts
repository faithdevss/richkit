import { Node, toggleWrap } from '@richkit/core'

export const Blockquote = Node.create({
  name: 'blockquote',
  group: 'block',
  content: 'block+',
  defining: true,
  parseHTML: () => [{ tag: 'blockquote' }],
  renderHTML: () => ['blockquote', 0],
  addCommands: () => ({
    toggleBlockquote: () => toggleWrap('blockquote'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-Shift-b': toggleWrap('blockquote'),
    'Mod-Shift-B': toggleWrap('blockquote'),
  }),
})
