import { Mark, toggleMark } from '@rich-editor/core'

export const Code = Mark.create({
  name: 'code',
  excludes: '_',
  parseHTML: () => [{ tag: 'code' }],
  renderHTML: () => ['code', 0],
  addCommands: () => ({
    toggleCode: () => toggleMark('code'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-e': toggleMark('code'),
    'Mod-E': toggleMark('code'),
  }),
})
