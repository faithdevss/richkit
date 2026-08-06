import { Mark, toggleMark } from '@richkit/core'

export const Italic = Mark.create({
  name: 'italic',
  parseHTML: () => [
    { tag: 'em' },
    { tag: 'i', getAttrs: (node) => (node as HTMLElement).style.fontStyle !== 'normal' && null },
    { style: 'font-style=italic' },
  ],
  renderHTML: () => ['em', 0],
  addCommands: () => ({
    toggleItalic: () => toggleMark('italic'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-i': toggleMark('italic'),
    'Mod-I': toggleMark('italic'),
  }),
})
