import type { Node as PMNode } from 'prosemirror-model'
import type { EditorView, NodeView } from 'prosemirror-view'
import { getRegisteredLanguages } from './highlight'

export class CodeBlockNodeView implements NodeView {
  dom: HTMLElement
  contentDOM: HTMLElement
  private node: PMNode
  private select: HTMLSelectElement
  private gutter!: HTMLElement

  constructor(
    node: PMNode,
    private readonly view: EditorView,
    private readonly getPos: () => number | undefined,
  ) {
    this.node = node

    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper'

    const header = document.createElement('div')
    header.className = 'code-block-header'

    const select = document.createElement('select')
    select.className = 'code-block-lang'
    select.setAttribute('contenteditable', 'false')
    for (const lang of getRegisteredLanguages()) {
      const opt = document.createElement('option')
      opt.value = lang
      opt.textContent = lang
      select.appendChild(opt)
    }
    select.value = (node.attrs.language as string | null) ?? ''

    select.addEventListener('mousedown', (e) => e.stopPropagation())
    select.addEventListener('change', () => {
      const pos = this.getPos()
      if (pos == null) return
      const tr = this.view.state.tr.setNodeAttribute(pos, 'language', select.value || null)
      this.view.dispatch(tr)
    })
    this.select = select

    const copyBtn = document.createElement('button')
    copyBtn.type = 'button'
    copyBtn.className = 'code-block-copy'
    copyBtn.textContent = 'Copy'
    copyBtn.setAttribute('contenteditable', 'false')
    copyBtn.addEventListener('mousedown', (e) => e.preventDefault())
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(this.node.textContent)
        copyBtn.textContent = 'Copied'
        setTimeout(() => (copyBtn.textContent = 'Copy'), 1200)
      } catch {
        copyBtn.textContent = 'Failed'
        setTimeout(() => (copyBtn.textContent = 'Copy'), 1200)
      }
    })

    header.appendChild(select)
    header.appendChild(copyBtn)

    const pre = document.createElement('pre')
    pre.className = 'code-block-pre'

    // The gutter sits beside the code rather than inside it, so selecting and
    // copying the block never picks the numbers up.
    const gutter = document.createElement('div')
    gutter.className = 'code-block-gutter'
    gutter.setAttribute('contenteditable', 'false')
    gutter.setAttribute('aria-hidden', 'true')
    // clicking a line number should put the caret in the code, not nowhere
    gutter.style.pointerEvents = 'none'
    gutter.style.userSelect = 'none'

    const code = document.createElement('code')
    const lang = (node.attrs.language as string | null) ?? null
    if (lang) code.className = `language-${lang}`
    pre.appendChild(gutter)
    pre.appendChild(code)

    wrapper.appendChild(header)
    wrapper.appendChild(pre)

    this.dom = wrapper
    this.contentDOM = code
    this.gutter = gutter
    this.paintGutter(node)
  }

  private paintGutter(node: PMNode): void {
    const lines = node.textContent.split('\n').length
    if (this.gutter.childElementCount === lines) return
    this.gutter.replaceChildren()
    for (let i = 1; i <= lines; i++) {
      const el = document.createElement('span')
      el.className = 'code-block-line-number'
      el.setAttribute('data-line', String(i))
      el.textContent = String(i)
      this.gutter.appendChild(el)
    }
  }

  update(node: PMNode): boolean {
    if (node.type !== this.node.type) return false
    this.node = node
    const lang = (node.attrs.language as string | null) ?? ''
    if (this.select.value !== lang) this.select.value = lang
    const code = this.contentDOM as HTMLElement
    const expected = lang ? `language-${lang}` : ''
    if (code.className !== expected) code.className = expected
    this.paintGutter(node)
    return true
  }

  ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Node }): boolean {
    return this.gutter.contains(mutation.target)
  }
}
