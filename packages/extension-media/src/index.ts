import { Node, safeUrl, type Command } from '@richkitjs/core'

export type MediaKind = 'video' | 'audio' | 'file'

export interface MediaAttrs {
  kind: MediaKind
  src: string
  name: string | null
  mime: string | null
  size: number | null
}

function nameFromSrc(src: string): string {
  try {
    const path = new URL(src, 'https://example.invalid').pathname
    return decodeURIComponent(path.split('/').pop() || src)
  } catch {
    return src
  }
}

function humanSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value < 10 && unit > 0 ? value.toFixed(1) : String(Math.round(value))} ${units[unit]!}`
}

/**
 * Self-hosted video, audio, and file attachments. Third-party players
 * (YouTube, Vimeo) stay with the embed extension; this one is for media the
 * document owns, so it renders a real `<video>`/`<audio>`/download card.
 */
export const Media = Node.create({
  name: 'media',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  attrs: {
    kind: { default: 'file' },
    src: { default: null },
    name: { default: null },
    mime: { default: null },
    size: { default: null },
  },
  parseHTML: () => [
    {
      tag: '[data-media]',
      getAttrs: (node) => {
        const el = node as HTMLElement
        const src = safeUrl(
          el.getAttribute('data-src') ?? el.querySelector('video, audio, a')?.getAttribute('src'),
          { media: true },
        )
        if (!src) return false
        const size = el.getAttribute('data-size')
        return {
          kind: (el.getAttribute('data-media') as MediaKind) || 'file',
          src,
          name: el.getAttribute('data-name'),
          mime: el.getAttribute('data-mime'),
          size: size ? Number(size) : null,
        }
      },
    },
  ],
  renderHTML: (node) => {
    const { kind, name, mime, size } = node.attrs as unknown as MediaAttrs
    // an unsafe source renders as an empty card rather than a live link
    const src = safeUrl(node.attrs.src, { media: true }) ?? ''
    const wrapper: Record<string, string> = {
      'data-media': kind,
      'data-src': src,
      class: `rk-media rk-media-${kind}`,
    }
    if (name) wrapper['data-name'] = name
    if (mime) wrapper['data-mime'] = mime
    if (size !== null) wrapper['data-size'] = String(size)

    if (kind === 'video') {
      return ['div', wrapper, ['video', { src, controls: '', class: 'rk-media-player' }]]
    }
    if (kind === 'audio') {
      return ['div', wrapper, ['audio', { src, controls: '', class: 'rk-media-player' }]]
    }
    const label = name ?? nameFromSrc(src)
    const meta = size !== null ? humanSize(size) : (mime ?? 'File')
    return [
      'div',
      wrapper,
      [
        'a',
        {
          href: src,
          download: '',
          class: 'rk-media-file',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        ['span', { class: 'rk-media-name' }, label],
        ['span', { class: 'rk-media-meta' }, meta],
      ],
    ]
  },
  addCommands: () => ({
    insertMedia: (...args: unknown[]): Command => {
      const [input] = args as [Partial<MediaAttrs> & { src: string }]
      return ({ state, dispatch }) => {
        const type = state.schema.nodes['media']
        const src = safeUrl(input?.src, { media: true })
        if (!type || !src) return false
        const attrs = { kind: 'file' as MediaKind, name: nameFromSrc(src), ...input, src }
        if (dispatch) dispatch(state.tr.replaceSelectionWith(type.create(attrs)).scrollIntoView())
        return true
      }
    },
  }),
})

export { humanSize, nameFromSrc }
