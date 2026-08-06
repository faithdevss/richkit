import { Mark, toggleMark } from '@richkit/core'

export const Subscript = Mark.create({
  name: 'subscript',
  group: 'script',
  excludes: 'script',
  parseHTML: () => [{ tag: 'sub' }, { style: 'vertical-align=sub' }],
  renderHTML: () => ['sub', 0],
  addCommands: () => ({
    toggleSubscript: () => toggleMark('subscript'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-,': toggleMark('subscript'),
  }),
})
