import { useState } from 'react'
import { FindReplaceEditor as FindReplace } from '@richkitjs/editors'
import { FIND_CONTENT } from '../content'
import { exposeEditor } from './useDevEditor'

export function FindReplaceEditor() {
  const [html, setHtml] = useState(FIND_CONTENT)
  return (
    <FindReplace
      value={html}
      onChange={setHtml}
      defaultQuery="customer"
      defaultReplacement="reader"
      onEditorReady={exposeEditor}
    />
  )
}
