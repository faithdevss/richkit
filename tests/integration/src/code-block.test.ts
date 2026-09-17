import { Editor } from '@richkitjs/core'
import {
  CodeBlock,
  defaultLanguages,
  getRegisteredLanguages,
  highlighterFor,
  type LanguageFn,
} from '@richkitjs/extension-code-block'
import { Paragraph } from '@richkitjs/extension-paragraph'
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
  it('returns plaintext + the slim default set', () => {
    const langs = getRegisteredLanguages()
    expect(langs).toContain('plaintext')
    expect(langs).toContain('javascript')
    expect(langs).toContain('python')
    expect(langs).toContain('typescript')
    expect(langs.length).toBe(Object.keys(defaultLanguages).length + 1)
  })

  it('list is unique', () => {
    const langs = getRegisteredLanguages()
    expect(langs.length).toBe(new Set(langs).size)
  })
})

// a stand-in grammar, so the test does not depend on highlight.js directly
const toy: LanguageFn = () => ({ name: 'toy', keywords: { keyword: 'frob' }, contains: [] })

describe('code-block highlighting', () => {
  it('highlights a language referenced by its alias', () => {
    editor.setContent('<pre><code class="language-js">const x = 1</code></pre>')
    expect(editor.view.dom.querySelector('.hljs-keyword')?.textContent).toBe('const')
  })

  it('keeps an unregistered language selectable in the picker', () => {
    editor.setContent('<pre><code class="language-cobol">DISPLAY 1</code></pre>')
    const select = editor.view.dom.querySelector<HTMLSelectElement>('.code-block-lang')
    expect(select?.value).toBe('cobol')
    expect(editor.view.dom.querySelector('[class*="hljs-"]')).toBeNull()
  })

  it('registers extra grammars through the languages option', () => {
    const languages = { toy }
    const element = document.createElement('div')
    document.body.appendChild(element)
    const custom = new Editor({
      element,
      extensions: [Paragraph, CodeBlock.configure({ languages })],
      content: '<pre><code class="language-toy">frob it</code></pre>',
    })
    try {
      expect(custom.view.dom.querySelector('.hljs-keyword')?.textContent).toBe('frob')
      expect(getRegisteredLanguages(highlighterFor(languages))).toContain('toy')
      expect(getRegisteredLanguages()).not.toContain('toy')
    } finally {
      custom.destroy()
      CodeBlock.configure({ languages: {} })
    }
  })
})
