import { Node, safeUrl, type Command } from '@richkitjs/core'
import { NodeSelection, type EditorState } from 'prosemirror-state'
import { ImageNodeView } from './nodeView'

function selectedImage(state: EditorState): { pos: number } | null {
  const { selection } = state
  if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
    return { pos: selection.from }
  }
  return null
}

export type ImageAlign = 'left' | 'center' | 'right'

export interface ImageAttrs {
  src: string
  alt?: string | null
  title?: string | null
  width?: string | number | null
  height?: string | number | null
  align?: ImageAlign | null
  caption?: string | null
}

export interface ImageOptions extends Record<string, unknown> {
  inline: boolean
  allowBase64: boolean
  /**
   * Collects the caption and alt text. The extension ships no dialog of its
   * own, so the host app can route this through its own prompt; the default
   * falls back to the browser's. `anchor` is the pressed button, for hosts
   * that float the prompt next to it.
   */
  editText?: (opts: {
    title: string
    value: string
    anchor?: HTMLElement
  }) => Promise<string | null>
}

export const Image = Node.create<ImageOptions>({
  name: 'image',
  addOptions: () => ({ inline: false, allowBase64: true }),
  group: 'block',
  draggable: true,
  selectable: true,
  atom: true,
  attrs: {
    src: { default: null },
    alt: { default: null },
    title: { default: null },
    width: { default: null },
    height: { default: null },
    align: { default: null },
    caption: { default: null },
  },
  parseHTML: () => [
    {
      tag: 'figure[data-image]',
      // must beat the bare img[src] rule below, which would drop the caption
      priority: 60,
      getAttrs: (node) => {
        const el = node as HTMLElement
        const img = el.querySelector('img')
        const src = safeUrl(img?.getAttribute('src'), { media: true })
        if (!img || !src) return false
        return {
          src,
          alt: img.getAttribute('alt'),
          title: img.getAttribute('title'),
          width: img.getAttribute('width'),
          height: img.getAttribute('height'),
          align: el.getAttribute('data-align'),
          caption: el.querySelector('figcaption')?.textContent ?? null,
        }
      },
    },
    {
      tag: 'img[src]',
      getAttrs: (node) => {
        const el = node as HTMLImageElement
        const src = safeUrl(el.getAttribute('src'), { media: true })
        if (!src) return false
        return {
          src,
          alt: el.getAttribute('alt'),
          title: el.getAttribute('title'),
          width: el.getAttribute('width'),
          height: el.getAttribute('height'),
        }
      },
    },
  ],
  renderHTML: (node) => {
    const { align, caption, ...attrs } = node.attrs as unknown as ImageAttrs &
      Record<string, unknown>
    const img = { ...attrs, src: safeUrl(attrs.src, { media: true }) }
    // A bare <img> stays a bare <img> so nothing downstream has to learn a
    // wrapper it never asked for; alignment or a caption earns the <figure>.
    if (!align && !caption) return ['img', img]
    const figure: Record<string, string> = { 'data-image': '', class: 'richkit-image' }
    if (align) figure['data-align'] = align
    const children: unknown[] = [['img', img]]
    if (caption) children.push(['figcaption', { class: 'richkit-image-caption' }, caption])
    return ['figure', figure, ...children]
  },
  addNodeViews: (ctx) => ({
    image: (node, view, getPos) => new ImageNodeView(node, view, getPos, ctx.options.editText),
  }),
  addCommands: () => ({
    setImageAlign: (...args: unknown[]): Command => {
      const [opts] = args as [{ align: ImageAlign | null }]
      return ({ state, dispatch }) => {
        const found = selectedImage(state)
        if (!found) return false
        if (dispatch) dispatch(state.tr.setNodeAttribute(found.pos, 'align', opts.align))
        return true
      }
    },
    setImageCaption: (...args: unknown[]): Command => {
      const [opts] = args as [{ caption: string | null }]
      return ({ state, dispatch }) => {
        const found = selectedImage(state)
        if (!found) return false
        if (dispatch) dispatch(state.tr.setNodeAttribute(found.pos, 'caption', opts.caption))
        return true
      }
    },
    setImageAlt: (...args: unknown[]): Command => {
      const [opts] = args as [{ alt: string | null }]
      return ({ state, dispatch }) => {
        const found = selectedImage(state)
        if (!found) return false
        if (dispatch) dispatch(state.tr.setNodeAttribute(found.pos, 'alt', opts.alt))
        return true
      }
    },
    insertImage: (...args: unknown[]): Command => {
      const [attrs] = args as [ImageAttrs]
      return ({ state, dispatch }) => {
        const type = state.schema.nodes['image']
        const src = safeUrl(attrs?.src, { media: true })
        if (!type || !src) return false
        const node = type.create({ ...attrs, src })
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node).scrollIntoView())
        return true
      }
    },
  }),
})
