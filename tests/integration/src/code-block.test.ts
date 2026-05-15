import { Editor } from '@rich-editor/core'
import { CodeBlock, getRegisteredLanguages } from '@rich-editor/extension-code-block'
import { Paragraph } from '@rich-editor/extension-paragraph'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

function makeEditor(content = '<p></p>') {
  const element = document.createElement('div')
  document.body.appendChild(element)
  return new Editor({
    element,
    extensions: [Paragraph, CodeBlock],
    content,
  })
}

let editor: Editor

beforeEach(() => {
  editor = makeEditor()
})

afterEach(() => {
  editor.destroy()
  document.body.innerHTML = ''
})

describe('code-block language attribute', () => {
  it('default language is null', () => {
    editor.command('toggleCodeBlock')
    const block = editor.state.doc.firstChild
    expect(block?.type.name).toBe('codeBlock')
    expect(block?.attrs.language).toBeNull()
  })

  it('round-trips language from HTML class', () => {
    editor.setContent('<pre><code class="language-javascript">const x = 1</code></pre>')
    const block = editor.state.doc.firstChild
    expect(block?.attrs.language).toBe('javascript')
    expect(editor.getHTML()).toContain('class="language-javascript"')
  })

  it('renders language class when set', () => {
    editor.setContent('<pre><code class="language-python">print(1)</code></pre>')
    expect(editor.getHTML()).toMatch(/class="language-python"/)
  })

  it('no class when language is null', () => {
    editor.setContent('<pre><code>plain</code></pre>')
    const html = editor.getHTML()
    expect(html).toContain('<pre>')
    expect(html).not.toMatch(/class="language-/)
  })
})

describe('getRegisteredLanguages', () => {
  it('returns plaintext + common languages', () => {
    const langs = getRegisteredLanguages()
    expect(langs).toContain('plaintext')
    expect(langs).toContain('javascript')
    expect(langs).toContain('python')
    expect(langs.length).toBeGreaterThan(20)
  })

  it('list is unique', () => {
    const langs = getRegisteredLanguages()
    expect(langs.length).toBe(new Set(langs).size)
  })
})
