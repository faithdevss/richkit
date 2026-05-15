import { Node, wrapInList } from '@rich-editor/core'

export const BulletList = Node.create({
  name: 'bulletList',
  group: 'block list',
  content: 'listItem+',
  parseHTML: () => [{ tag: 'ul' }],
  renderHTML: () => ['ul', 0],
  addCommands: () => ({
    toggleBulletList: () => wrapInList('bulletList'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-Shift-8': wrapInList('bulletList'),
  }),
})
