import type { Editor } from '@richkit/core'
import { docToMarkdown, setMarkdownContent } from '@richkit/markdown'
import { useEffect, useState } from 'react'
import { Modal } from './Modal'

export interface SourceCodeProps {
  editor: Editor
  open: boolean
  onClose: () => void
}

type SourceTab = 'html' | 'markdown'

export function SourceCode({ editor, open, onClose }: SourceCodeProps) {
  const [tab, setTab] = useState<SourceTab>('html')
  const [source, setSource] = useState('')

  useEffect(() => {
    if (open) setSource(tab === 'html' ? editor.getHTML() : docToMarkdown(editor.state.doc))
  }, [open, tab, editor])

  const apply = () => {
    if (tab === 'html') editor.setContent(source)
    else setMarkdownContent(editor, source)
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
      <div className="re-source-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'html'}
          className={tab === 'html' ? 'is-active' : ''}
          onClick={() => setTab('html')}
        >
          HTML
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'markdown'}
          className={tab === 'markdown' ? 'is-active' : ''}
          onClick={() => setTab('markdown')}
        >
          Markdown
        </button>
      </div>
      <textarea
        className="re-source-textarea"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        spellCheck={false}
      />
    </Modal>
  )
}
