import { useState } from 'react'
import { CommentBoxEditor as CommentBox } from '@richkitjs/editors'
import { exposeEditor } from './useDevEditor'

export function CommentBoxEditor() {
  const [draft, setDraft] = useState('')
  const [replies, setReplies] = useState<string[]>([])

  return (
    <CommentBox
      value={draft}
      onChange={setDraft}
      limit={280}
      onSubmit={(html) => setReplies((r) => [...r, html])}
      onEditorReady={exposeEditor}
    >
      <div className="reply-post">
        <span className="chat-avatar" aria-hidden>
          L
        </span>
        <div>
          <div className="chat-author">Lena</div>
          <p>
            We’re trimming the onboarding checklist from seven steps to four. Which three would you
            cut?
          </p>
        </div>
      </div>
      {replies.map((html, i) => (
        <div className="reply-post" key={i}>
          <span className="chat-avatar" aria-hidden>
            Y
          </span>
          <div>
            <div className="chat-author">You</div>
            <div className="editor chat-body" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      ))}
    </CommentBox>
  )
}
