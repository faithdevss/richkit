import { Node, wrapInList, type Command } from '@richkitjs/core'

export const ORDERED_LIST_STYLES = [
  'decimal',
  'decimal-leading-zero',
  'lower-alpha',
  'upper-alpha',
  'lower-roman',
  'upper-roman',
] as const
export type OrderedListStyle = (typeof ORDERED_LIST_STYLES)[number]

/**
 * Sets `listStyle` on the closest orderedList ancestor, wrapping the selection
 * in one first when the cursor is not already inside a list.
 */
function setOrderedListStyle(style: OrderedListStyle | null): Command {
  return (props) => {
    const { state, dispatch } = props
    const type = state.schema.nodes['orderedList']
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
    if (!wrapInList('orderedList')(props)) return false
    const { view } = props
    if (!view) return true
    return setOrderedListStyle(style)({
      state: view.state,
      tr: view.state.tr,
      view,
      dispatch: view.dispatch.bind(view),
    })
  }
}

export const OrderedList = Node.create({
  name: 'orderedList',
  group: 'block list',
  content: 'listItem+',
  attrs: {
    start: { default: 1 },
    listStyle: { default: null },
  },
  parseHTML: () => [
    {
      tag: 'ol',
      getAttrs: (node) => {
        const el = node as HTMLElement
        const start = el.getAttribute('start')
        const style = el.style.listStyleType
        return {
          start: start ? parseInt(start, 10) : 1,
          listStyle: (ORDERED_LIST_STYLES as readonly string[]).includes(style ?? '')
            ? style
            : null,
        }
      },
    },
  ],
  renderHTML: (node) => {
    const attrs: Record<string, string> = {}
    if (node.attrs.start !== 1) attrs.start = String(node.attrs.start)
    if (node.attrs.listStyle) attrs.style = `list-style-type: ${node.attrs.listStyle as string}`
    return Object.keys(attrs).length ? ['ol', attrs, 0] : ['ol', 0]
  },
  addCommands: () => ({
    toggleOrderedList: () => wrapInList('orderedList'),
    setOrderedListStyle: (...args: unknown[]): Command => {
      const [style] = args as [OrderedListStyle | null]
      return setOrderedListStyle(style)
    },
  }),
  addKeyboardShortcuts: () => ({
    'Mod-Shift-7': wrapInList('orderedList'),
  }),
})
