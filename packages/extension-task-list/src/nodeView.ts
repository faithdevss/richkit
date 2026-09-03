import type { Node as ProseMirrorNode } from 'prosemirror-model'
import type { EditorView, NodeView } from 'prosemirror-view'

/**
 * Renders the checkbox a to-do list needs to be usable with the mouse. The
 * input lives outside `contentDOM` so ProseMirror never treats it as text,
 * and toggling it dispatches an ordinary transaction — so it is undoable and
 * collaborative editing sees it like any other change.
 */
export class TaskItemNodeView implements NodeView {
  dom: HTMLLIElement
  contentDOM: HTMLDivElement
  private checkbox: HTMLInputElement

  constructor(
    private node: ProseMirrorNode,
    private view: EditorView,
    private getPos: () => number | undefined,
  ) {
    const li = document.createElement('li')
    li.setAttribute('data-type', 'task-item')
    li.setAttribute('data-checked', String(node.attrs.checked))

    const label = document.createElement('label')
    label.className = 'rk-task-check'
    label.contentEditable = 'false'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = Boolean(node.attrs.checked)
    checkbox.addEventListener('mousedown', (e) => e.stopPropagation())
    checkbox.addEventListener('change', () => {
      const pos = this.getPos()
      if (pos === undefined) return
      this.view.dispatch(this.view.state.tr.setNodeAttribute(pos, 'checked', checkbox.checked))
    })
    label.appendChild(checkbox)

    const content = document.createElement('div')
    content.className = 'rk-task-content'

    li.appendChild(label)
    li.appendChild(content)

    this.dom = li
    this.contentDOM = content
    this.checkbox = checkbox
  }

  update(node: ProseMirrorNode): boolean {
    if (node.type !== this.node.type) return false
    this.node = node
    const checked = Boolean(node.attrs.checked)
    this.dom.setAttribute('data-checked', String(checked))
    if (this.checkbox.checked !== checked) this.checkbox.checked = checked
    return true
  }

  stopEvent(event: Event): boolean {
    return event.target === this.checkbox
  }

  ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Node }): boolean {
    // everything outside contentDOM is ours to manage; edits inside are not
    return !this.contentDOM.contains(mutation.target)
  }
}
