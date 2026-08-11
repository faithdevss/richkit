import { Node, setBlockType } from '@richkitjs/core'

export const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  attrs: {
    textAlign: { default: null },
    lineHeight: { default: null },
  },
  parseHTML: () => [
    {
      tag: 'p',
      getAttrs: (node) => {
        const el = node as HTMLElement
        return {
          textAlign: el.style.textAlign || null,
          lineHeight: el.style.lineHeight || null,
        }
      },
    },
  ],
  renderHTML: (node) => {
    const parts: string[] = []
    if (node.attrs.textAlign) parts.push(`text-align: ${node.attrs.textAlign}`)
    if (node.attrs.lineHeight) parts.push(`line-height: ${node.attrs.lineHeight}`)
    const attrs = parts.length ? { style: parts.join('; ') } : {}
    return ['p', attrs, 0]
  },
  addCommands: () => ({
    setParagraph: () => setBlockType('paragraph'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-Alt-0': setBlockType('paragraph'),
  }),
})
