import { Extension, type Command } from '@richkitjs/core'

export type TextAlign = 'left' | 'center' | 'right' | 'justify' | null

export interface TextAlignOptions extends Record<string, unknown> {
  types: string[]
}

function setTextAlignCmd(align: TextAlign, types: string[]): Command {
  return ({ state, tr, dispatch }) => {
    const { from, to } = state.selection
    let changed = false
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (types.includes(node.type.name)) {
        tr.setNodeAttribute(pos, 'textAlign', align)
        changed = true
      }
    })
    if (changed && dispatch) dispatch(tr)
    return changed
  }
}

export const TextAlign = Extension.create<TextAlignOptions>({
  name: 'textAlign',
  addOptions: () => ({ types: ['paragraph', 'heading'] }),
  addCommands: (ctx) => ({
    setTextAlign: (...args: unknown[]): Command => {
      const [align] = args as [TextAlign]
      return setTextAlignCmd(align, ctx.options.types)
    },
    unsetTextAlign: (): Command => setTextAlignCmd(null, ctx.options.types),
  }),
  addKeyboardShortcuts: (ctx) => ({
    'Mod-Shift-l': setTextAlignCmd('left', ctx.options.types),
    'Mod-Shift-e': setTextAlignCmd('center', ctx.options.types),
    'Mod-Shift-r': setTextAlignCmd('right', ctx.options.types),
    'Mod-Shift-j': setTextAlignCmd('justify', ctx.options.types),
  }),
})
