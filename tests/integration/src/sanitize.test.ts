import { Editor } from '@richkitjs/core'
import { renderHtml, sanitizeHtml } from '@richkitjs/html'
import { StarterKit } from '@richkitjs/starter-kit'
import { describe, expect, it } from 'vitest'

const clean = (html: string) => sanitizeHtml(html, { extensions: StarterKit })

describe('sanitizeHtml', () => {
  it('drops script tags and event handler attributes', () => {
    const out = clean('<p onclick="alert(1)">hi<script>alert(1)</script></p>')
    expect(out).toContain('hi')
    expect(out).not.toContain('script')
    expect(out).not.toContain('onclick')
  })

  it('keeps the text of an unsafe link but not its target', () => {
    const out = clean('<p><a href="javascript:alert(1)">click</a></p>')
    expect(out).toContain('click')
    expect(out).not.toContain('javascript')
    expect(out).not.toContain('<a')
  })

  it('catches obfuscated schemes', () => {
    const out = clean('<p><a href=" JaVa&#x09;ScRiPt:alert(1)">x</a></p>')
    expect(out).not.toMatch(/script:/i)
  })

  it('keeps safe links', () => {
    const out = clean('<p><a href="https://example.com">ok</a></p>')
    expect(out).toContain('href="https://example.com"')
  })

  it('drops images with unsafe sources and keeps inlined ones', () => {
    expect(clean('<img src="javascript:alert(1)">')).not.toContain('<img')
    expect(clean('<img src="data:image/svg+xml,<svg onload=alert(1)>">')).not.toContain('<img')
    expect(clean('<img src="data:image/png;base64,AAAA">')).toContain('data:image/png')
    expect(clean('<img src="https://example.com/a.png">')).toContain(
      'src="https://example.com/a.png"',
    )
  })

  it('drops unsafe bookmark and media sources', () => {
    expect(clean('<a data-bookmark href="javascript:alert(1)">x</a>')).not.toContain('javascript')
    expect(clean('<div data-media="file" data-src="data:text/html,<b>x</b>"></div>')).not.toContain(
      'data:text/html',
    )
  })

  it('drops iframes that are not recognised embeds', () => {
    expect(clean('<iframe src="javascript:alert(1)"></iframe>')).not.toContain('javascript')
  })

  it('returns an empty string for empty input', () => {
    expect(clean('')).toBe('')
  })

  it('requires extensions or a schema', () => {
    expect(() => sanitizeHtml('<p>x</p>', {})).toThrow(/extensions/)
  })
})

describe('renderHtml', () => {
  it('renders a getJSON() document', () => {
    const editor = new Editor({
      extensions: StarterKit,
      content: '<p>hello <strong>world</strong></p>',
    })
    const out = renderHtml(editor.getJSON(), { schema: editor.schema })
    expect(out).toBe(editor.getHTML())
    editor.destroy()
  })

  it('strips unsafe URLs that arrive through JSON', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'x',
              marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
            },
          ],
        },
        { type: 'image', attrs: { src: 'javascript:alert(1)' } },
        { type: 'embed', attrs: { src: 'javascript:alert(1)', provider: 'generic' } },
      ],
    }
    const out = renderHtml(doc, { extensions: StarterKit })
    expect(out).not.toContain('javascript')
  })
})

describe('editor commands', () => {
  it('setLink refuses unsafe hrefs', () => {
    const editor = new Editor({ extensions: StarterKit, content: '<p>text</p>' })
    editor.commands.selectAll!()
    expect(editor.commands.setLink!({ href: 'javascript:alert(1)' })).toBe(false)
    expect(editor.getHTML()).not.toContain('<a')
    expect(editor.commands.setLink!({ href: 'https://example.com' })).toBe(true)
    expect(editor.getHTML()).toContain('href="https://example.com"')
    editor.destroy()
  })
})
