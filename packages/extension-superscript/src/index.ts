import { Mark, toggleMark } from '@richkitjs/core'

export const Superscript = Mark.create({
  name: 'superscript',
  group: 'script',
  excludes: 'script',
  parseHTML: () => [{ tag: 'sup' }, { style: 'vertical-align=super' }],
  renderHTML: () => ['sup', 0],
  addCommands: () => ({
    toggleSuperscript: () => toggleMark('superscript'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-.': toggleMark('superscript'),
  }),
})
