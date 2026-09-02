import { Node, wrapInList, type Command } from '@richkitjs/core'

export const BULLET_LIST_STYLES = ['disc', 'circle', 'square'] as const
export type BulletListStyle = (typeof BULLET_LIST_STYLES)[number]

/**
 * Sets `listStyle` on the closest bulletList ancestor, wrapping the selection in
 * one first when the cursor is not already inside a list.
 */
function setBulletListStyle(style: BulletListStyle | null): Command {
  return (props) => {
    const { state, dispatch } = props
    const type = state.schema.nodes['bulletList']
    if (!type) return false

    const { $from } = state.selection
    for (let depth = $from.depth; depth > 0; depth--) {
      if ($from.node(depth).type === type) {
        if (dispatch) {
          const pos = $from.before(depth)
          const node = $from.node(depth)
          dispatch(state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, listStyle: style }))
        }
        return true
      }
    }
    // Not in a list yet: wrap first, then re-run against the state the wrap
    // produced so one click both creates the list and styles it.
    if (!wrapInList('bulletList')(props)) return false
    const { view } = props
    if (!view) return true
    return setBulletListStyle(style)({
      state: view.state,
      tr: view.state.tr,
      view,
      dispatch: view.dispatch.bind(view),
    })
  }
}

export const BulletList = Node.create({
  name: 'bulletList',
  group: 'block list',
  content: 'listItem+',
  attrs: {
    listStyle: { default: null },
  },
  parseHTML: () => [
    {
      tag: 'ul:not([data-type="task-list"])',
      getAttrs: (node) => {
        const el = node as HTMLElement
        const style = el.style.listStyleType || el.getAttribute('type')
        return {
          listStyle: (BULLET_LIST_STYLES as readonly string[]).includes(style ?? '') ? style : null,
        }
      },
    },
  ],
  renderHTML: (node) =>
    node.attrs.listStyle
      ? ['ul', { style: `list-style-type: ${node.attrs.listStyle as string}` }, 0]
      : ['ul', 0],
  addCommands: () => ({
    toggleBulletList: () => wrapInList('bulletList'),
    setBulletListStyle: (...args: unknown[]): Command => {
      const [style] = args as [BulletListStyle | null]
      return setBulletListStyle(style)
    },
  }),
  addKeyboardShortcuts: () => ({
    'Mod-Shift-8': wrapInList('bulletList'),
  }),
})
