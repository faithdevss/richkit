import type { Editor } from '@richkitjs/core'
import {
  closeMention,
  getMentionState,
  registerMentionEnter,
  setMentionItemCount,
  type MentionRange,
} from '@richkitjs/extension-mention'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface MentionCandidate {
  id: string
  label: string
  kind?: 'user' | 'page'
  /** Secondary line — a handle, an email, a breadcrumb. */
  detail?: string
  avatar?: ReactNode
  href?: string
}

export interface MentionMenuProps {
  editor: Editor | null
  /** Everyone and everything that can be mentioned. */
  items: MentionCandidate[]
  className?: string
  /** Overrides the default label/detail substring search. */
  filter?: (items: MentionCandidate[], query: string) => MentionCandidate[]
}

interface MenuView {
  items: MentionCandidate[]
  index: number
  range: MentionRange
}

function defaultFilter(items: MentionCandidate[], query: string): MentionCandidate[] {
  if (!query) return items
  const q = query.toLowerCase()
  return items.filter(
    (it) => it.label.toLowerCase().includes(q) || (it.detail?.toLowerCase().includes(q) ?? false),
  )
}

/**
 * Replaces the typed `@query` with the mention, followed by a space so the
 * next word does not run into it (unless whitespace already follows).
 */
function insertCandidate(editor: Editor, item: MentionCandidate, range: MentionRange) {
  editor.view.dispatch(editor.view.state.tr.delete(range.from, range.to))
  editor
    .chain()
    .call('insertMention', {
      id: item.id,
      label: item.label,
      kind: item.kind ?? 'user',
      href: item.href ?? null,
    })
    .focus()
    .run()
  const { state } = editor.view
  const after = state.doc.textBetween(
    state.selection.from,
    Math.min(state.selection.from + 1, state.selection.$from.end()),
  )
  if (!/^\s/.test(after)) editor.view.dispatch(state.tr.insertText(' '))
}

export function MentionMenu({ editor, items, className, filter }: MentionMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const [view, setView] = useState<MenuView | null>(null)
  const viewRef = useRef<MenuView | null>(null)
  viewRef.current = view

  useEffect(() => {
    if (!editor) return

    const insert = (item: MentionCandidate, range: MentionRange) =>
      insertCandidate(editor, item, range)

    const sync = () => {
      const s = getMentionState(editor.state)
      if (!s?.active || !s.range) {
        setView(null)
        return
      }
      const matched = (filter ?? defaultFilter)(items, s.query)
      setMentionItemCount(editor.view, matched.length)
      if (!matched.length) {
        setView(null)
        return
      }
      setView({ items: matched, index: Math.min(s.index, matched.length - 1), range: s.range })
    }

    registerMentionEnter(editor.view, () => {
      const v = viewRef.current
      if (!v) return false
      const item = v.items[v.index]
      if (!item) return false
      insert(item, v.range)
      return true
    })

    const offTr = editor.on('transaction', sync)
    sync()
    return () => {
      offTr()
      registerMentionEnter(editor.view, null)
    }
  }, [editor, items, filter])

  useEffect(() => {
    if (!editor || !view || !ref.current) return
    const el = ref.current
    const coords = editor.view.coordsAtPos(view.range.from)
    const virtual = {
      getBoundingClientRect: () => ({
        x: coords.left,
        y: coords.top,
        width: 0,
        height: coords.bottom - coords.top,
        top: coords.top,
        left: coords.left,
        right: coords.left,
        bottom: coords.bottom,
        toJSON() {
          return this
        },
      }),
    }
    void computePosition(virtual, el, {
      placement: 'bottom-start',
      middleware: [offset(6), flip(), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      el.style.left = `${x}px`
      el.style.top = `${y}px`
      el.style.visibility = 'visible'
    })
  }, [editor, view])

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [view?.index])

  if (!editor || !view) return null

  return (
    <div
      ref={ref}
      className={className ?? 'rk-mention-menu'}
      role="listbox"
      aria-label="Mention"
      style={{ position: 'absolute', visibility: 'hidden', zIndex: 60 }}
    >
      {view.items.map((item, i) => (
        <button
          key={item.id}
          type="button"
          role="option"
          aria-selected={i === view.index}
          ref={i === view.index ? activeRef : undefined}
          className={`rk-mention-item${i === view.index ? ' is-active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault()
            insertCandidate(editor, item, view.range)
            closeMention(editor.view)
          }}
        >
          {item.avatar ?? <span className="rk-mention-avatar" aria-hidden />}
          <span className="rk-mention-label">{item.label}</span>
          {item.detail && <span className="rk-mention-detail">{item.detail}</span>}
        </button>
      ))}
    </div>
  )
}
