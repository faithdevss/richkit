import { Node, wrapInList } from '@richkit/core'

export const OrderedList = Node.create({
  name: 'orderedList',
  group: 'block list',
  content: 'listItem+',
  attrs: {
    start: { default: 1 },
  },
  parseHTML: () => [
    {
      tag: 'ol',
      getAttrs: (node) => {
        const start = (node as HTMLElement).getAttribute('start')
        return { start: start ? parseInt(start, 10) : 1 }
      },
    },
  ],
  renderHTML: (node) =>
    node.attrs.start === 1 ? ['ol', 0] : ['ol', { start: node.attrs.start as number }, 0],
  addCommands: () => ({
    toggleOrderedList: () => wrapInList('orderedList'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-Shift-7': wrapInList('orderedList'),
  }),
})
