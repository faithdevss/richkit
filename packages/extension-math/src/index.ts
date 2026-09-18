import { Node, type Command, type Editor } from '@richkitjs/core'
import { InputRule } from 'prosemirror-inputrules'
import type { Node as PMNode, NodeType } from 'prosemirror-model'
import type { NodeView } from 'prosemirror-view'
import katex, { type KatexOptions } from 'katex'

export interface MathEditRequest {
  editor: Editor
  /** Document position of the formula node. */
  pos: number
  latex: string
  displayMode: boolean
}

export interface MathOptions extends Record<string, unknown> {
  /** Passed to every `katex.render` call. `throwOnError` defaults to false. */
  katexOptions: KatexOptions
  /**
   * Called when a formula is double-clicked. Open your own editing UI and
   * finish with the `updateMath` command. Without it, a `window.prompt` asks
   * for the new LaTeX.
   */
  onEdit: ((request: MathEditRequest) => void) | null
}

const MATH_NAMES = new Set(['math', 'mathBlock'])

function renderInto(el: HTMLElement, latex: string, displayMode: boolean, options: KatexOptions) {
  // An empty formula would render nothing and be impossible to click.
  katex.render(latex || '\\square', el, { throwOnError: false, ...options, displayMode })
}

function mathNodeView(
  node: PMNode,
  getPos: () => number | undefined,
  editor: Editor,
  options: MathOptions,
  displayMode: boolean,
): NodeView {
  let current = node
  const dom = document.createElement(displayMode ? 'div' : 'span')
  dom.className = displayMode ? 'rk-math rk-math-block' : 'rk-math'
  dom.contentEditable = 'false'
  renderInto(dom, current.attrs.latex as string, displayMode, options.katexOptions)

  dom.addEventListener('dblclick', (event) => {
    event.preventDefault()
    const pos = getPos()
    if (pos === undefined) return
    const latex = current.attrs.latex as string
    if (options.onEdit) {
      options.onEdit({ editor, pos, latex, displayMode })
      return
    }
    const next = window.prompt('Formula (LaTeX)', latex)
    if (next !== null) editor.chain().call('updateMath', pos, next).run()
  })

  return {
    dom,
    update: (next) => {
      if (next.type !== current.type) return false
      if (next.attrs.latex !== current.attrs.latex) {
        renderInto(dom, next.attrs.latex as string, displayMode, options.katexOptions)
      }
      current = next
      return true
    },
    ignoreMutation: () => true,
  }
}

function insertCommand(typeName: string) {
  return (...args: unknown[]): Command => {
    const [latex] = args as [string]
    return ({ state, dispatch }) => {
      const type = state.schema.nodes[typeName] as NodeType | undefined
      if (!type || !latex?.trim()) return false
      const node = type.create({ latex: latex.trim() })
      if (dispatch) dispatch(state.tr.replaceSelectionWith(node).scrollIntoView())
      return true
    }
  }
}

const defaultOptions = (): MathOptions => ({ katexOptions: {}, onEdit: null })

/**
 * An inline LaTeX formula. Stored as `<span data-math="…">` with the source as
 * its text, so the LaTeX survives HTML export and stays readable where KaTeX
 * isn't loaded. Typing `$x^2$` turns into a formula.
 */
export const MathInline = Node.create<MathOptions>({
  name: 'math',
  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,
  addOptions: defaultOptions,
  attrs: { latex: { default: '' } },
  parseHTML: () => [
    {
      tag: 'span[data-math]',
      getAttrs: (node) => ({ latex: (node as HTMLElement).getAttribute('data-math') ?? '' }),
    },
  ],
  renderHTML: (node) => {
    const latex = node.attrs.latex as string
    return ['span', { 'data-math': latex, class: 'rk-math' }, latex]
  },
  addNodeViews: (ctx) => ({
    math: (node, _view, getPos) => mathNodeView(node, getPos, ctx.editor, ctx.options, false),
  }),
  addInputRules: (ctx) => {
    const type = ctx.editor.schema.nodes['math']
    if (!type) return []
    // `$…$` with no space just inside either dollar, so prices like "$5 and $6"
    // are left alone.
    return [
      new InputRule(/(?:^|[^$\\])\$([^\s$](?:[^$]*[^\s$])?)\$$/, (state, match, start, end) => {
        const latex = match[1]
        if (!latex) return null
        const from = start + match[0].indexOf('$')
        return state.tr.replaceWith(from, end, type.create({ latex }))
      }),
    ]
  },
  addCommands: () => ({
    insertMath: insertCommand('math'),
    updateMath: (...args: unknown[]): Command => {
      const [pos, latex] = args as [number, string]
      return ({ state, dispatch }) => {
        const node = state.doc.nodeAt(pos)
        if (!node || !MATH_NAMES.has(node.type.name) || !latex?.trim()) return false
        if (dispatch) dispatch(state.tr.setNodeMarkup(pos, undefined, { latex: latex.trim() }))
        return true
      }
    },
  }),
})

/**
 * A display formula on its own line, stored as `<div data-math-block="…">`.
 * Typing `$$x^2$$` in an empty paragraph turns it into one.
 */
export const MathBlock = Node.create<MathOptions>({
  name: 'mathBlock',
  group: 'block',
  atom: true,
  selectable: true,
  addOptions: defaultOptions,
  attrs: { latex: { default: '' } },
  parseHTML: () => [
    {
      tag: 'div[data-math-block]',
      getAttrs: (node) => ({
        latex: (node as HTMLElement).getAttribute('data-math-block') ?? '',
      }),
    },
  ],
  renderHTML: (node) => {
    const latex = node.attrs.latex as string
    return ['div', { 'data-math-block': latex, class: 'rk-math rk-math-block' }, latex]
  },
  addNodeViews: (ctx) => ({
    mathBlock: (node, _view, getPos) => mathNodeView(node, getPos, ctx.editor, ctx.options, true),
  }),
  addInputRules: (ctx) => {
    const type = ctx.editor.schema.nodes['mathBlock']
    if (!type) return []
    return [
      new InputRule(/^\$\$([^$]+)\$\$$/, (state, match, start, end) => {
        const latex = match[1]?.trim()
        if (!latex) return null
        const $start = state.doc.resolve(start)
        // Only a paragraph that holds nothing but the formula becomes a block.
        if ($start.parent.textContent.length !== end - start) return null
        return state.tr.replaceWith($start.before(), $start.after(), type.create({ latex }))
      }),
    ]
  },
  addCommands: () => ({
    insertMathBlock: insertCommand('mathBlock'),
  }),
})

/** Both nodes: `extensions: [...StarterKit, ...MathKit]`. */
export const MathKit = [MathInline, MathBlock]

/** Render LaTeX into any element — handy for a live preview in your own UI. */
export function renderMath(
  el: HTMLElement,
  latex: string,
  options: KatexOptions & { displayMode?: boolean } = {},
): void {
  renderInto(el, latex, options.displayMode ?? false, options)
}
