import type { Editor } from '@richkit/core'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export interface CommentComposerProps {
  editor: Editor | null
  /** non-null when open. caller controls open/close via setter */
  range: { from: number; to: number } | null
  onClose: () => void
  onSubmit: (body: string) => void
  author?: string
}

interface Coords {
  top: number
  left: number
}

function rangeCoords(editor: Editor, from: number, to: number): Coords | null {
  try {
    const startBox = editor.view.coordsAtPos(from)
    const endBox = editor.view.coordsAtPos(to)
    if (!startBox || !endBox) return null
    const left = (startBox.left + endBox.right) / 2
    const top = Math.max(startBox.bottom, endBox.bottom) + 6
    return { top, left }
  } catch {
    return null
  }
}

export function CommentComposer({
  editor,
  range,
  onClose,
  onSubmit,
  author = 'You',
}: CommentComposerProps) {
  const [body, setBody] = useState('')
  const [coords, setCoords] = useState<Coords | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    if (!editor || !range) {
      setCoords(null)
      return
    }
    setBody('')
    setCoords(rangeCoords(editor, range.from, range.to))
  }, [editor, range])

  useEffect(() => {
    if (!range) return
    const t = window.setTimeout(() => textareaRef.current?.focus(), 30)
    return () => window.clearTimeout(t)
  }, [range])

  useEffect(() => {
    if (!range) return
    let armed = false
    const arm = window.setTimeout(() => {
      armed = true
    }, 100)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    const onMouse = (e: MouseEvent) => {
      if (!armed) return
      if (!ref.current) return
      if (ref.current.contains(e.target as Node)) return
      onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onMouse)
    return () => {
      window.clearTimeout(arm)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onMouse)
    }
  }, [range, onClose])

  if (!range || !coords || !editor) return null

  const submit = () => {
    const trimmed = body.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div
      ref={ref}
      className="re-comment-composer"
      role="dialog"
      aria-label="Add comment"
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        transform: 'translateX(-50%)',
        zIndex: 60,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="re-comment-composer-meta">
        <strong>{author}</strong> · adding comment
      </div>
      <textarea
        ref={textareaRef}
        className="re-comment-composer-input"
        placeholder="Write a comment…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault()
            submit()
          }
        }}
        rows={3}
      />
      <div className="re-comment-composer-actions">
        <button type="button" className="tb-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="tb-btn-primary" onClick={submit} disabled={!body.trim()}>
          Comment
        </button>
      </div>
    </div>
  )
}
