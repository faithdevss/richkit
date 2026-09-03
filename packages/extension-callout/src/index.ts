import { Node, toggleWrap, type Command } from '@richkitjs/core'
import { CalloutNodeView } from './nodeView'

export type CalloutKind = 'tip' | 'info' | 'warning' | 'important' | 'success'

export interface CalloutVariant {
  kind: CalloutKind
  label: string
  icon: string
}

/** The five variants documented for the Notion-style editor, in menu order. */
export const CALLOUT_VARIANTS: CalloutVariant[] = [
  { kind: 'tip', label: 'Tip', icon: '💡' },
  { kind: 'info', label: 'Info', icon: 'ℹ️' },
  { kind: 'warning', label: 'Warning', icon: '⚠️' },
  { kind: 'important', label: 'Important', icon: '❗' },
  { kind: 'success', label: 'Success', icon: '✅' },
]

export function calloutVariant(kind: string): CalloutVariant {
  return CALLOUT_VARIANTS.find((v) => v.kind === kind) ?? CALLOUT_VARIANTS[0]!
}

export interface CalloutAttrs {
  kind: CalloutKind
  /** Overrides the variant's emoji when the author picks their own. */
  icon: string | null
  color: string | null
  background: string | null
}

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  attrs: {
    kind: { default: 'tip' },
    icon: { default: null },
    color: { default: null },
    background: { default: null },
  },
  parseHTML: () => [
    {
      tag: 'div[data-callout]',
      getAttrs: (node) => {
        const el = node as HTMLElement
        return {
          kind: el.getAttribute('data-callout') || 'tip',
          icon: el.getAttribute('data-icon'),
          color: el.style.color || null,
          background: el.style.backgroundColor || null,
        }
      },
    },
  ],
  renderHTML: (node) => {
    const { kind, icon, color, background } = node.attrs as unknown as CalloutAttrs
    const style: string[] = []
    if (color) style.push(`color: ${color}`)
    if (background) style.push(`background-color: ${background}`)
    const attrs: Record<string, string> = {
      'data-callout': kind,
      class: `rk-callout rk-callout-${kind}`,
    }
    if (icon) attrs['data-icon'] = icon
    if (style.length) attrs['style'] = style.join('; ')
    return ['div', attrs, 0]
  },
  addNodeViews: () => ({
    callout: (node, view, getPos) => new CalloutNodeView(node, view, getPos),
  }),
  addCommands: () => ({
    toggleCallout: (...args: unknown[]): Command => {
      const [opts] = args as [{ kind?: CalloutKind }?]
      return toggleWrap('callout', { kind: opts?.kind ?? 'tip' })
    },
    setCalloutKind: (...args: unknown[]): Command => {
      const [opts] = args as [{ kind: CalloutKind }]
      return ({ state, dispatch }) => {
        const type = state.schema.nodes['callout']
        if (!type) return false
        const { $from } = state.selection
        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type !== type) continue
          if (dispatch) dispatch(state.tr.setNodeAttribute($from.before(depth), 'kind', opts.kind))
          return true
        }
        return false
      }
    },
    setCalloutIcon: (...args: unknown[]): Command => {
      const [opts] = args as [{ icon: string | null }]
      return ({ state, dispatch }) => {
        const type = state.schema.nodes['callout']
        if (!type) return false
        const { $from } = state.selection
        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type !== type) continue
          if (dispatch) dispatch(state.tr.setNodeAttribute($from.before(depth), 'icon', opts.icon))
          return true
        }
        return false
      }
    },
  }),
})

export { CalloutNodeView } from './nodeView'
