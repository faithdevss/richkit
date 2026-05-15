import { Extension } from '@rich-editor/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

export interface PlaceholderOptions extends Record<string, unknown> {
  placeholder: string
  className: string
}

export const Placeholder = Extension.create<PlaceholderOptions>({
  name: 'placeholder',
  addOptions: () => ({ placeholder: 'Write something…', className: 'is-empty' }),
  addProseMirrorPlugins: (ctx) => [
    new Plugin({
      key: new PluginKey('placeholder'),
      props: {
        decorations: (state) => {
          if (!state.doc.firstChild || state.doc.firstChild.content.size > 0) return null
          const deco = Decoration.node(0, state.doc.firstChild.nodeSize, {
            class: ctx.options.className,
            'data-placeholder': ctx.options.placeholder,
          })
          return DecorationSet.create(state.doc, [deco])
        },
      },
    }),
  ],
})
