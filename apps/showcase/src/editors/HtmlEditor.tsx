import { useState } from 'react'
import { HtmlEditor as Html } from '@richkitjs/editors'
import { HTML_CONTENT } from '../content'
import { exposeEditor } from './useDevEditor'

export function HtmlEditor() {
  const [html, setHtml] = useState(HTML_CONTENT)
  return <Html value={html} onChange={setHtml} onEditorReady={exposeEditor} />
}
