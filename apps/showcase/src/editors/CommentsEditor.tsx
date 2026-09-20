import { useState } from 'react'
import type { Editor } from '@richkitjs/core'
import { CommentsEditor as Comments } from '@richkitjs/editors-pro'
import { COMMENTS_CONTENT } from '../content'
import { exposeEditor } from './useDevEditor'

type Range = { from: number; to: number }

// Document position of the first match of `text`, so the demo can open with
// threads already anchored to real sentences.
function findText(editor: Editor, text: string): Range | null {
  let found: Range | null = null
  editor.state.doc.descendants((node, pos) => {
    if (found || !node.isText) return !found
    const at = node.text!.indexOf(text)
    if (at >= 0) found = { from: pos + at, to: pos + at + text.length }
    return false
  })
  return found
}

function seedThreads(editor: Editor) {
  const { doc, schema } = editor.state
  const mark = schema.marks['comment']
  if (!mark || doc.rangeHasMark(0, doc.content.size, mark)) return
  const first = findText(editor, '10%')
  if (first) {
    editor
      .chain()
      .call('addComment', {
        ...first,
        id: 'seed-1',
        author: 'Priya',
        body: 'Can we start at 5%? The last rollout hit a billing edge case at 10%.',
      })
      .run()
    editor
      .chain()
      .call('addCommentReply', {
        id: 'seed-1',
        author: 'Marcus',
        body: 'Fair. 5% for the first two days, then double.',
      })
      .run()
  }
  const second = findText(editor, 'Marketing holds the announcement')
  if (second) {
    editor
      .chain()
      .call('addComment', {
        ...second,
        id: 'seed-2',
        author: 'Lena',
        body: 'Marketing is fine with this — confirmed in Monday’s sync.',
      })
      .run()
  }
}

export function CommentsEditor() {
  const [html, setHtml] = useState(COMMENTS_CONTENT)
  return (
    <Comments
      value={html}
      onChange={setHtml}
      author="You"
      onEditorReady={(editor) => {
        exposeEditor(editor)
        seedThreads(editor)
      }}
    />
  )
}
