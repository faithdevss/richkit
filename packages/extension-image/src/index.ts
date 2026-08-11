import { Node, type Command } from '@richkit/core'
import { ImageNodeView } from './nodeView'

export interface ImageAttrs {
  src: string
  alt?: string | null
  title?: string | null
  width?: string | number | null
  height?: string | number | null
}

export interface ImageOptions extends Record<string, unknown> {
  inline: boolean
  allowBase64: boolean
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
  },
  parseHTML: () => [
    {
      tag: 'img[src]',
      getAttrs: (node) => {
        const el = node as HTMLImageElement
        return {
          src: el.getAttribute('src'),
          alt: el.getAttribute('alt'),
          title: el.getAttribute('title'),
          width: el.getAttribute('width'),
          height: el.getAttribute('height'),
        }
      },
    },
  ],
  renderHTML: (node) => ['img', node.attrs],
  addNodeViews: () => ({
    image: (node, view, getPos) => new ImageNodeView(node, view, getPos),
  }),
  addCommands: () => ({
    insertImage: (...args: unknown[]): Command => {
      const [attrs] = args as [ImageAttrs]
      return ({ state, dispatch }) => {
        const type = state.schema.nodes['image']
        if (!type) return false
        const node = type.create(attrs)
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node).scrollIntoView())
        return true
      }
    },
  }),
})
