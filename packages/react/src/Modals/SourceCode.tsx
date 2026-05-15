import type { Editor } from '@rich-editor/core'
import { useEffect, useState } from 'react'
import { Modal } from './Modal'

export interface SourceCodeProps {
  editor: Editor
  open: boolean
  onClose: () => void
}

export function SourceCode({ editor, open, onClose }: SourceCodeProps) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    if (open) setHtml(editor.getHTML())
  }, [open, editor])

  const apply = () => {
    editor.setContent(html)
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Source code"
      onClose={onClose}
      width={720}
      footer={
        <>
          <button type="button" className="tb-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="tb-btn-primary" onClick={apply}>
            Apply
          </button>
        </>
      }
    >
      <textarea
        className="re-source-textarea"
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        spellCheck={false}
      />
    </Modal>
  )
}
