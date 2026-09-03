import type { Node as ProseMirrorNode } from 'prosemirror-model'
import type { EditorView, NodeView } from 'prosemirror-view'

/**
 * `<details>` swallows clicks and manages its own open state, which fights
 * ProseMirror. This draws the twisty itself and keeps `open` in the document.
 */
export class ToggleNodeView implements NodeView {
  dom: HTMLDivElement
  contentDOM: HTMLDivElement
  private twisty: HTMLButtonElement

  constructor(
    private node: ProseMirrorNode,
    private view: EditorView,
    private getPos: () => number | undefined,
  ) {
    const root = document.createElement('div')
    root.setAttribute('data-toggle', '')
    root.className = 'rk-toggle'

    const twisty = document.createElement('button')
    twisty.type = 'button'
    twisty.className = 'rk-toggle-twisty'
    twisty.contentEditable = 'false'
    twisty.title = 'Collapse or expand'
    twisty.textContent = '▸'
    twisty.addEventListener('mousedown', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const pos = this.getPos()
      if (pos === undefined) return
      const open = !(this.node.attrs.open as boolean)
      this.view.dispatch(this.view.state.tr.setNodeAttribute(pos, 'open', open))
    })

    const content = document.createElement('div')
    content.className = 'rk-toggle-content'

    root.appendChild(twisty)
    root.appendChild(content)

    this.dom = root
    this.contentDOM = content
    this.twisty = twisty
    this.paint(node)
  }

  private paint(node: ProseMirrorNode) {
    const open = Boolean(node.attrs.open)
    this.dom.setAttribute('data-open', String(open))
    this.dom.classList.toggle('is-collapsed', !open)
    this.twisty.setAttribute('aria-expanded', String(open))
    this.twisty.textContent = open ? '▾' : '▸'
  }

  update(node: ProseMirrorNode): boolean {
    if (node.type !== this.node.type) return false
    this.node = node
    this.paint(node)
    return true
  }

  stopEvent(event: Event): boolean {
    return event.target === this.twisty
  }

  ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Node }): boolean {
    return !this.contentDOM.contains(mutation.target)
  }
}
