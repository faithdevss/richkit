import { Mark, toggleMark } from '@richkitjs/core'

export const Underline = Mark.create({
  name: 'underline',
  parseHTML: () => [{ tag: 'u' }, { style: 'text-decoration=underline' }],
  renderHTML: () => ['u', 0],
  addCommands: () => ({
    toggleUnderline: () => toggleMark('underline'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-u': toggleMark('underline'),
    'Mod-U': toggleMark('underline'),
  }),
})
