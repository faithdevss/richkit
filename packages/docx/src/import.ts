import type { Editor } from '@richkit/core'
import mammoth from 'mammoth'

export interface DocxImportResult {
  html: string
  warnings: string[]
}

const STYLE_MAP = [
  'u => u',
  'strike => s',
  'highlight => mark',
  "p[style-name='Quote'] => blockquote > p",
  "p[style-name='Intense Quote'] => blockquote > p",
]

export async function importDocxToHtml(data: ArrayBuffer): Promise<DocxImportResult> {
  // browser build of mammoth reads `arrayBuffer`, node build reads `buffer`
  const input: { arrayBuffer: ArrayBuffer; buffer?: Uint8Array } = { arrayBuffer: data }
  if (typeof Buffer !== 'undefined') input.buffer = Buffer.from(data)
  const result = await mammoth.convertToHtml(input as never, { styleMap: STYLE_MAP })
  return {
    html: result.value,
    warnings: result.messages.map((m) => m.message),
  }
}

export async function importDocxFile(editor: Editor, file: File | ArrayBuffer): Promise<string[]> {
  const buffer = file instanceof ArrayBuffer ? file : await file.arrayBuffer()
  const { html, warnings } = await importDocxToHtml(buffer)
  editor.setContent(html)
  return warnings
}
