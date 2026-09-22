import { Node, safeUrl, type Command } from '@richkitjs/core'
import { EmbedNodeView, alignMargins, type EmbedAlign } from './nodeView'
import { normalizeEmbedUrl, type EmbedProvider } from './providers'

export interface EmbedAttrs {
  src: string
  provider: EmbedProvider
  width?: string | null
  height?: string | null
  aspect?: string
  align?: EmbedAlign | null
}

function attrsFromUrl(url: string | null): EmbedAttrs | false {
  if (!url) return false
  const normalized = normalizeEmbedUrl(url)
  if (!normalized) return false
  return normalized
}

function parseAlign(value: string | null): EmbedAlign | null {
  return value === 'left' || value === 'center' || value === 'right' ? value : null
}

export const Embed = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  attrs: {
    src: { default: null },
    provider: { default: 'generic' },
    width: { default: '100%' },
    height: { default: null },
    aspect: { default: '16/9' },
    align: { default: null },
  },
  parseHTML: () => [
    {
      tag: 'div[data-embed]',
      getAttrs: (node) => {
        const el = node as HTMLElement
        const inner = el.querySelector('iframe, video')
        const attrs = attrsFromUrl(inner?.getAttribute('src') ?? el.getAttribute('data-src'))
        if (!attrs) return false
        return {
          ...attrs,
          width: el.getAttribute('data-width') ?? '100%',
          height: el.getAttribute('data-height'),
          aspect: el.getAttribute('data-aspect') ?? attrs.aspect,
          align: parseAlign(el.getAttribute('data-align')),
        }
      },
    },
    {
      tag: 'iframe[src]',
      getAttrs: (node) => attrsFromUrl((node as HTMLElement).getAttribute('src')),
    },
    {
      tag: 'video[src]',
      getAttrs: (node) => attrsFromUrl((node as HTMLElement).getAttribute('src')),
    },
  ],
  renderHTML: (node) => {
    const { provider, width, height, aspect, align } = node.attrs as unknown as EmbedAttrs
    // parseHTML already normalizes the URL; a doc loaded from JSON did not pass through it
    const src = safeUrl(node.attrs.src) ?? ''
    const margins = alignMargins(align ?? null)
    const marginStyle = margins.left
      ? `;margin-left:${margins.left};margin-right:${margins.right}`
      : ''
    const wrapper: Record<string, string> = {
      'data-embed': '',
      'data-provider': provider,
      'data-src': src,
      'data-width': width ?? '100%',
      'data-aspect': aspect ?? '16/9',
      style: `width:${width ?? '100%'};max-width:100%;aspect-ratio:${aspect ?? '16/9'}${marginStyle}`,
    }
    if (height) wrapper['data-height'] = height
    if (align) wrapper['data-align'] = align
    if (provider === 'video') {
      return ['div', wrapper, ['video', { src, controls: '', style: 'width:100%;height:100%' }]]
    }
    const iframe: Record<string, string> = {
      src,
      allow: 'fullscreen; autoplay; encrypted-media; picture-in-picture',
      allowfullscreen: '',
      referrerpolicy: 'strict-origin-when-cross-origin',
      style: 'width:100%;height:100%;border:0',
    }
    if (provider === 'generic') {
      iframe['sandbox'] = 'allow-scripts allow-same-origin allow-presentation'
    }
    return ['div', wrapper, ['iframe', iframe]]
  },
  addNodeViews: () => ({
    embed: (node, view, getPos) => new EmbedNodeView(node, view, getPos),
  }),
  addCommands: () => ({
    insertEmbed: (...args: unknown[]): Command => {
      const [url] = args as [string]
      return ({ state, dispatch }) => {
        const type = state.schema.nodes['embed']
        if (!type) return false
        const normalized = normalizeEmbedUrl(url)
        if (!normalized) return false
        const node = type.create(normalized)
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node).scrollIntoView())
        return true
      }
    },
  }),
})

export { normalizeEmbedUrl } from './providers'
export type { EmbedProvider, NormalizedEmbed } from './providers'
export type { EmbedAlign } from './nodeView'
