import { Mark, toggleMark } from '@richkitjs/core'

export const Strike = Mark.create({
  name: 'strike',
  parseHTML: () => [
    { tag: 's' },
    { tag: 'del' },
    { tag: 'strike' },
    { style: 'text-decoration=line-through' },
  ],
  renderHTML: () => ['s', 0],
  addCommands: () => ({
    toggleStrike: () => toggleMark('strike'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-Shift-s': toggleMark('strike'),
    'Mod-Shift-S': toggleMark('strike'),
  }),
})
