import { safeUrl } from '@richkitjs/core'
import type { Node as PMNode } from 'prosemirror-model'
import type { EditorView, NodeView } from 'prosemirror-view'

type EditText = (opts: {
  title: string
  value: string
  anchor?: HTMLElement
}) => Promise<string | null>

const ALIGNMENTS: { align: 'left' | 'center' | 'right'; label: string }[] = [
  { align: 'left', label: 'Align left' },
  { align: 'center', label: 'Align centre' },
  { align: 'right', label: 'Align right' },
]

export class ImageNodeView implements NodeView {
  readonly dom: HTMLElement
  private readonly img: HTMLImageElement
  private readonly handle: HTMLSpanElement
  private readonly caption: HTMLElement
  private readonly toolbar: HTMLElement
  private node: PMNode
  private readonly view: EditorView
  private readonly getPos: () => number | undefined
  private readonly editText: EditText

  constructor(
    node: PMNode,
    view: EditorView,
    getPos: () => number | undefined,
    editText?: EditText,
  ) {
    this.node = node
    this.view = view
    this.getPos = getPos
    this.editText = editText ?? (({ title, value }) => Promise.resolve(window.prompt(title, value)))

    this.dom = document.createElement('figure')
    this.dom.className = 'richkit-image'
    this.dom.style.display = 'inline-block'
    this.dom.style.position = 'relative'
    this.dom.style.margin = '0'

    this.img = document.createElement('img')
    this.applyAttrs(node)
    this.dom.appendChild(this.img)

    this.handle = document.createElement('span')
    this.handle.className = 'richkit-image-resize'
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

    this.caption = document.createElement('figcaption')
    this.caption.className = 'richkit-image-caption'
    this.dom.appendChild(this.caption)

    this.toolbar = this.buildToolbar()
    this.dom.appendChild(this.toolbar)

    this.paint(node)
  }

  /** Alignment, caption and alt text, shown while the image is selected. */
  private buildToolbar(): HTMLElement {
    const bar = document.createElement('div')
    bar.className = 'richkit-image-toolbar'
    bar.setAttribute('contenteditable', 'false')
    bar.hidden = true

    const button = (label: string, onPress: (btn: HTMLElement) => void) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'richkit-image-btn'
      btn.title = label
      btn.textContent = label
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault()
        e.stopPropagation()
        onPress(btn)
      })
      bar.appendChild(btn)
      return btn
    }

    for (const { align, label } of ALIGNMENTS) {
      button(label, () => {
        this.setAttr('align', this.node.attrs.align === align ? null : align)
      })
    }
    button('Caption', (anchor) => {
      void this.editText({
        title: 'Caption',
        anchor,
        value: (this.node.attrs.caption as string | null) ?? '',
      }).then((value) => {
        if (value === null) return
        this.setAttr('caption', value || null)
      })
    })
    button('Alt text', (anchor) => {
      void this.editText({
        title: 'Alt text',
        anchor,
        value: (this.node.attrs.alt as string | null) ?? '',
      }).then((value) => {
        if (value === null) return
        this.setAttr('alt', value || null)
      })
    })
    return bar
  }

  private setAttr(name: string, value: unknown): void {
    const pos = this.getPos()
    if (pos == null) return
    this.view.dispatch(this.view.state.tr.setNodeAttribute(pos, name, value))
  }

  private paint(node: PMNode): void {
    const align = node.attrs.align as string | null
    const caption = node.attrs.caption as string | null
    this.dom.setAttribute('data-image', '')
    if (align) this.dom.setAttribute('data-align', align)
    else this.dom.removeAttribute('data-align')
    this.caption.textContent = caption ?? ''
    this.caption.hidden = !caption
  }

  selectNode(): void {
    this.dom.classList.add('is-selected')
    this.toolbar.hidden = false
  }

  deselectNode(): void {
    this.dom.classList.remove('is-selected')
    this.toolbar.hidden = true
  }

  stopEvent(event: Event): boolean {
    const target = event.target as Node | null
    return Boolean(target && this.toolbar.contains(target))
  }

  private applyAttrs(node: PMNode): void {
    const { src, alt, title, width, height } = node.attrs
    this.img.src = safeUrl(src, { media: true }) ?? ''
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
    this.paint(node)
    return true
  }

  destroy(): void {
    this.handle.removeEventListener('pointerdown', this.onResizeStart)
  }
}
