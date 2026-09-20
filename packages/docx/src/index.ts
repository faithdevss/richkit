import { requirePro } from '@richkitjs/license'
import type { Editor } from '@richkitjs/core'
import { Document, LevelFormat, Packer } from 'docx'
import { convertDoc } from './convert'
import type { JSONNode } from './types'

export interface ExportDocxOptions {
  filename?: string
  title?: string
  author?: string
}

export async function exportToDocx(editor: Editor, opts: ExportDocxOptions = {}): Promise<Blob> {
  requirePro('docx')
  const json = editor.getJSON() as unknown as JSONNode
  const children = convertDoc(json)
  const doc = new Document({
    creator: opts.author ?? 'RichKit',
    title: opts.title,
    numbering: {
      config: [
        {
          reference: 'numbered',
          levels: [
            { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: 'left' },
            { level: 1, format: LevelFormat.LOWER_LETTER, text: '%2.', alignment: 'left' },
            { level: 2, format: LevelFormat.LOWER_ROMAN, text: '%3.', alignment: 'left' },
          ],
        },
      ],
    },
    sections: [{ children }],
  })
  return Packer.toBlob(doc)
}

export async function downloadDocx(editor: Editor, opts: ExportDocxOptions = {}): Promise<void> {
  const blob = await exportToDocx(editor, opts)
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = opts.filename ?? 'document.docx'
  a.click()
  URL.revokeObjectURL(a.href)
}

export { convertDoc } from './convert'
export type { JSONNode, JSONMark } from './types'
export { importDocxToHtml, importDocxFile } from './import'
export type { DocxImportResult } from './import'
