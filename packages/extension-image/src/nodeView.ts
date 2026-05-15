import type { Node as PMNode } from 'prosemirror-model'
import type { EditorView, NodeView } from 'prosemirror-view'

export class ImageNodeView implements NodeView {
  readonly dom: HTMLElement
  private readonly img: HTMLImageElement
  private readonly handle: HTMLSpanElement
  private node: PMNode
  private readonly view: EditorView
  private readonly getPos: () => number | undefined

  constructor(node: PMNode, view: EditorView, getPos: () => number | undefined) {
    this.node = node
    this.view = view
    this.getPos = getPos

    this.dom = document.createElement('figure')
    this.dom.className = 'rich-editor-image'
    this.dom.style.display = 'inline-block'
    this.dom.style.position = 'relative'
    this.dom.style.margin = '0'

    this.img = document.createElement('img')
    this.applyAttrs(node)
    this.dom.appendChild(this.img)

    this.handle = document.createElement('span')
    this.handle.className = 'rich-editor-image-resize'
    Object.assign(this.handle.style, {
      position: 'absolute',
      right: '-4px',
      bottom: '-4px',
      width: '10px',
      height: '10px',
      background: '#1f6feb',
      borderRadius: '2px',
      cursor: 'nwse-resize',
      userSelect: 'none',
    } as CSSStyleDeclaration)
    this.handle.addEventListener('pointerdown', this.onResizeStart)
    this.dom.appendChild(this.handle)
  }

  private applyAttrs(node: PMNode): void {
    const { src, alt, title, width, height } = node.attrs
    this.img.src = (src as string) ?? ''
    if (alt) this.img.alt = alt as string
    else this.img.removeAttribute('alt')
    if (title) this.img.title = title as string
    else this.img.removeAttribute('title')
    if (width != null && width !== '') this.img.style.width = `${width}px`
    else this.img.style.width = ''
    if (height != null && height !== '') this.img.style.height = `${height}px`
    else this.img.style.height = ''
    this.img.style.display = 'block'
    this.img.style.maxWidth = '100%'
  }

  private onResizeStart = (e: PointerEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startW = this.img.getBoundingClientRect().width
    const aspectRatio =
      this.img.naturalHeight && this.img.naturalWidth
        ? this.img.naturalHeight / this.img.naturalWidth
        : null

    const onMove = (ev: PointerEvent) => {
      const next = Math.max(40, Math.round(startW + (ev.clientX - startX)))
      this.img.style.width = `${next}px`
      if (aspectRatio) this.img.style.height = `${Math.round(next * aspectRatio)}px`
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      const pos = this.getPos()
      if (pos == null) return
      const width = parseInt(this.img.style.width, 10) || null
      const height = parseInt(this.img.style.height, 10) || null
      const tr = this.view.state.tr.setNodeMarkup(pos, undefined, {
        ...this.node.attrs,
        width,
        height,
      })
      this.view.dispatch(tr)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
  }

  update(node: PMNode): boolean {
    if (node.type !== this.node.type) return false
    this.node = node
    this.applyAttrs(node)
    return true
  }

  destroy(): void {
    this.handle.removeEventListener('pointerdown', this.onResizeStart)
  }
}
