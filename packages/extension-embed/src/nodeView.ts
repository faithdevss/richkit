import type { Node as PMNode } from 'prosemirror-model'
import type { NodeView } from 'prosemirror-view'
import type { EmbedProvider } from './providers'

export class EmbedNodeView implements NodeView {
  readonly dom: HTMLElement
  private media: HTMLElement
  private node: PMNode

  constructor(node: PMNode) {
    this.node = node
    this.dom = document.createElement('div')
    this.dom.className = 'rich-editor-embed'
    this.dom.setAttribute('data-embed', '')
    this.media = this.buildMedia(node)
    this.dom.appendChild(this.media)
    this.applyLayout(node)
  }

  private buildMedia(node: PMNode): HTMLElement {
    const { src, provider } = node.attrs as { src: string; provider: EmbedProvider }
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
    iframe.referrerPolicy = 'no-referrer'
    if (provider === 'generic') {
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation')
    }
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = '0'
    return iframe
  }

  private applyLayout(node: PMNode): void {
    const { width, height, aspect } = node.attrs as {
      width: string | null
      height: string | null
      aspect: string
    }
    this.dom.style.width = width ?? '100%'
    this.dom.style.maxWidth = '100%'
    if (height) {
      this.dom.style.height = height
      this.dom.style.aspectRatio = ''
    } else {
      this.dom.style.height = ''
      this.dom.style.aspectRatio = aspect
    }
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
    this.dom.classList.add('rich-editor-embed-selected')
  }

  deselectNode(): void {
    this.dom.classList.remove('rich-editor-embed-selected')
  }
}
