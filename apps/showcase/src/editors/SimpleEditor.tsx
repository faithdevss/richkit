import { useState } from 'react'
import { SimpleEditor as Simple } from '@richkitjs/editors-pro'
import { LICENSE_KEY } from '../license'
import { SIMPLE_CONTENT } from '../content'
import { exposeEditor } from './useDevEditor'

export function SimpleEditor() {
  const [html, setHtml] = useState(SIMPLE_CONTENT)
  return (
    <Simple value={html} onChange={setHtml} licenseKey={LICENSE_KEY} onEditorReady={exposeEditor} />
  )
}
