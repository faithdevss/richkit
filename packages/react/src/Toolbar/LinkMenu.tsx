import type { Editor } from '@richkitjs/core'
import type { MarkType } from 'prosemirror-model'
import { TextSelection, type EditorState } from 'prosemirror-state'
import { useState, type KeyboardEvent } from 'react'
import { LinkIcon } from '../icons'
import { Popover } from './Popover'

export interface LinkMenuProps {
  editor: Editor
}

export function LinkMenu({ editor }: LinkMenuProps) {
  const active = editor.isActive('link')
  return (
    <Popover
      className="tb-pop-link"
      trigger={
        <button
          type="button"
          className={`tb-btn ${active ? 'is-active' : ''}`}
          title="Link"
          aria-label="Link"
        >
          <LinkIcon />
        </button>
      }
    >
      {(close) => <LinkPanel editor={editor} onClose={close} />}
    </Popover>
  )
}

interface LinkTarget {
  from: number
  to: number
  text: string
  href: string
}

/**
 * The range the form edits: the selection, or — when the cursor sits inside
 * a link with nothing selected — the whole link, so it can be edited in place.
 */
function readTarget(state: EditorState, type: MarkType): LinkTarget {
  const { from, to, empty, $from } = state.selection
  let range = { from, to }
  if (empty) {
    // Only strictly inside: at a link's edge the cursor starts a new link.
    const before = $from.nodeBefore && type.isInSet($from.nodeBefore.marks)
    const after = $from.nodeAfter && type.isInSet($from.nodeAfter.marks)
    const mark = before && after && before.eq(after) ? before : null
    if (mark) {
      const start = $from.start()
      let runFrom = -1
      $from.parent.forEach((child, offset) => {
        const s = start + offset
        const e = s + child.nodeSize
        if (!mark.isInSet(child.marks)) {
          runFrom = -1
          return
        }
        if (runFrom < 0) runFrom = s
        if (runFrom <= from && from <= e) range = { from: runFrom, to: e }
      })
    }
  }
  let href = ''
  state.doc.nodesBetween(range.from, range.to, (node) => {
    const m = type.isInSet(node.marks)
    if (m && typeof m.attrs.href === 'string') href = m.attrs.href
  })
  return { ...range, text: state.doc.textBetween(range.from, range.to, ' '), href }
}

export interface LinkPanelProps {
  editor: Editor
  onClose: () => void
}

/** Link + display-text form; used by the toolbar popover and `notify.link`. */
export function LinkPanel({ editor, onClose }: LinkPanelProps) {
  const type = editor.state.schema.marks.link
  const [target] = useState(() => (type ? readTarget(editor.state, type) : null))
  const [url, setUrl] = useState(target?.href ?? '')
  const [text, setText] = useState(target?.text ?? '')

  const remove = () => {
    if (type && target && target.from < target.to) {
      editor.view.dispatch(editor.state.tr.removeMark(target.from, target.to, type))
    }
    editor.focus()
    onClose()
  }

  const apply = () => {
    const href = url.trim()
    if (!href && target?.href) return remove()
    if (!type || !target || !href) return onClose()
    const { state } = editor
    const { from, to } = target
    const mark = type.create({ href })
    const label = text.trim() ? text : href
    const tr = state.tr
    let end = to
    if (from < to && label === target.text) {
      // Text untouched: re-mark the range so inline formatting survives.
      tr.removeMark(from, to, type).addMark(from, to, mark)
    } else {
      const marks = mark.addToSet(type.removeFromSet(state.doc.resolve(from).marks()))
      tr.replaceWith(from, to, state.schema.text(label, marks))
      end = from + label.length
    }
    tr.setSelection(TextSelection.create(tr.doc, end)).removeStoredMark(type)
    editor.view.dispatch(tr.scrollIntoView())
    editor.focus()
    onClose()
  }
  const onEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      apply()
    }
  }

  return (
    <div className="tb-link-form">
      <label className="tb-field">
        <span>Link</span>
        <input
          autoFocus
          type="url"
          value={url}
          placeholder="https://example.com"
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={onEnter}
        />
      </label>
      <label className="tb-field">
        <span>Text to display</span>
        <input
          type="text"
          value={text}
          placeholder="Defaults to the link"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onEnter}
        />
      </label>
      <div className="tb-link-actions">
        <button
          type="button"
          className="tb-btn-primary"
          onMouseDown={(e) => {
            e.preventDefault()
            apply()
          }}
        >
          {target?.href ? 'Update' : 'Insert'}
        </button>
        {target?.href && (
          <button
            type="button"
            className="tb-btn-ghost"
            onMouseDown={(e) => {
              e.preventDefault()
              remove()
            }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
