import { useEffect, useState } from 'react'
import { useEditor, EditorContent, Icons, ToolbarButton } from '@richkitjs/react'
import { Bold, History, Italic, Link, Paragraph } from '@richkitjs/starter-kit'
import { Placeholder } from '@richkitjs/extension-placeholder'
import { getWordCount } from '@richkitjs/extension-word-count'
import { useDevEditor } from './useDevEditor'

const LIMIT = 280

const EXTENSIONS = [
  Paragraph,
  Bold,
  Italic,
  Link,
  History,
  Placeholder.configure({ placeholder: 'Add a reply…' }),
]

const EMPTY = { words: 0, characters: 0, charactersNoSpaces: 0, readingTimeMinutes: 0 }

export function CommentBoxEditor() {
  const editor = useEditor({ extensions: EXTENSIONS })
  useDevEditor(editor)
  const [stats, setStats] = useState(EMPTY)
  const [replies, setReplies] = useState<string[]>([])

  useEffect(() => {
    if (!editor) return
    return editor.on('update', () => setStats(getWordCount(editor.state.doc)))
  }, [editor])

  const left = LIMIT - stats.characters
  const over = left < 0
  const canPost = stats.words > 0 && !over

  const post = () => {
    if (!editor || !canPost) return
    // getHTML() is the editor's own serialisation, so typed text arrives escaped.
    setReplies((r) => [...r, editor.getHTML()])
    editor.setContent('<p></p>')
    setStats(EMPTY)
  }

  return (
    <div className="demo-frame demo-reply" data-theme="dark">
      <div className="demo-scroll">
        <div className="reply-card">
          <div className="reply-post">
            <span className="chat-avatar" aria-hidden>
              L
            </span>
            <div>
              <div className="chat-author">Lena</div>
              <p>
                We’re trimming the onboarding checklist from seven steps to four. Which three would
                you cut?
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
          <div className={`reply-box${over ? ' is-over' : ''}`}>
            <EditorContent editor={editor} className="editor reply-input" />
            <div className="reply-foot">
              {editor && (
                <div className="reply-tools">
                  <ToolbarButton
                    editor={editor}
                    command="toggleBold"
                    isActiveName="bold"
                    label={<Icons.BoldIcon />}
                    title="Bold"
                  />
                  <ToolbarButton
                    editor={editor}
                    command="toggleItalic"
                    isActiveName="italic"
                    label={<Icons.ItalicIcon />}
                    title="Italic"
                  />
                </div>
              )}
              <span className="reply-count" aria-live="polite">
                {stats.words} {stats.words === 1 ? 'word' : 'words'} ·{' '}
                <b>{over ? `${-left} over` : `${left} left`}</b>
              </span>
              <button type="button" className="reply-post-btn" disabled={!canPost} onClick={post}>
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
