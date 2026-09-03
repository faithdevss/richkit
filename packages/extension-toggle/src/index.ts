import { Node, type Command } from '@richkitjs/core'
import { TextSelection } from 'prosemirror-state'
import { ToggleNodeView } from './nodeView'

/**
 * A collapsible block: a one-line summary plus a body that holds any other
 * block, toggles included. Collapsed state is a document attribute rather
 * than view state so it survives a reload and round-trips through HTML.
 */
export const Toggle = Node.create({
  name: 'toggle',
  group: 'block',
  content: 'toggleSummary toggleBody',
  defining: true,
  attrs: { open: { default: true } },
  parseHTML: () => [
    {
      tag: 'details[data-toggle]',
      getAttrs: (node) => ({ open: (node as HTMLElement).hasAttribute('open') }),
    },
  ],
  renderHTML: (node) => {
    const attrs: Record<string, string> = { 'data-toggle': '', class: 'rk-toggle' }
    if (node.attrs.open) attrs['open'] = ''
    return ['details', attrs, 0]
  },
  addNodeViews: () => ({
    toggle: (node, view, getPos) => new ToggleNodeView(node, view, getPos),
  }),
  addCommands: () => ({
    insertToggle:
      (): Command =>
      ({ state, dispatch }) => {
        const toggle = state.schema.nodes['toggle']
        const summary = state.schema.nodes['toggleSummary']
        const body = state.schema.nodes['toggleBody']
        const paragraph = state.schema.nodes['paragraph']
        if (!toggle || !summary || !body || !paragraph) return false
        const node = toggle.create({ open: true }, [
          summary.create(),
          body.create(null, paragraph.create()),
        ])
        if (dispatch) {
          const { from, to } = state.selection
          const tr = state.tr.replaceRangeWith(from, to, node)
          // land the caret in the summary so the author can name it right away
          const start = tr.mapping.map(from, -1)
          const summaryPos = Math.min(start + 2, tr.doc.content.size)
          dispatch(tr.setSelection(TextSelection.near(tr.doc.resolve(summaryPos))).scrollIntoView())
        }
        return true
      },
    toggleToggleOpen:
      (): Command =>
      ({ state, dispatch }) => {
        const type = state.schema.nodes['toggle']
        if (!type) return false
        const { $from } = state.selection
        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type !== type) continue
          const pos = $from.before(depth)
          const open = !($from.node(depth).attrs.open as boolean)
          if (dispatch) dispatch(state.tr.setNodeAttribute(pos, 'open', open))
          return true
        }
        return false
      },
  }),
})

export const ToggleSummary = Node.create({
  name: 'toggleSummary',
  content: 'inline*',
  defining: true,
  parseHTML: () => [{ tag: 'summary' }],
  renderHTML: () => ['summary', { class: 'rk-toggle-summary' }, 0],
})

export const ToggleBody = Node.create({
  name: 'toggleBody',
  content: 'block+',
  parseHTML: () => [{ tag: 'div[data-toggle-body]' }],
  renderHTML: () => ['div', { 'data-toggle-body': '', class: 'rk-toggle-body' }, 0],
})

export const ToggleKit = [Toggle, ToggleSummary, ToggleBody]

export { ToggleNodeView } from './nodeView'
