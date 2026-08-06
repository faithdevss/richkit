import { Editor } from '@richkit/core'
import { exportToDocx, importDocxToHtml, importDocxFile } from '@richkit/docx'
import { Bold } from '@richkit/extension-bold'
import { Heading } from '@richkit/extension-heading'
import { Italic } from '@richkit/extension-italic'
import { Paragraph } from '@richkit/extension-paragraph'
import { TableKit } from '@richkit/extension-table'
import { Underline } from '@richkit/extension-underline'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

function makeEditor(content: string) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return new Editor({
    element: el,
    extensions: [Paragraph, Heading, Bold, Italic, Underline, ...TableKit],
    content,
  })
}

let editor: Editor

// jsdom's Blob lacks arrayBuffer(); go through FileReader
function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as ArrayBuffer)
    r.onerror = () => reject(r.error)
    r.readAsArrayBuffer(blob)
  })
}

beforeEach(() => {
  editor = makeEditor('<p></p>')
})

afterEach(() => {
  editor.destroy()
  document.body.innerHTML = ''
})

describe('docx import', () => {
  it('round-trips through export → import', async () => {
    editor.setContent(
      '<h1>Doc Title</h1><p>Some <strong>bold</strong> and <em>italic</em> and <u>underlined</u> text.</p>',
    )
    const blob = await exportToDocx(editor)
    const buffer = await blobToArrayBuffer(blob)
    const { html } = await importDocxToHtml(buffer)
    expect(html).toContain('Doc Title')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<em>italic</em>')
    expect(html).toContain('<u>underlined</u>')
  })

  it('importDocxFile sets editor content', async () => {
    editor.setContent('<h2>Imported heading</h2><p>Body text.</p>')
    const blob = await exportToDocx(editor)
    const buffer = await blobToArrayBuffer(blob)

    editor.setContent('<p>overwritten</p>')
    const warnings = await importDocxFile(editor, buffer)
    expect(Array.isArray(warnings)).toBe(true)
    const html = editor.getHTML()
    expect(html).toContain('Imported heading')
    expect(html).toContain('Body text.')
    expect(html).not.toContain('overwritten')
  })

  it('imports tables', async () => {
    editor.setContent('<table><tr><th><p>H</p></th></tr><tr><td><p>cell</p></td></tr></table>')
    const blob = await exportToDocx(editor)
    const { html } = await importDocxToHtml(await blobToArrayBuffer(blob))
    expect(html).toContain('<table>')
    expect(html).toContain('cell')
  })
})
