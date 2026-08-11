import { Node, toggleBlockType } from '@richkitjs/core'
import { codeBlockHighlightPlugin } from './highlight'
import { CodeBlockNodeView } from './nodeView'

export const CodeBlock = Node.create({
  name: 'codeBlock',
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,
  whitespace: 'pre',
  attrs: {
    language: { default: null },
  },
  parseHTML: () => [
    {
      tag: 'pre',
      preserveWhitespace: 'full',
      getAttrs: (node) => {
        const el = node as HTMLElement
        const code = el.querySelector('code')
        const cls = code?.className ?? ''
        const m = cls.match(/language-([\w-]+)/)
        return { language: m ? m[1] : null }
      },
    },
  ],
  renderHTML: (node) => {
    const lang = node.attrs.language as string | null
    const codeAttrs = lang ? { class: `language-${lang}` } : {}
    return ['pre', ['code', codeAttrs, 0]]
  },
  addCommands: () => ({
    toggleCodeBlock: () => toggleBlockType('codeBlock', 'paragraph'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-Alt-c': toggleBlockType('codeBlock', 'paragraph'),
    'Mod-Alt-C': toggleBlockType('codeBlock', 'paragraph'),
  }),
  addProseMirrorPlugins: () => [codeBlockHighlightPlugin('codeBlock')],
  addNodeViews: () => ({
    codeBlock: (node, view, getPos) =>
      new CodeBlockNodeView(node, view, () => {
        const p = getPos()
        return typeof p === 'number' ? p : undefined
      }),
  }),
})

export { codeBlockHighlightPlugin, getRegisteredLanguages } from './highlight'
export { CodeBlockNodeView } from './nodeView'
