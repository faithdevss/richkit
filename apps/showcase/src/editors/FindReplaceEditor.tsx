import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'
import {
  getFindState,
  gotoNext,
  gotoPrev,
  replaceAll,
  replaceCurrent,
  setQuery,
} from '@richkitjs/extension-find-replace'
import { FIND_CONTENT } from '../content'
import { useDevEditor } from './useDevEditor'

// A custom search bar on the headless find/replace API: the plugin finds and
// highlights matches, this component is only inputs and buttons.
export function FindReplaceEditor() {
  const editor = useEditor({ extensions: StarterKit, content: FIND_CONTENT })
  useDevEditor(editor)
  const [query, setQueryText] = useState('customer')
  const [replacement, setReplacement] = useState('reader')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [, rerender] = useState(0)

  // Matches live in plugin state, so re-read them after every transaction.
  useEffect(() => {
    if (!editor) return
    return editor.on('transaction', () => rerender((n) => n + 1))
  }, [editor])

  useEffect(() => {
    if (editor) setQuery(editor.view, query, false, caseSensitive)
  }, [editor, query, caseSensitive])

  const find = editor ? getFindState(editor.state) : undefined
  const total = find?.matches.length ?? 0
  const position =
    total && find && find.current >= 0 ? `${find.current + 1} of ${total}` : `0 of ${total}`

  return (
    <div className="demo-frame demo-find" data-theme="dark">
      <div className="find-bar">
        <div className="find-row">
          <input
            className="find-input"
            placeholder="Find"
            aria-label="Find"
            value={query}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || !editor) return
              e.preventDefault()
              if (e.shiftKey) gotoPrev(editor.view)
              else gotoNext(editor.view)
            }}
          />
          <span className="find-count">{query ? position : ''}</span>
          <button
            type="button"
            className={`find-btn${caseSensitive ? ' is-active' : ''}`}
            title="Match case"
            aria-pressed={caseSensitive}
            onClick={() => setCaseSensitive((v) => !v)}
          >
            Aa
          </button>
          <button
            type="button"
            className="find-btn"
            title="Previous match (Shift+Enter)"
            disabled={!total}
            onClick={() => editor && gotoPrev(editor.view)}
          >
            ↑
          </button>
          <button
            type="button"
            className="find-btn"
            title="Next match (Enter)"
            disabled={!total}
            onClick={() => editor && gotoNext(editor.view)}
          >
            ↓
          </button>
        </div>
        <div className="find-row">
          <input
            className="find-input"
            placeholder="Replace with"
            aria-label="Replace with"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
          />
          <button
            type="button"
            className="find-btn find-btn-text"
            disabled={!total}
            onClick={() => editor && replaceCurrent(editor.view, replacement)}
          >
            Replace
          </button>
          <button
            type="button"
            className="find-btn find-btn-text"
            disabled={!total}
            onClick={() => editor && replaceAll(editor.view, replacement)}
          >
            Replace all
          </button>
        </div>
      </div>
      <div className="demo-scroll">
        <div className="demo-page demo-page-simple">
          <EditorContent editor={editor} className="editor" />
        </div>
      </div>
    </div>
  )
}
