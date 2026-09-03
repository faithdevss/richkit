import type { Editor } from '@richkitjs/core'
import {
  closeSlash,
  getSlashState,
  registerSlashEnter,
  setSlashItemCount,
  type SlashRange,
} from '@richkitjs/extension-slash-commands'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { notify } from '../Notifications/notify'
import {
  BlockquoteIcon,
  BulletListIcon,
  CodeBlockIcon,
  EmojiIcon,
  HorizontalRuleIcon,
  ImageIcon,
  LinkIcon,
  MediaIcon,
  OrderedListIcon,
  PageSetupIcon,
  TableIcon,
  TaskListIcon,
  TextIcon,
} from '../icons'

export interface SlashItem {
  id: string
  label: string
  keywords: string
  /** Section heading the item is listed under. Ungrouped items come first. */
  group?: string
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

function glyph(text: string): ReactNode {
  return (
    <span className="slash-menu-glyph" aria-hidden>
      {text}
    </span>
  )
}

/** Video, audio, and file differ only in the node attrs and the prompt copy. */
function mediaItem(
  kind: 'video' | 'audio' | 'file',
  label: string,
  keywords: string,
  message: string,
): SlashItem[] {
  return [
    {
      id: kind,
      label,
      keywords,
      group: 'Insert',
      icon: <MediaIcon />,
      isAvailable: (e) => Boolean(e.schema.nodes['media']),
      run: (editor, range) => {
        deleteRange(editor, range)
        void notify
          .prompt({
            title: `Insert ${label.toLowerCase()}`,
            message,
            placeholder: 'https://…',
            okLabel: 'Insert',
            required: true,
          })
          .then((src) => {
            if (src) editor.chain().call('insertMedia', { kind, src }).focus().run()
          })
      },
    },
  ]
}

export const defaultSlashItems: SlashItem[] = [
  {
    ...cmdItem('text', 'Text', 'paragraph text plain body', 'setParagraph'),
    group: 'Style',
    icon: <TextIcon />,
    isAvailable: (e) => Boolean(e.schema.nodes['paragraph']),
  },
  {
    ...cmdItem('h1', 'Heading 1', 'heading title h1', 'setHeading', { level: 1 }),
    group: 'Style',
    icon: glyph('H1'),
    isAvailable: (e) => Boolean(e.schema.nodes['heading']),
  },
  {
    ...cmdItem('h2', 'Heading 2', 'heading subtitle h2', 'setHeading', { level: 2 }),
    group: 'Style',
    icon: glyph('H2'),
    isAvailable: (e) => Boolean(e.schema.nodes['heading']),
  },
  {
    ...cmdItem('h3', 'Heading 3', 'heading h3', 'setHeading', { level: 3 }),
    group: 'Style',
    icon: glyph('H3'),
    isAvailable: (e) => Boolean(e.schema.nodes['heading']),
  },
  {
    ...cmdItem('bullet', 'Bullet List', 'unordered list ul bullet', 'toggleBulletList'),
    group: 'Style',
    icon: <BulletListIcon />,
    isAvailable: (e) => Boolean(e.schema.nodes['bulletList']),
  },
  {
    ...cmdItem('ordered', 'Numbered List', 'ordered list ol numbered', 'toggleOrderedList'),
    group: 'Style',
    icon: <OrderedListIcon />,
    isAvailable: (e) => Boolean(e.schema.nodes['orderedList']),
  },
  {
    ...cmdItem('task', 'To-do List', 'todo checkbox task list', 'toggleTaskList'),
    group: 'Style',
    icon: <TaskListIcon />,
    isAvailable: (e) => Boolean(e.schema.nodes['taskList']),
  },
  {
    ...cmdItem('quote', 'Quote', 'blockquote quote citation', 'toggleBlockquote'),
    group: 'Style',
    icon: <BlockquoteIcon />,
    isAvailable: (e) => Boolean(e.schema.nodes['blockquote']),
  },
  {
    ...cmdItem('code', 'Code Block', 'code fence pre snippet', 'toggleCodeBlock'),
    group: 'Style',
    icon: <CodeBlockIcon />,
    isAvailable: (e) => Boolean(e.schema.nodes['codeBlock']),
  },
  {
    ...cmdItem('table', 'Table', 'table grid rows columns', 'insertTable', { rows: 3, cols: 3 }),
    group: 'Insert',
    icon: <TableIcon />,
    isAvailable: (e) => Boolean(e.schema.nodes['table']),
  },
  {
    id: 'image',
    label: 'Image',
    keywords: 'image picture photo img',
    group: 'Insert',
    icon: <ImageIcon />,
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
    id: 'embed',
    label: 'Embed',
    keywords: 'embed video youtube vimeo iframe media',
    group: 'Insert',
    icon: <EmojiIcon />,
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
  {
    ...cmdItem('callout', 'Callout', 'callout note tip info warning aside', 'toggleCallout', {
      kind: 'tip',
    }),
    group: 'Style',
    icon: glyph('!'),
    isAvailable: (e) => Boolean(e.schema.nodes['callout']),
  },
  {
    ...cmdItem('toggle', 'Toggle', 'toggle collapsible details accordion fold', 'insertToggle'),
    group: 'Style',
    icon: glyph('▸'),
    isAvailable: (e) => Boolean(e.schema.nodes['toggle']),
  },
  ...mediaItem('video', 'Video', 'video mp4 movie clip', 'Video URL'),
  ...mediaItem('audio', 'Audio', 'audio mp3 sound music podcast', 'Audio URL'),
  ...mediaItem('file', 'File', 'file attachment download document pdf', 'File URL'),
  {
    id: 'bookmark',
    label: 'Bookmark',
    keywords: 'bookmark link preview card website',
    group: 'Insert',
    icon: <LinkIcon />,
    isAvailable: (e) => Boolean(e.schema.nodes['bookmark']),
    run: (editor, range) => {
      deleteRange(editor, range)
      void notify
        .prompt({
          title: 'Insert bookmark',
          message: 'Page URL',
          placeholder: 'https://…',
          okLabel: 'Insert',
          required: true,
        })
        .then((href) => {
          if (href) editor.chain().call('insertBookmark', href).focus().run()
        })
    },
  },
  {
    ...cmdItem('hr', 'Divider', 'horizontal rule divider line hr', 'insertHorizontalRule'),
    group: 'Insert',
    icon: <HorizontalRuleIcon />,
    isAvailable: (e) => Boolean(e.schema.nodes['horizontalRule']),
  },
  {
    ...cmdItem('pagebreak', 'Page Break', 'page break pagination', 'insertPageBreak'),
    group: 'Insert',
    icon: <PageSetupIcon />,
    isAvailable: (e) => Boolean(e.schema.nodes['pageBreak']),
  },
]

export interface SlashMenuProps {
  editor: Editor | null
  items?: SlashItem[]
  className?: string
  /**
   * Where the "Recent" section remembers its ids. Defaults to localStorage
   * under `richkit:slash-recent`; pass `null` to turn the section off.
   */
  recentStorageKey?: string | null
  /** How many commands the "Recent" section keeps. */
  recentLimit?: number
}

const RECENT_KEY = 'richkit:slash-recent'
const RECENT_LIMIT = 5

function readRecent(key: string | null): string[] {
  if (!key) return []
  try {
    const raw = window.localStorage.getItem(key)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

function pushRecent(key: string | null, id: string, limit: number): string[] {
  if (!key) return []
  const next = [id, ...readRecent(key).filter((v) => v !== id)].slice(0, limit)
  try {
    window.localStorage.setItem(key, JSON.stringify(next))
  } catch {
    // a private window with storage disabled just means no Recent section
  }
  return next
}

/**
 * Ranks an item against the query. Substring hits always beat subsequence
 * hits, so "/task" keeps matching only To-do List while a typo like "/bllt"
 * still finds Bullet List. `null` means no match.
 */
function score(query: string, item: SlashItem): number | null {
  if (!query) return 0
  const label = item.label.toLowerCase()
  const hay = `${label} ${item.keywords.toLowerCase()}`
  if (label.startsWith(query)) return 1000
  const i = hay.indexOf(query)
  if (i >= 0) return 500 - i
  // subsequence: every query character in order, scoring tight runs higher
  let at = -1
  let gaps = 0
  for (const ch of query) {
    const next = hay.indexOf(ch, at + 1)
    if (next < 0) return null
    gaps += next - at - 1
    at = next
  }
  return 100 - Math.min(gaps, 99)
}

function rank(items: SlashItem[], query: string, editor: Editor): SlashItem[] {
  const available = items.filter((it) => it.isAvailable?.(editor) ?? true)
  if (!query) return available
  const scored: { item: SlashItem; score: number; order: number }[] = []
  available.forEach((item, order) => {
    const s = score(query, item)
    if (s !== null) scored.push({ item, score: s, order })
  })
  // a substring hit anywhere suppresses the looser subsequence matches
  const best = Math.max(...scored.map((e) => e.score), 0)
  const cut = best >= 500 ? 500 : 0
  return scored
    .filter((e) => e.score >= cut)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((e) => e.item)
}

interface MenuView {
  items: SlashItem[]
  index: number
  range: SlashRange
}

export function SlashMenu({
  editor,
  items = defaultSlashItems,
  className,
  recentStorageKey = RECENT_KEY,
  recentLimit = RECENT_LIMIT,
}: SlashMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const [view, setView] = useState<MenuView | null>(null)
  const viewRef = useRef<MenuView | null>(null)
  viewRef.current = view
  const [recent, setRecent] = useState<string[]>(() => readRecent(recentStorageKey))
  const recentRef = useRef(recent)
  recentRef.current = recent

  const remember = useCallback(
    (item: SlashItem) => {
      setRecent(pushRecent(recentStorageKey, item.id, recentLimit))
    },
    [recentStorageKey, recentLimit],
  )

  useEffect(() => {
    if (!editor) return

    const sync = () => {
      const s = getSlashState(editor.state)
      if (!s?.active || !s.range) {
        setView(null)
        return
      }
      const q = s.query.toLowerCase()
      const matched = rank(items, q, editor)
      // With no query, the commands reached most recently lead the list under
      // their own heading; a query ranks across everything instead.
      const byId = new Map(matched.map((it) => [it.id, it]))
      const hoisted = q
        ? []
        : recentRef.current.map((id) => byId.get(id)).filter((it): it is SlashItem => Boolean(it))
      const rest = matched.filter((it) => !hoisted.includes(it))
      const filtered = [...hoisted.map((it) => ({ ...it, group: 'Recent' })), ...rest]
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
      remember(item)
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
  }, [editor, items, remember])

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

  // Arrow keys can walk the highlight past the edge of a scrolling menu.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [view?.index])

  if (!editor || !view) return null

  // Items keep their document order; each new group label opens a section.
  let lastGroup: string | undefined

  return (
    <div
      ref={ref}
      className={className ?? 'slash-menu'}
      role="listbox"
      aria-label="Insert block"
      style={{ position: 'absolute', visibility: 'hidden', zIndex: 60 }}
    >
      {view.items.map((item, i) => {
        const heading = item.group && item.group !== lastGroup ? item.group : null
        lastGroup = item.group
        return (
          <div key={item.id} className="slash-menu-row" role="presentation">
            {heading && <div className="slash-menu-group">{heading}</div>}
            <button
              type="button"
              role="option"
              aria-selected={i === view.index}
              className={`slash-menu-item${i === view.index ? ' is-active' : ''}`}
              ref={i === view.index ? activeRef : undefined}
              onMouseDown={(e) => {
                e.preventDefault()
                remember(item)
                item.run(editor, view.range)
                closeSlash(editor.view)
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
