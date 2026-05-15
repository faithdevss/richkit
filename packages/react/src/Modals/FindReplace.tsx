import type { Editor } from '@rich-editor/core'
import { TextSelection } from 'prosemirror-state'
import { useState } from 'react'
import { Modal } from './Modal'

export interface FindReplaceProps {
  editor: Editor
  open: boolean
  onClose: () => void
}

type Match = { from: number; to: number }

function findMatches(editor: Editor, query: string, caseSensitive: boolean): Match[] {
  if (!query) return []
  const matches: Match[] = []
  const needle = caseSensitive ? query : query.toLowerCase()
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return true
    const hay = caseSensitive ? node.text : node.text.toLowerCase()
    let idx = 0
    while ((idx = hay.indexOf(needle, idx)) !== -1) {
      matches.push({ from: pos + idx, to: pos + idx + query.length })
      idx += query.length || 1
    }
    return true
  })
  return matches
}

export function FindReplace({ editor, open, onClose }: FindReplaceProps) {
  const [find, setFind] = useState('')
  const [replace, setReplace] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)

  const matches = findMatches(editor, find, caseSensitive)
  const count = matches.length

  const goto = (idx: number) => {
    if (!count) return
    const i = ((idx % count) + count) % count
    setActiveIdx(i)
    const m = matches[i]!
    const state = editor.view.state
    const tr = state.tr.setSelection(TextSelection.create(state.doc, m.from, m.to)).scrollIntoView()
    editor.view.dispatch(tr)
    editor.focus()
  }

  const replaceOne = () => {
    if (!count) return
    const m = matches[activeIdx]!
    editor.view.dispatch(editor.view.state.tr.insertText(replace, m.from, m.to))
    editor.focus()
  }

  const replaceAll = () => {
    if (!count) return
    let tr = editor.view.state.tr
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i]!
      tr = tr.insertText(replace, m.from, m.to)
    }
    editor.view.dispatch(tr)
    editor.focus()
  }

  return (
    <Modal
      open={open}
      title="Find & Replace"
      onClose={onClose}
      footer={
        <>
          <span className="re-modal-meta">
            {find ? (count ? `${activeIdx + 1} of ${count}` : 'No matches') : ''}
          </span>
          <button type="button" className="tb-btn-ghost" onClick={() => goto(activeIdx - 1)} disabled={!count}>
            Prev
          </button>
          <button type="button" className="tb-btn-ghost" onClick={() => goto(activeIdx + 1)} disabled={!count}>
            Next
          </button>
          <button type="button" className="tb-btn-ghost" onClick={replaceOne} disabled={!count}>
            Replace
          </button>
          <button type="button" className="tb-btn-primary" onClick={replaceAll} disabled={!count}>
            Replace all
          </button>
        </>
      }
    >
      <div className="re-fr-form">
        <label className="tb-field">
          <span>Find</span>
          <input autoFocus value={find} onChange={(e) => setFind(e.target.value)} placeholder="Search text…" />
        </label>
        <label className="tb-field">
          <span>Replace</span>
          <input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="Replacement" />
        </label>
        <label className="re-fr-check">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
          <span>Case sensitive</span>
        </label>
      </div>
    </Modal>
  )
}
