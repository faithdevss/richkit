import { Node, wrapInList } from '@richkit/core'

export const BulletList = Node.create({
  name: 'bulletList',
  group: 'block list',
  content: 'listItem+',
  parseHTML: () => [{ tag: 'ul:not([data-type="task-list"])' }],
  renderHTML: () => ['ul', 0],
  addCommands: () => ({
    toggleBulletList: () => wrapInList('bulletList'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-Shift-8': wrapInList('bulletList'),
  }),
})
