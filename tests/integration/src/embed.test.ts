import { Editor } from '@richkitjs/core'
import { Embed, normalizeEmbedUrl } from '@richkitjs/extension-embed'
import { Paragraph } from '@richkitjs/extension-paragraph'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

function makeEditor(content: string) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return new Editor({
    element: el,
    extensions: [Paragraph, Embed],
    content,
  })
}

let editor: Editor

beforeEach(() => {
  editor = makeEditor('<p></p>')
})

afterEach(() => {
  editor.destroy()
  document.body.innerHTML = ''
})

describe('normalizeEmbedUrl', () => {
  it('normalizes YouTube watch URLs to nocookie embed', () => {
    const n = normalizeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(n?.provider).toBe('youtube')
    expect(n?.src).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('handles youtu.be and shorts URLs', () => {
    expect(normalizeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')?.provider).toBe('youtube')
    expect(normalizeEmbedUrl('https://youtube.com/shorts/dQw4w9WgXcQ')?.provider).toBe('youtube')
  })

  it('normalizes Vimeo URLs', () => {
    const n = normalizeEmbedUrl('https://vimeo.com/123456789')
    expect(n?.provider).toBe('vimeo')
    expect(n?.src).toBe('https://player.vimeo.com/video/123456789')
  })

  it('detects video files', () => {
    expect(normalizeEmbedUrl('https://cdn.example.com/movie.mp4')?.provider).toBe('video')
    expect(normalizeEmbedUrl('https://cdn.example.com/movie.webm?x=1')?.provider).toBe('video')
  })

  it('falls back to generic for http(s) pages', () => {
    expect(normalizeEmbedUrl('https://example.com/page')?.provider).toBe('generic')
  })

  it('rejects javascript:, data:, and garbage', () => {
    expect(normalizeEmbedUrl('javascript:alert(1)')).toBeNull()
    expect(normalizeEmbedUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
    expect(normalizeEmbedUrl('not a url')).toBeNull()
  })
})

describe('embed node', () => {
  it('insertEmbed inserts an embed node', () => {
    editor.chain().call('insertEmbed', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ').run()
    const json = editor.getJSON() as { content: { type: string }[] }
    expect(json.content.some((n) => n.type === 'embed')).toBe(true)
  })

  it('insertEmbed rejects javascript: URLs', () => {
    editor.chain().call('insertEmbed', 'javascript:alert(1)').run()
    const json = editor.getJSON() as { content: { type: string }[] }
    expect(json.content.some((n) => n.type === 'embed')).toBe(false)
  })

  it('renderHTML adds sandbox to generic embeds only', () => {
    editor.chain().call('insertEmbed', 'https://example.com/page').run()
    expect(editor.getHTML()).toContain('sandbox=')
    editor.setContent('<p></p>')
    editor.chain().call('insertEmbed', 'https://youtu.be/dQw4w9WgXcQ').run()
    expect(editor.getHTML()).not.toContain('sandbox=')
  })

  it('parseHTML re-normalizes pasted iframes through allowlist', () => {
    editor.setContent('<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>')
    const html = editor.getHTML()
    expect(html).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('parseHTML drops iframes with non-http src', () => {
    editor.setContent('<p>before</p><iframe src="javascript:alert(1)"></iframe>')
    const json = editor.getJSON() as { content: { type: string }[] }
    expect(json.content.some((n) => n.type === 'embed')).toBe(false)
  })
  it('renders a resize handle and round-trips a resized width', () => {
    editor.setContent(
      '<div data-embed data-width="480px"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe></div>',
    )
    expect(editor.view.dom.querySelector('.richkit-embed-resize')).not.toBeNull()
    const html = editor.getHTML()
    expect(html).toContain('data-width="480px"')
    expect(html).toMatch(/[\s;"]width: ?480px/)
  })
  it('round-trips centre alignment with inline margins', () => {
    editor.setContent(
      '<div data-embed data-width="480px" data-align="center"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe></div>',
    )
    const json = editor.getJSON() as { content: { type: string; attrs: { align: string } }[] }
    expect(json.content.find((n) => n.type === 'embed')?.attrs.align).toBe('center')
    const html = editor.getHTML()
    expect(html).toContain('data-align="center"')
    expect(html).toMatch(/margin-left: ?auto/)
    expect(html).toMatch(/margin-right: ?auto/)
  })

  it('toggles alignment from the toolbar', () => {
    editor.setContent(
      '<div data-embed><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe></div>',
    )
    const btn = editor.view.dom.querySelector<HTMLElement>('.richkit-embed-btn[data-align="center"]')
    btn?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
    expect(editor.getHTML()).toContain('data-align="center"')
    btn?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
    expect(editor.getHTML()).not.toContain('data-align')
  })

  it('ignores unknown align values', () => {
    editor.setContent(
      '<div data-embed data-align="evil;x"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe></div>',
    )
    expect(editor.getHTML()).not.toContain('data-align')
  })
})
