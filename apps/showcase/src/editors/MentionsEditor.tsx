import { useState } from 'react'
import type { MentionCandidate } from '@richkitjs/react'
import { MentionsEditor as Mentions } from '@richkitjs/editors'
import { MENTION_MESSAGES } from '../content'
import { exposeEditor } from './useDevEditor'

// Who and what can be mentioned is the app's data — the editor only stores
// the id and label of whatever was picked.
const PEOPLE: MentionCandidate[] = [
  { id: 'priya', label: 'Priya', detail: 'Product design' },
  { id: 'marcus', label: 'Marcus', detail: 'Frontend' },
  { id: 'lena', label: 'Lena', detail: 'Marketing' },
  { id: 'sam', label: 'Sam', detail: 'Finance' },
  { id: 'onboarding-v2', label: 'Onboarding v2', kind: 'page', detail: 'Specs / Growth' },
  { id: 'launch-plan', label: 'Launch plan', kind: 'page', detail: 'Docs / Q4' },
]

export function MentionsEditor() {
  const [messages, setMessages] = useState(MENTION_MESSAGES)
  const [draft, setDraft] = useState('')

  return (
    <Mentions
      value={draft}
      onChange={setDraft}
      mentions={PEOPLE}
      placeholder="Message #design — type @ to mention someone"
      onSubmit={(html) => setMessages((m) => [...m, { author: 'You', html }])}
      header={
        <>
          <span className="chat-channel"># design</span>
          <span className="chat-hint">Enter sends · Shift+Enter for a new line</span>
        </>
      }
      onEditorReady={exposeEditor}
    >
      {messages.map((m, i) => (
        <div className="chat-msg" key={i}>
          <span className="chat-avatar" aria-hidden>
            {m.author[0]}
          </span>
          <div>
            <div className="chat-author">{m.author}</div>
            <div className="editor chat-body" dangerouslySetInnerHTML={{ __html: m.html }} />
          </div>
        </div>
      ))}
    </Mentions>
  )
}
