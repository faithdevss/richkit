import { Mark, toggleMark } from '@richkit/core'

export const Bold = Mark.create({
  name: 'bold',
  parseHTML: () => [
    { tag: 'strong' },
    { tag: 'b', getAttrs: (node) => (node as HTMLElement).style.fontWeight !== 'normal' && null },
    {
      style: 'font-weight',
      getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
    },
  ],
  renderHTML: () => ['strong', 0],
  addCommands: () => ({
    toggleBold: () => toggleMark('bold'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-b': toggleMark('bold'),
    'Mod-B': toggleMark('bold'),
  }),
})
