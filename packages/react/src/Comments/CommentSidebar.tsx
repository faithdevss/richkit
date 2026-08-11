import type { Editor } from '@richkit/core'
import { findCommentRange, getCommentsState, type Thread } from '@richkit/extension-comments'
import { TextSelection } from 'prosemirror-state'
import { useEffect, useMemo, useState } from 'react'
import { notify } from '../Notifications/notify'

export interface CommentSidebarProps {
  editor: Editor | null
  currentUser?: string
  onAddRequest?: () => void
  onClose?: () => void
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  })
}

function getThreadSnippet(editor: Editor, id: string): string {
  const range = findCommentRange(editor.state, id)
  if (!range) return ''
  return editor.state.doc.textBetween(range.from, range.to, ' ')
}

function focusThread(editor: Editor, id: string) {
  const range = findCommentRange(editor.state, id)
  if (!range) return
  const tr = editor.view.state.tr.setSelection(
    TextSelection.create(editor.view.state.doc, range.from, range.to),
  )
  editor.view.dispatch(tr)
  editor.view.focus()
}

export function CommentSidebar({
  editor,
  currentUser = 'You',
  onAddRequest,
  onClose,
}: CommentSidebarProps) {
  const [tick, setTick] = useState(0)
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open')
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!editor) return
    const off1 = editor.on('update', () => setTick((t) => t + 1))
    const off2 = editor.on('selectionUpdate', () => setTick((t) => t + 1))
    return () => {
      off1()
      off2()
    }
  }, [editor])

  const threads = useMemo<Thread[]>(() => {
    if (!editor) return []
    const s = getCommentsState(editor.state)
    if (!s) return []
    const all = Object.values(s.threads)
    if (filter === 'open') return all.filter((t) => !t.resolved)
    if (filter === 'resolved') return all.filter((t) => t.resolved)
    return all
  }, [editor, tick, filter])

  if (!editor) return null

  const addComment = async () => {
    if (onAddRequest) {
      onAddRequest()
      return
    }
    if (editor.state.selection.empty) {
      notify.toast.warn('Select some text in the editor first.')
      return
    }
    const { from, to } = editor.state.selection
    const body = await notify.prompt({
      title: 'New comment',
      placeholder: 'Write a comment…',
      required: true,
      okLabel: 'Comment',
    })
    if (!body) return
    editor.chain().call('addComment', { body, author: currentUser, from, to }).focus().run()
  }

  return (
    <aside className="re-comments-sidebar" aria-label="Comments">
      <header className="re-comments-header">
        <div className="re-comments-title-row">
          <h3>Comments</h3>
          {onClose && (
            <button
              type="button"
              className="re-sidebar-close"
              onClick={onClose}
              aria-label="Close comments panel"
              title="Close"
            >
              ×
            </button>
          )}
        </div>
        <div className="re-comments-filter">
          <button
            type="button"
            className={filter === 'open' ? 'is-active' : ''}
            onClick={() => setFilter('open')}
          >
            Open
          </button>
          <button
            type="button"
            className={filter === 'resolved' ? 'is-active' : ''}
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </button>
          <button
            type="button"
            className={filter === 'all' ? 'is-active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>
        <button type="button" className="tb-btn-primary re-comments-add" onClick={addComment}>
          + Add comment
        </button>
      </header>
      <div className="re-comments-list">
        {threads.length === 0 && (
          <p className="re-comments-empty">No {filter === 'all' ? '' : filter} comments.</p>
        )}
        {threads.map((t) => {
          const snippet = getThreadSnippet(editor, t.id)
          const draft = replyDrafts[t.id] ?? ''
          return (
            <article key={t.id} className={`re-comment-thread${t.resolved ? ' is-resolved' : ''}`}>
              <div className="re-comment-anchor" onClick={() => focusThread(editor, t.id)}>
                {snippet
                  ? `“${snippet.slice(0, 80)}${snippet.length > 80 ? '…' : ''}”`
                  : '(no text)'}
              </div>
              <div className="re-comment-meta">
                <strong>{t.author}</strong> · <span>{formatTime(t.createdAt)}</span>
              </div>
              <p className="re-comment-body">{t.body}</p>
              {t.replies.length > 0 && (
                <ul className="re-comment-replies">
                  {t.replies.map((r) => (
                    <li key={r.id}>
                      <div className="re-comment-meta">
                        <strong>{r.author}</strong> · <span>{formatTime(r.createdAt)}</span>
                      </div>
                      <p>{r.body}</p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="re-comment-reply">
                <input
                  type="text"
                  placeholder="Reply…"
                  value={draft}
                  onChange={(e) => setReplyDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && draft.trim()) {
                      editor
                        .chain()
                        .call('addCommentReply', {
                          id: t.id,
                          body: draft.trim(),
                          author: currentUser,
                        })
                        .run()
                      setReplyDrafts((d) => ({ ...d, [t.id]: '' }))
                    }
                  }}
                />
              </div>
              <div className="re-comment-actions">
                {!t.resolved ? (
                  <button
                    type="button"
                    className="tb-btn-ghost"
                    onClick={() => editor.chain().call('resolveComment', t.id).run()}
                  >
                    Resolve
                  </button>
                ) : (
                  <button
                    type="button"
                    className="tb-btn-ghost"
                    onClick={() => editor.chain().call('reopenComment', t.id).run()}
                  >
                    Reopen
                  </button>
                )}
                <button
                  type="button"
                  className="tb-btn-ghost"
                  onClick={async () => {
                    const ok = await notify.confirm({
                      title: 'Delete comment',
                      message: 'Delete this comment thread? This cannot be undone.',
                      destructive: true,
                      okLabel: 'Delete',
                    })
                    if (ok) editor.chain().call('removeComment', t.id).run()
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </aside>
  )
}
