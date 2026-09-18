import { useState, type KeyboardEvent } from 'react'
import { useEditor, EditorContent, MentionMenu, type MentionCandidate } from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'
import { Placeholder } from '@richkitjs/extension-placeholder'
import { getMentionState } from '@richkitjs/extension-mention'
import { MENTION_MESSAGES } from '../content'
import { useDevEditor } from './useDevEditor'

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

const EXTENSIONS = [
  ...StarterKit.filter((e) => e.name !== 'placeholder'),
  Placeholder.configure({ placeholder: 'Message #design — type @ to mention someone' }),
]

export function MentionsEditor() {
  const editor = useEditor({ extensions: EXTENSIONS })
  useDevEditor(editor)
  const [messages, setMessages] = useState(MENTION_MESSAGES)

  const send = () => {
    if (!editor || !editor.state.doc.textContent.trim()) return
    // getHTML() is the editor's own serialisation: typed text is escaped and
    // mentions carry only the id and label picked from PEOPLE.
    setMessages((m) => [...m, { author: 'You', html: editor.getHTML() }])
    editor.setContent('<p></p>')
    editor.focus()
  }

  // Capture phase, so this runs before the editor turns Enter into a new
  // paragraph. While the mention menu is open, Enter picks a person instead.
  const onKeyDownCapture = (e: KeyboardEvent) => {
    if (!editor || e.key !== 'Enter' || e.shiftKey) return
    if (getMentionState(editor.state)?.active) return
    e.preventDefault()
    e.stopPropagation()
    send()
  }

  return (
    <div className="demo-frame demo-chat" data-theme="dark">
      <div className="chat-head">
        <span className="chat-channel"># design</span>
        <span className="chat-hint">Enter sends · Shift+Enter for a new line</span>
      </div>
      <div className="chat-log">
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
      </div>
      <div className="chat-composer" onKeyDownCapture={onKeyDownCapture}>
        <EditorContent editor={editor} className="editor chat-input" />
        <button type="button" className="chat-send" title="Send" onClick={send}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
        </button>
        <MentionMenu editor={editor} items={PEOPLE} />
      </div>
    </div>
  )
}
