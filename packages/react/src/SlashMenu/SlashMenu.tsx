import type { Editor } from '@richkitjs/core'
import {
  closeSlash,
  getSlashState,
  registerSlashEnter,
  setSlashItemCount,
  type SlashRange,
} from '@richkitjs/extension-slash-commands'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { notify } from '../Notifications/notify'

export interface SlashItem {
  id: string
  label: string
  keywords: string
  icon?: ReactNode
  isAvailable?: (editor: Editor) => boolean
  run: (editor: Editor, range: SlashRange) => void
}

function deleteRange(editor: Editor, range: SlashRange): void {
  editor.view.dispatch(editor.view.state.tr.delete(range.from, range.to))
}

function cmdItem(
  id: string,
  label: string,
  keywords: string,
  command: string,
  ...args: unknown[]
): SlashItem {
  return {
    id,
    label,
    keywords,
    run: (editor, range) => {
      deleteRange(editor, range)
      editor
        .chain()
        .call(command, ...args)
        .focus()
        .run()
    },
  }
}

export const defaultSlashItems: SlashItem[] = [
  {
    ...cmdItem('h1', 'Heading 1', 'heading title h1', 'setHeading', 1),
    isAvailable: (e) => Boolean(e.schema.nodes['heading']),
  },
  {
    ...cmdItem('h2', 'Heading 2', 'heading subtitle h2', 'setHeading', 2),
    isAvailable: (e) => Boolean(e.schema.nodes['heading']),
  },
  {
    ...cmdItem('h3', 'Heading 3', 'heading h3', 'setHeading', 3),
    isAvailable: (e) => Boolean(e.schema.nodes['heading']),
  },
  {
    ...cmdItem('bullet', 'Bullet list', 'unordered list ul bullet', 'toggleBulletList'),
    isAvailable: (e) => Boolean(e.schema.nodes['bulletList']),
  },
  {
    ...cmdItem('ordered', 'Numbered list', 'ordered list ol numbered', 'toggleOrderedList'),
    isAvailable: (e) => Boolean(e.schema.nodes['orderedList']),
  },
  {
    ...cmdItem('task', 'Task list', 'todo checkbox task list', 'toggleTaskList'),
    isAvailable: (e) => Boolean(e.schema.nodes['taskList']),
  },
  {
    ...cmdItem('table', 'Table', 'table grid rows columns', 'insertTable', { rows: 3, cols: 3 }),
    isAvailable: (e) => Boolean(e.schema.nodes['table']),
  },
  {
    id: 'image',
    label: 'Image',
    keywords: 'image picture photo img',
    isAvailable: (e) => Boolean(e.schema.nodes['image']),
    run: (editor, range) => {
      deleteRange(editor, range)
      void notify
        .prompt({
          title: 'Insert image',
          message: 'Image URL',
          placeholder: 'https://…',
          okLabel: 'Insert',
          required: true,
        })
        .then((src) => {
          if (src) editor.chain().call('insertImage', { src }).focus().run()
        })
    },
  },
  {
    ...cmdItem('code', 'Code block', 'code fence pre snippet', 'toggleCodeBlock'),
    isAvailable: (e) => Boolean(e.schema.nodes['codeBlock']),
  },
  {
    ...cmdItem('quote', 'Quote', 'blockquote quote citation', 'toggleBlockquote'),
    isAvailable: (e) => Boolean(e.schema.nodes['blockquote']),
  },
  {
    ...cmdItem('hr', 'Divider', 'horizontal rule divider line hr', 'insertHorizontalRule'),
    isAvailable: (e) => Boolean(e.schema.nodes['horizontalRule']),
  },
  {
    ...cmdItem('pagebreak', 'Page break', 'page break pagination', 'insertPageBreak'),
    isAvailable: (e) => Boolean(e.schema.nodes['pageBreak']),
  },
  {
    id: 'embed',
    label: 'Embed',
    keywords: 'embed video youtube vimeo iframe media',
    isAvailable: (e) => Boolean(e.schema.nodes['embed']),
    run: (editor, range) => {
      deleteRange(editor, range)
      void notify
        .prompt({
          title: 'Insert embed',
          message: 'YouTube, Vimeo, video, or page URL',
          placeholder: 'https://youtube.com/watch?v=…',
          okLabel: 'Insert',
          required: true,
        })
        .then((url) => {
          if (url) editor.chain().call('insertEmbed', url).focus().run()
        })
    },
  },
]

export interface SlashMenuProps {
  editor: Editor | null
  items?: SlashItem[]
  className?: string
}

interface MenuView {
  items: SlashItem[]
  index: number
  range: SlashRange
}

export function SlashMenu({ editor, items = defaultSlashItems, className }: SlashMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<MenuView | null>(null)
  const viewRef = useRef<MenuView | null>(null)
  viewRef.current = view

  useEffect(() => {
    if (!editor) return

    const sync = () => {
      const s = getSlashState(editor.state)
      if (!s?.active || !s.range) {
        setView(null)
        return
      }
      const q = s.query.toLowerCase()
      const filtered = items.filter(
        (it) =>
          (it.isAvailable?.(editor) ?? true) &&
          (it.label.toLowerCase().includes(q) || it.keywords.toLowerCase().includes(q)),
      )
      setSlashItemCount(editor.view, filtered.length)
      if (!filtered.length) {
        setView(null)
        return
      }
      setView({ items: filtered, index: Math.min(s.index, filtered.length - 1), range: s.range })
    }

    registerSlashEnter(editor.view, () => {
      const v = viewRef.current
      if (!v) return false
      const item = v.items[v.index]
      if (!item) return false
      item.run(editor, v.range)
      return true
    })

    // 'transaction' also fires for meta-only dispatches (arrow-key moves, escape)
    const offTr = editor.on('transaction', sync)
    sync()
    return () => {
      offTr()
      registerSlashEnter(editor.view, null)
    }
  }, [editor, items])

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

  if (!editor || !view) return null

  return (
    <div
      ref={ref}
      className={className ?? 'slash-menu'}
      role="listbox"
      aria-label="Insert block"
      style={{ position: 'absolute', visibility: 'hidden', zIndex: 60 }}
    >
      {view.items.map((item, i) => (
        <button
          key={item.id}
          type="button"
          role="option"
          aria-selected={i === view.index}
          className={`slash-menu-item${i === view.index ? ' is-active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault()
            item.run(editor, view.range)
            closeSlash(editor.view)
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}
