import { Node, toggleBlockType, type Command } from '@richkitjs/core'
import { TextSelection, type EditorState } from 'prosemirror-state'
import { codeBlockHighlightPlugin, highlighterFor, type LanguageFn } from './highlight'
import { CodeBlockNodeView } from './nodeView'

const INDENT = '  '

/** True when the caret sits inside a code block with nothing selected. */
function inCode(state: EditorState): boolean {
  const { $head, empty } = state.selection
  return empty && $head.parent.type.name === 'codeBlock'
}

/**
 * ArrowDown at the very end of a trailing code block leaves it. Without this
 * a code block written as the last node of the document is a dead end: the
 * caret cannot get past it and everything typed lands in the code.
 */
const exitOnArrowDown = (): Command => {
  return ({ state, tr, dispatch }) => {
    if (!inCode(state)) return false
    const { $head } = state.selection
    if ($head.parentOffset !== $head.parent.content.size) return false
    const after = $head.after()
    // a block already follows, so ProseMirror's own navigation is right
    if (state.doc.nodeAt(after)) return false
    const paragraph = state.schema.nodes['paragraph']
    if (!paragraph) return false
    if (dispatch) {
      tr.insert(after, paragraph.create())
      tr.setSelection(TextSelection.near(tr.doc.resolve(after + 1)))
      dispatch(tr.scrollIntoView())
    }
    return true
  }
}

/** Backspace at the head of a code block turns it back into a paragraph. */
const liftOnBackspace = (): Command => {
  return ({ state, tr, dispatch }) => {
    if (!inCode(state)) return false
    const { $head } = state.selection
    if ($head.parentOffset !== 0) return false
    const paragraph = state.schema.nodes['paragraph']
    if (!paragraph) return false
    if (dispatch) {
      dispatch(tr.setBlockType($head.start(), $head.end(), paragraph).scrollIntoView())
    }
    return true
  }
}

/**
 * Tab indents inside a code block instead of walking the focus out of the
 * editor and onto the language picker.
 */
const indentInCode = (): Command => {
  return ({ state, tr, dispatch }) => {
    const { $head, $anchor } = state.selection
    if ($head.parent.type.name !== 'codeBlock') return false
    if ($anchor.parent !== $head.parent) return false
    if (dispatch) {
      const { from, to } = state.selection
      dispatch(tr.insertText(INDENT, from, to).scrollIntoView())
    }
    return true
  }
}

/**
 * Shift-Tab takes one indent step off the current line. It reports the key as
 * handled either way, so an unindented line does not throw focus out of the
 * editor.
 */
const outdentInCode = (): Command => {
  return ({ state, tr, dispatch }) => {
    if (!inCode(state)) return false
    const { $head } = state.selection
    const text = $head.parent.textBetween(0, $head.parent.content.size)
    const lineStart = text.lastIndexOf('\n', Math.max($head.parentOffset - 1, 0)) + 1
    const indent = /^ {1,2}/.exec(text.slice(lineStart))?.[0]
    if (indent && dispatch) {
      const from = $head.start() + lineStart
      dispatch(tr.delete(from, from + indent.length).scrollIntoView())
    }
    return true
  }
}

export interface CodeBlockOptions extends Record<string, unknown> {
  /**
   * Extra highlight.js grammars, merged over the built-in set. Pass `common`
   * or `all` from `lowlight`, or single grammars from
   * `highlight.js/lib/languages/*`.
   */
  languages: Record<string, LanguageFn>
}

export const CodeBlock = Node.create<CodeBlockOptions>({
  name: 'codeBlock',
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,
  whitespace: 'pre',
  addOptions: () => ({ languages: {} }),
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
    ArrowDown: exitOnArrowDown(),
    Backspace: liftOnBackspace(),
    Tab: indentInCode(),
    'Shift-Tab': outdentInCode(),
  }),
  addProseMirrorPlugins: ({ options }) => [
    codeBlockHighlightPlugin('codeBlock', highlighterFor(options.languages)),
  ],
  addNodeViews: ({ options }) => ({
    codeBlock: (node, view, getPos) =>
      new CodeBlockNodeView(
        node,
        view,
        () => {
          const p = getPos()
          return typeof p === 'number' ? p : undefined
        },
        highlighterFor(options.languages),
      ),
  }),
})

export {
  codeBlockHighlightPlugin,
  createHighlighter,
  defaultLanguages,
  getRegisteredLanguages,
  highlighterFor,
} from './highlight'
export type { Highlighter, LanguageFn } from './highlight'
export { CodeBlockNodeView } from './nodeView'
