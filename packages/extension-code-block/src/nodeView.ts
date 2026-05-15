import type { Node as PMNode } from 'prosemirror-model'
import type { EditorView, NodeView } from 'prosemirror-view'
import { getRegisteredLanguages } from './highlight'

export class CodeBlockNodeView implements NodeView {
  dom: HTMLElement
  contentDOM: HTMLElement
  private node: PMNode
  private select: HTMLSelectElement

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
    const code = document.createElement('code')
    const lang = (node.attrs.language as string | null) ?? null
    if (lang) code.className = `language-${lang}`
    pre.appendChild(code)

    wrapper.appendChild(header)
    wrapper.appendChild(pre)

    this.dom = wrapper
    this.contentDOM = code
  }

  update(node: PMNode): boolean {
    if (node.type !== this.node.type) return false
    this.node = node
    const lang = (node.attrs.language as string | null) ?? ''
    if (this.select.value !== lang) this.select.value = lang
    const code = this.contentDOM as HTMLElement
    const expected = lang ? `language-${lang}` : ''
    if (code.className !== expected) code.className = expected
    return true
  }

  ignoreMutation(): boolean {
    return false
  }
}
