import type { Editor } from '@richkit/core'
import {
  getSuggestions,
  getTrackState,
  type SuggestionEntry,
} from '@richkit/extension-track-changes'
import { TextSelection } from 'prosemirror-state'
import { useEffect, useMemo, useState } from 'react'

export interface SuggestionSidebarProps {
  editor: Editor | null
  onClose?: () => void
}

function formatTime(ts: number): string {
  if (!ts) return ''
  return new Date(ts).toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  })
}

function focusSuggestion(editor: Editor, s: SuggestionEntry) {
  const tr = editor.view.state.tr.setSelection(
    TextSelection.create(editor.view.state.doc, s.from, s.to),
  )
  editor.view.dispatch(tr)
  editor.view.focus()
}

export function SuggestionSidebar({ editor, onClose }: SuggestionSidebarProps) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!editor) return
    const off1 = editor.on('update', () => setTick((t) => t + 1))
    const off2 = editor.on('selectionUpdate', () => setTick((t) => t + 1))
    return () => {
      off1()
      off2()
    }
  }, [editor])

  const suggestions = useMemo<SuggestionEntry[]>(() => {
    if (!editor) return []
    return getSuggestions(editor.state)
  }, [editor, tick])

  const enabled = editor ? getTrackState(editor.state)?.enabled ?? false : false

  if (!editor) return null

  const toggle = () => {
    if (enabled) editor.chain().call('disableTrackChanges').focus().run()
    else editor.chain().call('enableTrackChanges', 'You').focus().run()
  }

  const acceptAll = () => editor.chain().call('acceptAllSuggestions').focus().run()
  const rejectAll = () => editor.chain().call('rejectAllSuggestions').focus().run()

  return (
    <aside className="re-suggestions-sidebar" aria-label="Suggestions">
      <header className="re-suggestions-header">
        <div className="re-comments-title-row">
          <h3>Suggestions</h3>
          {onClose && (
            <button
              type="button"
              className="re-sidebar-close"
              onClick={onClose}
              aria-label="Close suggestions panel"
              title="Close"
            >
              ×
            </button>
          )}
        </div>
        <button
          type="button"
          className={`re-track-toggle${enabled ? ' is-on' : ''}`}
          onClick={toggle}
        >
          {enabled ? 'Tracking ON' : 'Tracking OFF'}
        </button>
        {suggestions.length > 0 && (
          <div className="re-suggestions-bulk">
            <button type="button" className="tb-btn-ghost" onClick={acceptAll}>
              Accept all
            </button>
            <button type="button" className="tb-btn-ghost" onClick={rejectAll}>
              Reject all
            </button>
          </div>
        )}
      </header>
      <div className="re-suggestions-list">
        {suggestions.length === 0 && (
          <p className="re-suggestions-empty">
            {enabled ? 'No suggestions yet. Type or delete to create some.' : 'Enable tracking to record suggestions.'}
          </p>
        )}
        {suggestions.map((s) => (
          <article
            key={s.id}
            className={`re-suggestion re-suggestion-${s.type}`}
          >
            <div className="re-suggestion-meta">
              <span className={`re-suggestion-badge re-suggestion-badge-${s.type}`}>
                {s.type === 'insertion' ? '+ Insertion' : '− Deletion'}
              </span>
              <span className="re-suggestion-author">{s.author}</span>
              <span className="re-suggestion-time">{formatTime(s.createdAt)}</span>
            </div>
            <p
              className="re-suggestion-snippet"
              onClick={() => focusSuggestion(editor, s)}
              title="Click to scroll"
            >
              “{s.text.slice(0, 120)}{s.text.length > 120 ? '…' : ''}”
            </p>
            <div className="re-suggestion-actions">
              <button
                type="button"
                className="tb-btn-primary"
                onClick={() => editor.chain().call('acceptSuggestion', s.id).focus().run()}
              >
                Accept
              </button>
              <button
                type="button"
                className="tb-btn-ghost"
                onClick={() => editor.chain().call('rejectSuggestion', s.id).focus().run()}
              >
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>
    </aside>
  )
}
