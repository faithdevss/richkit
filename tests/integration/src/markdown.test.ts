import { Editor } from '@richkitjs/core'
import { docToMarkdown, markdownToHtml, setMarkdownContent } from '@richkitjs/markdown'
import { Blockquote } from '@richkitjs/extension-blockquote'
import { Bold } from '@richkitjs/extension-bold'
import { BulletList } from '@richkitjs/extension-bullet-list'
import { Code } from '@richkitjs/extension-code'
import { CodeBlock } from '@richkitjs/extension-code-block'
import { Heading } from '@richkitjs/extension-heading'
import { Highlight } from '@richkitjs/extension-highlight'
import { HorizontalRule } from '@richkitjs/extension-horizontal-rule'
import { Image } from '@richkitjs/extension-image'
import { Italic } from '@richkitjs/extension-italic'
import { Link } from '@richkitjs/extension-link'
import { ListItem } from '@richkitjs/extension-list-item'
import { OrderedList } from '@richkitjs/extension-ordered-list'
import { Paragraph } from '@richkitjs/extension-paragraph'
import { Strike } from '@richkitjs/extension-strike'
import { Subscript } from '@richkitjs/extension-subscript'
import { Superscript } from '@richkitjs/extension-superscript'
import { TableKit } from '@richkitjs/extension-table'
import { TaskItem, TaskList } from '@richkitjs/extension-task-list'
import { TextStyle } from '@richkitjs/extension-text-style'
import { Underline } from '@richkitjs/extension-underline'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

function makeEditor(content: string) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return new Editor({
    element: el,
    extensions: [
      Paragraph,
      Heading,
      Blockquote,
      CodeBlock,
      HorizontalRule,
      BulletList,
      OrderedList,
      ListItem,
      TaskList,
      TaskItem,
      ...TableKit,
      Image,
      TextStyle,
      Bold,
      Italic,
      Underline,
      Strike,
      Code,
      Highlight,
      Subscript,
      Superscript,
      Link,
    ],
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

function roundTrip(html: string): string {
  editor.setContent(html)
  const md = docToMarkdown(editor.state.doc)
  setMarkdownContent(editor, md)
  return editor.getHTML()
}

describe('markdown serialize', () => {
  it('serializes headings, bold, italic, links', () => {
    editor.setContent(
      '<h2>Title</h2><p><strong>bold</strong> <em>it</em> <a href="https://x.com">x</a></p>',
    )
    const md = docToMarkdown(editor.state.doc)
    expect(md).toContain('## Title')
    expect(md).toContain('**bold**')
    expect(md).toContain('*it*')
    expect(md).toContain('[x](https://x.com)')
  })

  it('serializes lists and code blocks', () => {
    editor.setContent(
      '<ul><li><p>one</p></li><li><p>two</p></li></ul><pre><code class="language-js">let a = 1</code></pre>',
    )
    const md = docToMarkdown(editor.state.doc)
    expect(md).toContain('- one')
    expect(md).toContain('```js')
    expect(md).toContain('let a = 1')
  })

  it('serializes task lists as GFM checkboxes', () => {
    editor.setContent(
      '<ul data-type="task-list"><li data-type="task-item" data-checked="true"><p>done</p></li><li data-type="task-item" data-checked="false"><p>todo</p></li></ul>',
    )
    const md = docToMarkdown(editor.state.doc)
    expect(md).toContain('- [x] done')
    expect(md).toContain('- [ ] todo')
  })

  it('serializes tables as GFM pipe tables', () => {
    editor.setContent(
      '<table><tr><th><p>A</p></th><th><p>B</p></th></tr><tr><td><p>1</p></td><td><p>2</p></td></tr></table>',
    )
    const md = docToMarkdown(editor.state.doc)
    expect(md).toContain('| A | B |')
    expect(md).toContain('| --- | --- |')
    expect(md).toContain('| 1 | 2 |')
  })

  it('serializes underline/highlight/sub/sup as inline HTML', () => {
    editor.setContent('<p><u>u</u> <mark>h</mark> x<sub>1</sub> y<sup>2</sup></p>')
    const md = docToMarkdown(editor.state.doc)
    expect(md).toContain('<u>u</u>')
    expect(md).toContain('<mark>h</mark>')
    expect(md).toContain('<sub>1</sub>')
    expect(md).toContain('<sup>2</sup>')
  })

  it('drops textStyle attrs (accepted lossy)', () => {
    editor.setContent('<p><span style="color: rgb(220, 38, 38)">red</span></p>')
    const md = docToMarkdown(editor.state.doc)
    expect(md.trim()).toBe('red')
  })
})

describe('markdown parse', () => {
  it('parses GFM tables', () => {
    const html = markdownToHtml('| A | B |\n| --- | --- |\n| 1 | 2 |')
    expect(html).toContain('<table>')
    expect(html).toContain('<th>A</th>')
  })

  it('parses task lists into task-list HTML shape', () => {
    const html = markdownToHtml('- [x] done\n- [ ] todo')
    expect(html).toContain('data-type="task-list"')
    expect(html).toContain('data-type="task-item"')
    expect(html).toContain('data-checked="true"')
    expect(html).toContain('data-checked="false"')
  })

  it('setMarkdownContent loads markdown into the editor', () => {
    setMarkdownContent(editor, '# Hello\n\nSome **bold** text')
    const html = editor.getHTML()
    expect(html).toContain('<h1>Hello</h1>')
    expect(html).toContain('<strong>bold</strong>')
  })
})

describe('markdown round-trip', () => {
  it('round-trips headings, lists, marks', () => {
    const html = roundTrip(
      '<h1>T</h1><ul><li><p>a <strong>b</strong></p></li></ul><p><s>gone</s> <code>c</code></p>',
    )
    expect(html).toContain('<h1>T</h1>')
    expect(html).toContain('<strong>b</strong>')
    expect(html).toContain('<s>gone</s>')
    expect(html).toContain('<code>c</code>')
  })

  it('round-trips task list checked state', () => {
    const html = roundTrip(
      '<ul data-type="task-list"><li data-type="task-item" data-checked="true"><p>done</p></li></ul>',
    )
    expect(html).toContain('data-checked="true"')
  })

  it('round-trips table structure', () => {
    const html = roundTrip('<table><tr><th><p>A</p></th></tr><tr><td><p>1</p></td></tr></table>')
    expect(html).toContain('<table')
    expect(html).toContain('1')
  })

  it('round-trips underline via inline HTML', () => {
    const html = roundTrip('<p><u>kept</u></p>')
    expect(html).toContain('<u>kept</u>')
  })
})
