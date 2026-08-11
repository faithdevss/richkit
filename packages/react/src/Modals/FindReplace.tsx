import type { Editor } from '@richkit/core'
import {
  clearFind,
  getFindState,
  gotoNext,
  gotoPrev,
  replaceAll as replaceAllFn,
  replaceCurrent,
  setQuery,
} from '@richkit/extension-find-replace'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Modal } from './Modal'

export interface FindReplaceProps {
  editor: Editor
  open: boolean
  onClose: () => void
}

export function FindReplace({ editor, open, onClose }: FindReplaceProps) {
  const [find, setFind] = useState('')
  const [replace, setReplace] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [regex, setRegex] = useState(false)
  const [tick, setTick] = useState(0)
  const findInputRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!open) return
    setQuery(editor.view, find, regex, caseSensitive)
    findInputRef.current?.focus()
    findInputRef.current?.select()
    return () => {
      clearFind(editor.view)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    setQuery(editor.view, find, regex, caseSensitive)
    refresh()
  }, [find, regex, caseSensitive, open, editor, refresh])

  const s = getFindState(editor.state)
  const count = s?.matches.length ?? 0
  const current = s?.current ?? -1

  const next = () => {
    gotoNext(editor.view)
    refresh()
  }
  const prev = () => {
    gotoPrev(editor.view)
    refresh()
  }
  const replaceOne = () => {
    if (replaceCurrent(editor.view, replace)) {
      gotoNext(editor.view)
      refresh()
    }
  }
  const replaceAllClick = () => {
    const n = replaceAllFn(editor.view, replace)
    if (n > 0) refresh()
  }

  const handleClose = () => {
    clearFind(editor.view)
    onClose()
  }

  void tick

  return (
    <Modal
      open={open}
      title="Find & Replace"
      onClose={handleClose}
      footer={
        <>
          <span className="re-modal-meta">
            {find ? (count ? `${current + 1} of ${count}` : 'No matches') : ''}
          </span>
          <button type="button" className="tb-btn-ghost" onClick={prev} disabled={!count}>
            Prev
          </button>
          <button type="button" className="tb-btn-ghost" onClick={next} disabled={!count}>
            Next
          </button>
          <button type="button" className="tb-btn-ghost" onClick={replaceOne} disabled={!count}>
            Replace
          </button>
          <button
            type="button"
            className="tb-btn-primary"
            onClick={replaceAllClick}
            disabled={!count}
          >
            Replace all
          </button>
        </>
      }
    >
      <div className="re-fr-form">
        <label className="tb-field">
          <span>Find</span>
          <input
            ref={findInputRef}
            value={find}
            onChange={(e) => setFind(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (e.shiftKey) prev()
                else next()
              }
            }}
            placeholder="Search text…"
          />
        </label>
        <label className="tb-field">
          <span>Replace</span>
          <input
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            placeholder="Replacement"
          />
        </label>
        <div className="re-fr-flags">
          <label className="re-fr-check">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
            />
            <span>Match case</span>
          </label>
          <label className="re-fr-check">
            <input type="checkbox" checked={regex} onChange={(e) => setRegex(e.target.checked)} />
            <span>Regex</span>
          </label>
        </div>
      </div>
    </Modal>
  )
}
