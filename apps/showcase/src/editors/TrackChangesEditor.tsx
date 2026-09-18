import { useState } from 'react'
import { TrackChangesEditor as TrackChanges } from '@richkitjs/editors'
import { TRACK_CONTENT } from '../content'
import { exposeEditor } from './useDevEditor'

export function TrackChangesEditor() {
  const [html, setHtml] = useState(TRACK_CONTENT)
  return <TrackChanges value={html} onChange={setHtml} author="You" onEditorReady={exposeEditor} />
}
