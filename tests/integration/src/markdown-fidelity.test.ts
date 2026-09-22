import { Editor } from '@richkitjs/core'
import { MathKit } from '@richkitjs/extension-math'
import { docToMarkdown, markdownToHtml, setMarkdownContent } from '@richkitjs/markdown'
import { StarterKit } from '@richkitjs/starter-kit'
import { afterEach, describe, expect, it } from 'vitest'

const extensions = [...StarterKit, ...MathKit]
let editor: Editor

function load(html: string) {
  editor = new Editor({ extensions, content: html })
  return editor
}

function toMarkdown(html: string): string {
  return docToMarkdown(load(html).state.doc)
}

function roundTrip(html: string): string {
  const md = toMarkdown(html)
  setMarkdownContent(editor, md)
  return editor.getHTML()
}

afterEach(() => editor?.destroy())

describe('markdown: math', () => {
  it('keeps $…$ as text when the schema has no math', () => {
    const plain = new Editor({ extensions: StarterKit })
    setMarkdownContent(plain, 'Area $x^2$ here\n\n$$\nE = mc^2\n$$')
    const md = docToMarkdown(plain.state.doc)
    plain.destroy()
    expect(md).toContain('Area $x^2$ here')
    expect(md).toContain('$$E = mc^2$$')
  })

  it('writes inline math as $…$ and block math as $$…$$', () => {
    const md = toMarkdown(
      '<p>Area <span data-math="\\pi r^2"></span> units</p><div data-math-block="E = mc^2"></div>',
    )
    expect(md).toContain('Area $\\pi r^2$ units')
    expect(md).toContain('$$\nE = mc^2\n$$')
  })

  it('reads both back into math nodes', () => {
    const html = roundTrip(
      '<p>Area <span data-math="\\pi r^2"></span> units</p><div data-math-block="E = mc^2"></div>',
    )
    expect(html).toContain('data-math="\\pi r^2"')
    expect(html).toContain('data-math-block="E = mc^2"')
  })

  it('parses single-line display math and leaves prices alone', () => {
    const html = markdownToHtml('$$ x^2 $$\n\nIt costs $5 and $10.')
    expect(html).toContain('data-math-block="x^2"')
    expect(html).toContain('It costs $5 and $10.')
  })

  it('escapes literal dollars so they do not turn into math', () => {
    const md = toMarkdown('<p>a $b$ c</p>')
    expect(md).toBe('a \\$b\\$ c')
    setMarkdownContent(editor, md)
    expect(editor.getHTML()).toBe('<p>a $b$ c</p>')
  })
})

describe('markdown: raw HTML', () => {
  const evil = '<img src=x onerror="alert(1)">\n\n<script>alert(1)</script>\n\nok'

  it('escapes raw HTML by default', () => {
    const html = markdownToHtml(evil)
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<script')
    expect(html).toContain('&lt;script&gt;')
  })

  it('keeps RichKit HTML but strips the rest when given extensions', () => {
    const html = markdownToHtml(`${evil}\n\n<u>under</u> and <mark>hi</mark>`, { extensions })
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('<script')
    expect(html).toContain('<u>under</u>')
    expect(html).toContain('<mark>hi</mark>')
  })

  it('passes raw HTML through only when asked', () => {
    expect(markdownToHtml('<u>x</u>', { html: true })).toContain('<u>x</u>')
  })
})

describe('markdown: tables and images', () => {
  it('keeps simple tables as GFM', () => {
    const md = toMarkdown(
      '<table><tr><th><p>A</p></th><th><p>B</p></th></tr><tr><td><p>1</p></td><td><p>2</p></td></tr></table>',
    )
    expect(md).toContain('| A | B |')
  })

  it('writes a table without a header row as HTML, and it comes back without one', () => {
    const input =
      '<table><tr><td><p>1</p></td><td><p>2</p></td></tr><tr><td><p>3</p></td><td><p>4</p></td></tr></table>'
    const md = toMarkdown(input)
    expect(md).toMatch(/^<table/)
    const html = roundTrip(input)
    expect(html).not.toContain('<th')
  })

  it('keeps merged cells and lists inside cells', () => {
    const html = roundTrip(
      '<table><tr><th colspan="2"><p>Wide</p></th></tr><tr><td><ul><li><p>x</p></li><li><p>y</p></li></ul></td><td><p>z</p></td></tr></table>',
    )
    expect(html).toContain('colspan="2"')
    expect(html).toMatch(/<td[^>]*><ul><li><p>x<\/p><\/li><li><p>y<\/p><\/li><\/ul><\/td>/)
  })

  it('keeps plain images as Markdown and sized or captioned ones as HTML', () => {
    expect(toMarkdown('<img src="https://x.test/a.png" alt="a">')).toBe(
      '![a](https://x.test/a.png)',
    )
    const html = roundTrip(
      '<figure data-image data-align="center"><img src="https://x.test/a.png" alt="a" width="240"><figcaption>Cap</figcaption></figure>',
    )
    expect(html).toContain('width="240"')
    expect(html).toContain('data-align="center"')
    expect(html).toContain('Cap')
  })
})
