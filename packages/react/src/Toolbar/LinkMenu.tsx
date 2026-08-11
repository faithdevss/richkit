import type { Editor } from '@richkitjs/core'
import { useEffect, useState } from 'react'
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
        <button type="button" className={`tb-btn ${active ? 'is-active' : ''}`} title="Link">
          <LinkIcon />
        </button>
      }
    >
      {(close) => <LinkForm editor={editor} onClose={close} />}
    </Popover>
  )
}

function LinkForm({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    const { state } = editor
    const mark = state.schema.marks.link
    if (!mark) return
    const { from, to } = state.selection
    state.doc.nodesBetween(from, to, (node) => {
      const m = node.marks.find((mk) => mk.type === mark)
      if (m && typeof m.attrs.href === 'string') setUrl(m.attrs.href)
    })
  }, [editor])

  const apply = () => {
    const trimmed = url.trim()
    if (trimmed) editor.chain().call('setLink', { href: trimmed }).focus().run()
    onClose()
  }
  const remove = () => {
    editor.chain().call('unsetLink').focus().run()
    onClose()
  }

  return (
    <div className="tb-link-form">
      <input
        autoFocus
        type="url"
        value={url}
        placeholder="https://example.com"
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            apply()
          }
        }}
        aria-label="Link URL"
      />
      <div className="tb-link-actions">
        <button
          type="button"
          className="tb-btn-primary"
          onMouseDown={(e) => {
            e.preventDefault()
            apply()
          }}
        >
          Apply
        </button>
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
      </div>
    </div>
  )
}
