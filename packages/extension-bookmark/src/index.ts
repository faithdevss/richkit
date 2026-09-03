import { Node, type Command } from '@richkitjs/core'

export interface BookmarkAttrs {
  href: string
  title: string | null
  description: string | null
  thumbnail: string | null
  favicon: string | null
}

function hostOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, '')
  } catch {
    return href
  }
}

/**
 * A link rendered as a card. Metadata is supplied by the host app — the
 * extension never fetches, so it stays usable offline and in tests; the
 * hostname is the fallback title until a `resolve` hook fills the rest in.
 */
export interface BookmarkOptions extends Record<string, unknown> {
  resolve?: (href: string) => Promise<Partial<BookmarkAttrs>>
}

export const Bookmark = Node.create<BookmarkOptions>({
  name: 'bookmark',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  addOptions: () => ({}),
  attrs: {
    href: { default: null },
    title: { default: null },
    description: { default: null },
    thumbnail: { default: null },
    favicon: { default: null },
  },
  parseHTML: () => [
    {
      tag: 'a[data-bookmark]',
      // the link mark also claims <a>; the card is the more specific match
      priority: 60,
      getAttrs: (node) => {
        const el = node as HTMLElement
        return {
          href: el.getAttribute('href'),
          title: el.getAttribute('data-title'),
          description: el.getAttribute('data-description'),
          thumbnail: el.getAttribute('data-thumbnail'),
          favicon: el.getAttribute('data-favicon'),
        }
      },
    },
  ],
  renderHTML: (node) => {
    const { href, title, description, thumbnail, favicon } = node.attrs as unknown as BookmarkAttrs
    const attrs: Record<string, string> = {
      'data-bookmark': '',
      class: 'rk-bookmark',
      href: href ?? '#',
      target: '_blank',
      rel: 'noopener noreferrer',
    }
    if (title) attrs['data-title'] = title
    if (description) attrs['data-description'] = description
    if (thumbnail) attrs['data-thumbnail'] = thumbnail
    if (favicon) attrs['data-favicon'] = favicon

    const text: unknown[] = [
      'span',
      { class: 'rk-bookmark-text' },
      ['span', { class: 'rk-bookmark-title' }, title ?? hostOf(href ?? '')],
    ]
    if (description) text.push(['span', { class: 'rk-bookmark-description' }, description])
    text.push(['span', { class: 'rk-bookmark-host' }, hostOf(href ?? '')])

    const children: unknown[] = [text]
    if (thumbnail) {
      children.push(['img', { class: 'rk-bookmark-thumb', src: thumbnail, alt: '' }])
    }
    return ['a', attrs, ...children]
  },
  addCommands: (ctx) => ({
    insertBookmark: (...args: unknown[]): Command => {
      const [input] = args as [string | Partial<BookmarkAttrs>]
      const attrs: Partial<BookmarkAttrs> = typeof input === 'string' ? { href: input } : input
      return ({ state, dispatch, view }) => {
        const type = state.schema.nodes['bookmark']
        if (!type || !attrs.href) return false
        const node = type.create({ title: hostOf(attrs.href), ...attrs })
        if (!dispatch) return true
        const tr = state.tr.replaceSelectionWith(node).scrollIntoView()
        const insertedAt = tr.selection.from - node.nodeSize
        dispatch(tr)

        const resolve = ctx.options.resolve
        if (resolve && view) {
          void resolve(attrs.href)
            .then((meta) => {
              const at = view.state.doc.resolve(insertedAt).nodeAfter
              if (at?.type !== type) return
              let next = view.state.tr
              for (const [key, value] of Object.entries(meta)) {
                next = next.setNodeAttribute(insertedAt, key, value)
              }
              view.dispatch(next)
            })
            .catch(() => {
              // a preview that cannot be fetched still leaves a usable card
            })
        }
        return true
      }
    },
  }),
})
