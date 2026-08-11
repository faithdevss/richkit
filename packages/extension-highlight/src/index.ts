import { Mark, setMark, unsetMark, type Command } from '@richkit/core'

export const Highlight = Mark.create({
  name: 'highlight',
  attrs: {
    color: { default: null },
  },
  parseHTML: () => [
    {
      tag: 'mark',
      getAttrs: (node) => {
        const el = node as HTMLElement
        return { color: el.style.backgroundColor || null }
      },
    },
    {
      style: 'background-color',
      getAttrs: (value) => {
        if (!value || value === 'transparent') return false
        return { color: value as string }
      },
    },
  ],
  renderHTML: (mark) => {
    const color = mark.attrs.color as string | null
    const attrs = color ? { style: `background-color: ${color}` } : {}
    return ['mark', attrs, 0]
  },
  addCommands: () => ({
    setHighlight: (...args: unknown[]): Command => {
      const [color] = args as [string | null]
      if (!color) return unsetMark('highlight')
      return setMark('highlight', { color })
    },
    unsetHighlight: (): Command => unsetMark('highlight'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-Shift-h': setMark('highlight', { color: '#fff59d' }),
  }),
})
