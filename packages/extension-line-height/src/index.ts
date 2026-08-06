import { Extension, type Command } from '@richkit/core'

export interface LineHeightOptions extends Record<string, unknown> {
  types: string[]
}

function setLineHeightCmd(value: string | null, types: string[]): Command {
  return ({ state, tr, dispatch }) => {
    const { from, to } = state.selection
    let changed = false
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (types.includes(node.type.name)) {
        tr.setNodeAttribute(pos, 'lineHeight', value)
        changed = true
      }
    })
    if (changed && dispatch) dispatch(tr)
    return changed
  }
}

export const LineHeight = Extension.create<LineHeightOptions>({
  name: 'lineHeight',
  addOptions: () => ({ types: ['paragraph', 'heading'] }),
  addCommands: (ctx) => ({
    setLineHeight:
      (...args: unknown[]): Command => {
        const [value] = args as [string | null]
        return setLineHeightCmd(value, ctx.options.types)
      },
    unsetLineHeight: (): Command => setLineHeightCmd(null, ctx.options.types),
  }),
})
