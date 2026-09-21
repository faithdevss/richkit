import { useState } from 'react'
import { DocxEditor as Docx } from '@richkitjs/editors-pro'
import { LICENSE_KEY } from '../license'
import { DOCX_CONTENT } from '../content'
import { exposeEditor } from './useDevEditor'

export function DocxEditor() {
  const [html, setHtml] = useState(DOCX_CONTENT)
  return (
    <Docx
      value={html}
      onChange={setHtml}
      title="Non-disclosure agreement"
      filename="non-disclosure-agreement.docx"
      brand={
        <>
          ▤ RichKit <em>DOCX EDITOR</em>
        </>
      }
      licenseKey={LICENSE_KEY}
      onEditorReady={exposeEditor}
    />
  )
}
