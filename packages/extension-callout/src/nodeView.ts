import type { Node as ProseMirrorNode } from 'prosemirror-model'
import type { EditorView, NodeView } from 'prosemirror-view'
import { CALLOUT_VARIANTS, calloutVariant, type CalloutAttrs } from './index'

/**
 * Draws the icon gutter and the variant picker. Both sit outside `contentDOM`
 * so the callout's body stays ordinary editable blocks.
 */
export class CalloutNodeView implements NodeView {
  dom: HTMLDivElement
  contentDOM: HTMLDivElement
  private iconBtn: HTMLButtonElement
  private menu: HTMLDivElement | null = null

  constructor(
    private node: ProseMirrorNode,
    private view: EditorView,
    private getPos: () => number | undefined,
  ) {
    const attrs = node.attrs as unknown as CalloutAttrs
    const root = document.createElement('div')
    root.setAttribute('data-callout', attrs.kind)
    root.className = `rk-callout rk-callout-${attrs.kind}`

    const iconBtn = document.createElement('button')
    iconBtn.type = 'button'
    iconBtn.className = 'rk-callout-icon'
    iconBtn.contentEditable = 'false'
    iconBtn.title = 'Change callout type'
    iconBtn.setAttribute('aria-haspopup', 'menu')
    iconBtn.addEventListener('mousedown', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.toggleMenu()
    })

    const content = document.createElement('div')
    content.className = 'rk-callout-body'

    root.appendChild(iconBtn)
    root.appendChild(content)

    this.dom = root
    this.contentDOM = content
    this.iconBtn = iconBtn
    this.paint(node)
  }

  private paint(node: ProseMirrorNode) {
    const attrs = node.attrs as unknown as CalloutAttrs
    const variant = calloutVariant(attrs.kind)
    this.dom.setAttribute('data-callout', attrs.kind)
    this.dom.className = `rk-callout rk-callout-${attrs.kind}`
    this.dom.style.color = attrs.color ?? ''
    this.dom.style.backgroundColor = attrs.background ?? ''
    this.iconBtn.textContent = attrs.icon ?? variant.icon
    this.iconBtn.setAttribute('aria-label', `${variant.label} callout`)
  }

  private toggleMenu() {
    if (this.menu) {
      this.closeMenu()
      return
    }
    const menu = document.createElement('div')
    menu.className = 'rk-callout-menu'
    menu.setAttribute('role', 'menu')
    for (const variant of CALLOUT_VARIANTS) {
      const item = document.createElement('button')
      item.type = 'button'
      item.setAttribute('role', 'menuitem')
      item.className = 'rk-callout-menu-item'
      item.textContent = `${variant.icon} ${variant.label}`
      item.addEventListener('mousedown', (e) => {
        e.preventDefault()
        const pos = this.getPos()
        if (pos === undefined) return
        this.view.dispatch(this.view.state.tr.setNodeAttribute(pos, 'kind', variant.kind))
        this.closeMenu()
      })
      menu.appendChild(item)
    }
    this.dom.appendChild(menu)
    this.menu = menu
    window.addEventListener('mousedown', this.onOutside, true)
  }

  private onOutside = (e: MouseEvent) => {
    if (this.menu?.contains(e.target as Node)) return
    if (e.target === this.iconBtn) return
    this.closeMenu()
  }

  private closeMenu() {
    window.removeEventListener('mousedown', this.onOutside, true)
    this.menu?.remove()
    this.menu = null
  }

  update(node: ProseMirrorNode): boolean {
    if (node.type !== this.node.type) return false
    this.node = node
    this.paint(node)
    return true
  }

  stopEvent(event: Event): boolean {
    const target = event.target as globalThis.Node | null
    return Boolean(target && (this.iconBtn.contains(target) || this.menu?.contains(target)))
  }

  ignoreMutation(
    mutation: MutationRecord | { type: 'selection'; target: globalThis.Node },
  ): boolean {
    return !this.contentDOM.contains(mutation.target)
  }

  destroy() {
    this.closeMenu()
  }
}
