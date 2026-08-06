import { Node, setBlockType, type Command } from '@richkit/core'

export interface HeadingOptions extends Record<string, unknown> {
  levels: number[]
}

export const Heading = Node.create<HeadingOptions>({
  name: 'heading',
  addOptions: () => ({ levels: [1, 2, 3, 4, 5, 6] }),
  group: 'block',
  content: 'inline*',
  defining: true,
  attrs: {
    level: { default: 1 },
    textAlign: { default: null },
    lineHeight: { default: null },
  },
  parseHTML: (ctx) =>
    ctx.options.levels.map((level: number) => ({
      tag: `h${level}`,
      getAttrs: (node: HTMLElement | string) => {
        const el = node as HTMLElement
        return {
          level,
          textAlign: el.style?.textAlign || null,
          lineHeight: el.style?.lineHeight || null,
        }
      },
    })),
  renderHTML: (node) => {
    const parts: string[] = []
    if (node.attrs.textAlign) parts.push(`text-align: ${node.attrs.textAlign}`)
    if (node.attrs.lineHeight) parts.push(`line-height: ${node.attrs.lineHeight}`)
    const attrs = parts.length ? { style: parts.join('; ') } : {}
    return [`h${node.attrs.level}`, attrs, 0]
  },
  addCommands: () => ({
    setHeading:
      (...args: unknown[]): Command => {
        const [opts] = args as [{ level: number }]
        return setBlockType('heading', { level: opts.level })
      },
  }),
  addKeyboardShortcuts: (ctx) => {
    const out: Record<string, Command> = {}
    for (const level of ctx.options.levels) {
      out[`Mod-Alt-${level}`] = setBlockType('heading', { level })
    }
    return out
  },
})
