import { useState } from 'react'
import { MarkdownEditor as Markdown } from '@richkitjs/editors'
import { MARKDOWN_CONTENT } from '../content'
import { exposeEditor } from './useDevEditor'

export function MarkdownEditor() {
  // MarkdownEditor's value is Markdown by default.
  const [markdown, setMarkdown] = useState(MARKDOWN_CONTENT)
  return (
    <Markdown
      value={markdown}
      onChange={setMarkdown}
      filename="release-notes.md"
      onEditorReady={exposeEditor}
    />
  )
}
