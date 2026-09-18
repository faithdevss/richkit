import { useState } from 'react'
import { MinimalEditor as Minimal } from '@richkitjs/editors'
import { MINIMAL_CONTENT } from '../content'
import { exposeEditor } from './useDevEditor'

export function MinimalEditor() {
  const [html, setHtml] = useState(MINIMAL_CONTENT)
  return <Minimal value={html} onChange={setHtml} onEditorReady={exposeEditor} />
}
