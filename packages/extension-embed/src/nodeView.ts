import { safeUrl } from '@richkitjs/core'
import type { Node as PMNode } from 'prosemirror-model'
import type { EditorView, NodeView } from 'prosemirror-view'
import type { EmbedProvider } from './providers'

export type EmbedAlign = 'left' | 'center' | 'right'

const ALIGNMENTS: { align: EmbedAlign; label: string }[] = [
  { align: 'left', label: 'Align left' },
  { align: 'center', label: 'Align centre' },
  { align: 'right', label: 'Align right' },
]

/** Inline margins, so alignment survives in exported HTML without a stylesheet. */
export function alignMargins(align: EmbedAlign | null): { left: string; right: string } {
  if (align === 'center') return { left: 'auto', right: 'auto' }
  if (align === 'right') return { left: 'auto', right: '0' }
  return { left: '', right: '' }
}

export class EmbedNodeView implements NodeView {
  readonly dom: HTMLElement
  private media: HTMLElement
  private readonly handle: HTMLSpanElement
  private readonly toolbar: HTMLElement
  private node: PMNode
  private readonly view: EditorView
  private readonly getPos: () => number | undefined

  constructor(node: PMNode, view: EditorView, getPos: () => number | undefined) {
    this.node = node
    this.view = view
    this.getPos = getPos
    this.dom = document.createElement('div')
    this.dom.className = 'richkit-embed'
    this.dom.setAttribute('data-embed', '')
    this.media = this.buildMedia(node)
    this.dom.appendChild(this.media)

    this.handle = document.createElement('span')
    this.handle.className = 'richkit-embed-resize'
    this.handle.setAttribute('contenteditable', 'false')
    Object.assign(this.handle.style, {
      position: 'absolute',
      right: '4px',
      bottom: '4px',
      width: '12px',
      height: '12px',
      background: '#1f6feb',
      border: '2px solid #fff',
      borderRadius: '2px',
      cursor: 'nwse-resize',
      userSelect: 'none',
      touchAction: 'none',
      zIndex: '1',
    } as CSSStyleDeclaration)
    this.handle.addEventListener('pointerdown', this.onResizeStart)
    this.dom.appendChild(this.handle)

    this.toolbar = this.buildToolbar()
    this.dom.appendChild(this.toolbar)

    this.applyLayout(node)
  }

  /** Alignment buttons, shown while the embed is selected. */
  private buildToolbar(): HTMLElement {
    const bar = document.createElement('div')
    bar.className = 'richkit-embed-toolbar'
    bar.setAttribute('contenteditable', 'false')
    bar.hidden = true
    for (const { align, label } of ALIGNMENTS) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'richkit-embed-btn'
      btn.title = label
      btn.textContent = label
      btn.dataset['align'] = align
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const pos = this.getPos()
        if (pos == null) return
        const next = this.node.attrs['align'] === align ? null : align
        this.view.dispatch(this.view.state.tr.setNodeAttribute(pos, 'align', next))
      })
      bar.appendChild(btn)
    }
    return bar
  }

  private buildMedia(node: PMNode): HTMLElement {
    const { provider } = node.attrs as { provider: EmbedProvider }
    const src = safeUrl(node.attrs['src']) ?? ''
    if (provider === 'video') {
      const video = document.createElement('video')
      video.src = src
      video.controls = true
      video.style.width = '100%'
      video.style.height = '100%'
      return video
    }
    const iframe = document.createElement('iframe')
    iframe.src = src
    iframe.allow = 'fullscreen; autoplay; encrypted-media; picture-in-picture'
    iframe.allowFullscreen = true
    // YouTube refuses to play (error 153) without a Referer; send the origin only.
    iframe.referrerPolicy = 'strict-origin-when-cross-origin'
    if (provider === 'generic') {
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation')
    }
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = '0'
    return iframe
  }

  private applyLayout(node: PMNode): void {
    const { width, height, aspect, align } = node.attrs as {
      width: string | null
      height: string | null
      aspect: string
      align: EmbedAlign | null
    }
    this.dom.style.width = width ?? '100%'
    this.dom.style.maxWidth = '100%'
    const margins = alignMargins(align)
    this.dom.style.marginLeft = margins.left
    this.dom.style.marginRight = margins.right
    if (align) this.dom.setAttribute('data-align', align)
    else this.dom.removeAttribute('data-align')
    for (const btn of this.toolbar.children) {
      btn.classList.toggle('is-active', (btn as HTMLElement).dataset['align'] === align)
    }
    if (height) {
      this.dom.style.height = height
      this.dom.style.aspectRatio = ''
    } else {
      this.dom.style.height = ''
      this.dom.style.aspectRatio = aspect
    }
  }

  /** Drag the corner handle to set a pixel width; height follows the aspect ratio. */
  private onResizeStart = (e: PointerEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startW = this.dom.getBoundingClientRect().width
    const parent = this.dom.parentElement
    const maxW = parent ? parent.getBoundingClientRect().width : Infinity
    // The iframe would swallow pointer events once the cursor crosses it.
    this.media.style.pointerEvents = 'none'
    this.dom.classList.add('richkit-embed-resizing')

    const onMove = (ev: PointerEvent) => {
      const next = Math.min(maxW, Math.max(160, Math.round(startW + (ev.clientX - startX))))
      this.dom.style.width = `${next}px`
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      this.media.style.pointerEvents = ''
      this.dom.classList.remove('richkit-embed-resizing')
      const pos = this.getPos()
      if (pos == null) return
      const px = parseInt(this.dom.style.width, 10)
      const width = !px || px >= maxW ? '100%' : `${px}px`
      if (width === this.node.attrs['width']) return
      this.view.dispatch(this.view.state.tr.setNodeAttribute(pos, 'width', width))
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
  }

  update(node: PMNode): boolean {
    if (node.type !== this.node.type) return false
    const srcChanged =
      node.attrs['src'] !== this.node.attrs['src'] ||
      node.attrs['provider'] !== this.node.attrs['provider']
    this.node = node
    if (srcChanged) {
      const next = this.buildMedia(node)
      this.dom.replaceChild(next, this.media)
      this.media = next
    }
    this.applyLayout(node)
    return true
  }

  selectNode(): void {
    this.dom.classList.add('richkit-embed-selected')
    this.toolbar.hidden = false
  }

  deselectNode(): void {
    this.dom.classList.remove('richkit-embed-selected')
    this.toolbar.hidden = true
  }

  stopEvent(event: Event): boolean {
    const target = event.target as Node | null
    return Boolean(target && (target === this.handle || this.toolbar.contains(target)))
  }

  destroy(): void {
    this.handle.removeEventListener('pointerdown', this.onResizeStart)
  }
}
