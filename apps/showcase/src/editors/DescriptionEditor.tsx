import { useState } from 'react'
import { DescriptionEditor as Description } from '@richkitjs/editors'
import { DESCRIPTION_CONTENT } from '../content'
import { exposeEditor } from './useDevEditor'

export function DescriptionEditor() {
  const [html, setHtml] = useState(DESCRIPTION_CONTENT)
  return (
    <Description
      value={html}
      onChange={setHtml}
      placeholder="Write the answer…"
      onEditorReady={exposeEditor}
    />
  )
}
