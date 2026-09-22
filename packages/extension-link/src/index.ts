import { Mark, safeUrl, setMark, unsetMark, type Command, type Editor } from '@richkitjs/core'
import { InputRule } from 'prosemirror-inputrules'

const URL_REGEX = /(?:^|\s)(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)\s$/

export interface LinkOptions extends Record<string, unknown> {
  openOnClick: boolean
  HTMLAttributes: Record<string, string>
  /**
   * What `Mod-K` should do. The extension has no UI of its own, so the host
   * app supplies the prompt; without one the shortcut stays unclaimed and
   * falls through to the browser.
   */
  onEditLink?: (editor: Editor) => void
}

export const Link = Mark.create<LinkOptions>({
  name: 'link',
  addOptions: () => ({
    openOnClick: true,
    HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
  }),
  attrs: {
    href: { default: null },
    target: { default: '_blank' },
    rel: { default: 'noopener noreferrer' },
  },
  inclusive: false,
  parseHTML: () => [
    {
      tag: 'a[href]',
      getAttrs: (node) => {
        const el = node as HTMLElement
        // a `javascript:` or other unsafe link keeps its text, not its target
        const href = safeUrl(el.getAttribute('href'))
        if (!href) return false
        return {
          href,
          target: el.getAttribute('target'),
          rel: el.getAttribute('rel'),
        }
      },
    },
  ],
  // Checked again on the way out: a doc loaded from JSON never went through
  // parseHTML, and this is the last stop before the attribute hits the DOM.
  renderHTML: (mark) => ['a', { ...mark.attrs, href: safeUrl(mark.attrs.href) }, 0],
  addCommands: () => ({
    setLink: (...args: unknown[]): Command => {
      const [attrs] = args as [{ href: string; target?: string; rel?: string }]
      const href = safeUrl(attrs?.href)
      if (!href) return () => false
      return setMark('link', { ...attrs, href })
    },
    unsetLink: (): Command => unsetMark('link'),
  }),
  addKeyboardShortcuts: (ctx) => {
    const onEditLink = ctx.options.onEditLink
    const out: Record<string, Command> = {}
    if (!onEditLink) return out
    out['Mod-k'] = ({ state }) => {
      if (state.selection.empty) return false
      onEditLink(ctx.editor)
      return true
    }
    return out
  },
  addInputRules: (ctx) => {
    const linkMark = ctx.editor.schema.marks['link']
    if (!linkMark) return []
    return [
      new InputRule(URL_REGEX, (state, match, start, end) => {
        const captured = match[1]
        if (!captured) return null
        const offset = match[0].indexOf(captured)
        const from = start + offset
        const to = from + captured.length
        const href = captured.startsWith('http') ? captured : `https://${captured}`
        const attrs = {
          href,
          target: ctx.options.HTMLAttributes.target ?? '_blank',
          rel: ctx.options.HTMLAttributes.rel ?? 'noopener noreferrer',
        }
        const tr = state.tr.addMark(from, to, linkMark.create(attrs))
        tr.insertText(' ', end)
        tr.removeStoredMark(linkMark)
        return tr
      }),
    ]
  },
})
