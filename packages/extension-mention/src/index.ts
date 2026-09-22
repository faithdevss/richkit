import { Node, safeUrl, type Command } from '@richkitjs/core'
import { mentionPlugin } from './plugin'

export type MentionKind = 'user' | 'page'

export interface MentionAttrs {
  id: string
  label: string
  kind: MentionKind
  href: string | null
}

/**
 * An inline atom for `@user` and `@page` references. The node is inert on its
 * own — who can be mentioned is the host app's list, supplied to the menu
 * component, so this stays free of any directory or fetch.
 */
export const Mention = Node.create({
  name: 'mention',
  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,
  attrs: {
    id: { default: null },
    label: { default: null },
    kind: { default: 'user' },
    href: { default: null },
  },
  parseHTML: () => [
    {
      tag: 'span[data-mention]',
      getAttrs: (node) => {
        const el = node as HTMLElement
        return {
          id: el.getAttribute('data-mention'),
          label: el.getAttribute('data-label') ?? el.textContent?.replace(/^@/, '') ?? '',
          kind: (el.getAttribute('data-kind') as MentionKind) || 'user',
          href: safeUrl(el.getAttribute('data-href')),
        }
      },
    },
  ],
  renderHTML: (node) => {
    const { id, label, kind, href } = node.attrs as unknown as MentionAttrs
    const attrs: Record<string, string> = {
      'data-mention': id ?? '',
      'data-label': label ?? '',
      'data-kind': kind,
      class: `rk-mention rk-mention-${kind}`,
    }
    const safeHref = safeUrl(href)
    if (safeHref) attrs['data-href'] = safeHref
    return ['span', attrs, `@${label ?? id ?? ''}`]
  },
  addProseMirrorPlugins: () => [mentionPlugin()],
  addCommands: () => ({
    insertMention: (...args: unknown[]): Command => {
      const [input] = args as [Partial<MentionAttrs> & { label: string }]
      return ({ state, dispatch }) => {
        const type = state.schema.nodes['mention']
        if (!type) return false
        const node = type.create({ kind: 'user', id: input.label, ...input })
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node, false).scrollIntoView())
        return true
      }
    },
  }),
})

export {
  mentionKey,
  mentionPlugin,
  getMentionState,
  setMentionItemCount,
  closeMention,
  registerMentionEnter,
} from './plugin'
export type { MentionState, MentionMeta, MentionRange } from './plugin'
