import type { Editor } from '@richkit/core'
import { TextSelection } from 'prosemirror-state'
import { useEffect, useMemo, useState } from 'react'

export interface OutlineEntry {
  level: number
  text: string
  pos: number
}

export function getOutline(editor: Editor): OutlineEntry[] {
  const entries: OutlineEntry[] = []
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      entries.push({
        level: (node.attrs['level'] as number) || 1,
        text: node.textContent || '(untitled)',
        pos,
      })
    }
    return true
  })
  return entries
}

function goToHeading(editor: Editor, pos: number): void {
  const { doc } = editor.view.state
  if (pos >= doc.content.size) return
  const $pos = doc.resolve(Math.min(pos + 1, doc.content.size))
  const tr = editor.view.state.tr.setSelection(TextSelection.near($pos))
  editor.view.dispatch(tr)
  editor.view.focus()
  try {
    const dom = editor.view.domAtPos(pos + 1)
    const el = dom.node.nodeType === 1 ? (dom.node as HTMLElement) : dom.node.parentElement
    el?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  } catch {
    // position may be stale between updates; selection change still landed
  }
}

export interface OutlineSidebarProps {
  editor: Editor | null
  onClose?: () => void
}

export function OutlineSidebar({ editor, onClose }: OutlineSidebarProps) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!editor) return
    return editor.on('update', () => setTick((t) => t + 1))
  }, [editor])

  const entries = useMemo(() => (editor ? getOutline(editor) : []), [editor, tick])

  if (!editor) return null

  return (
    <aside className="re-outline-sidebar" aria-label="Document outline">
      <header className="re-comments-header">
        <div className="re-comments-title-row">
          <h3>Outline</h3>
          {onClose && (
            <button
              type="button"
              className="re-sidebar-close"
              onClick={onClose}
              aria-label="Close outline panel"
              title="Close"
            >
              ×
            </button>
          )}
        </div>
      </header>
      <nav className="re-outline-list">
        {entries.length === 0 && <p className="re-comments-empty">No headings yet.</p>}
        {entries.map((entry, i) => (
          <button
            key={`${entry.pos}-${i}`}
            type="button"
            className={`re-outline-item re-outline-level-${entry.level}`}
            style={{ paddingLeft: `${8 + (entry.level - 1) * 14}px` }}
            onClick={() => goToHeading(editor, entry.pos)}
            title={entry.text}
          >
            {entry.text}
          </button>
        ))}
      </nav>
    </aside>
  )
}
