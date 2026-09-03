import type { Editor } from '@richkitjs/core'
import {
  blockAnchorId,
  blockAt,
  captureBlockDragScroll,
  blockAtCoords,
  blockHTML,
  blockText,
  deleteBlock,
  duplicateBlock,
  focusBlock,
  insertBlockAfter,
  startBlockDrag,
  type BlockTarget,
} from '@richkitjs/extension-drag-handle'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  BlockquoteIcon,
  BulletListIcon,
  ChevronRightIcon,
  CodeBlockIcon,
  CopyIcon,
  DuplicateIcon,
  GripIcon,
  LinkIcon,
  OrderedListIcon,
  PlusIcon,
  TaskListIcon,
  TextIcon,
  TrashIcon,
  TurnIntoIcon,
} from '../icons'

export interface TurnIntoItem {
  id: string
  label: string
  icon?: ReactNode
  /** Node the target schema must define for the item to be offered. */
  requires?: string
  command: string
  args?: unknown[]
}

function glyph(text: string): ReactNode {
  return (
    <span className="rk-block-glyph" aria-hidden>
      {text}
    </span>
  )
}

export const defaultTurnIntoItems: TurnIntoItem[] = [
  { id: 'text', label: 'Text', icon: <TextIcon />, requires: 'paragraph', command: 'setParagraph' },
  {
    id: 'h1',
    label: 'Heading 1',
    icon: glyph('H1'),
    requires: 'heading',
    command: 'setHeading',
    args: [{ level: 1 }],
  },
  {
    id: 'h2',
    label: 'Heading 2',
    icon: glyph('H2'),
    requires: 'heading',
    command: 'setHeading',
    args: [{ level: 2 }],
  },
  {
    id: 'h3',
    label: 'Heading 3',
    icon: glyph('H3'),
    requires: 'heading',
    command: 'setHeading',
    args: [{ level: 3 }],
  },
  {
    id: 'bullet',
    label: 'Bullet List',
    icon: <BulletListIcon />,
    requires: 'bulletList',
    command: 'toggleBulletList',
  },
  {
    id: 'ordered',
    label: 'Numbered List',
    icon: <OrderedListIcon />,
    requires: 'orderedList',
    command: 'toggleOrderedList',
  },
  {
    id: 'task',
    label: 'To-do List',
    icon: <TaskListIcon />,
    requires: 'taskList',
    command: 'toggleTaskList',
  },
  {
    id: 'quote',
    label: 'Quote',
    icon: <BlockquoteIcon />,
    requires: 'blockquote',
    command: 'toggleBlockquote',
  },
  {
    id: 'code',
    label: 'Code Block',
    icon: <CodeBlockIcon />,
    requires: 'codeBlock',
    command: 'toggleCodeBlock',
  },
  {
    id: 'callout',
    label: 'Callout',
    icon: glyph('!'),
    requires: 'callout',
    command: 'toggleCallout',
    args: [{ kind: 'tip' }],
  },
]

export interface BlockHandleProps {
  editor: Editor | null
  /**
   * Element hover is tracked in — usually the scroll container holding the
   * editor, so the gutter beside a block counts as hovering it. Defaults to
   * the editor's own DOM node.
   */
  container?: HTMLElement | null
  turnIntoItems?: TurnIntoItem[]
  className?: string
}

/** Width of the controls, used until the real element can be measured. */
const DEFAULT_GUTTER = 56

interface Hovered {
  pos: number
  /** viewport rect of the block, kept for positioning the controls */
  rect: DOMRect
  /** height of the block's first line, so the handle sits beside it */
  lineHeight: number
  label: string
}

const NODE_LABELS: Record<string, string> = {
  paragraph: 'Text',
  heading: 'Heading',
  blockquote: 'Quote',
  codeBlock: 'Code Block',
  bulletList: 'Bullet List',
  orderedList: 'Numbered List',
  taskList: 'To-do List',
  horizontalRule: 'Divider',
  pageBreak: 'Page Break',
  table: 'Table',
  image: 'Image',
  embed: 'Embed',
}

function labelFor(target: BlockTarget): string {
  const name = target.node.type.name
  const known = NODE_LABELS[name]
  if (known && name === 'heading') return `Heading ${String(target.node.attrs['level'] ?? 1)}`
  if (known) return known
  return name.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
}

function firstLineHeight(dom: HTMLElement): number {
  const styles = window.getComputedStyle(dom)
  const parsed = Number.parseFloat(styles.lineHeight)
  if (Number.isFinite(parsed)) return parsed
  const fontSize = Number.parseFloat(styles.fontSize)
  return Number.isFinite(fontSize) ? fontSize * 1.5 : 24
}

function hoveredFrom(target: BlockTarget): Hovered {
  return {
    pos: target.pos,
    rect: target.dom.getBoundingClientRect(),
    lineHeight: firstLineHeight(target.dom),
    label: labelFor(target),
  }
}

async function copyBlock(html: string, text: string): Promise<void> {
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ])
      return
    }
    await navigator.clipboard?.writeText(text)
  } catch {
    // clipboard permission denied — nothing useful to fall back to
  }
}

/**
 * Notion-style block gutter: hovering a top-level block reveals an insert
 * button and a drag handle, and the handle opens a menu of block actions.
 */
export function BlockHandle({
  editor,
  container,
  turnIntoItems = defaultTurnIntoItems,
  className,
}: BlockHandleProps) {
  const [hovered, setHovered] = useState<Hovered | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [submenuOpen, setSubmenuOpen] = useState(false)
  const handleRef = useRef<HTMLDivElement>(null)
  const gripRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)
  const turnIntoRef = useRef<HTMLButtonElement>(null)
  const menuOpenRef = useRef(menuOpen)
  menuOpenRef.current = menuOpen
  // A drag dies the moment its source element leaves the DOM, so hover
  // tracking has to stop moving (and unmounting) the controls until it ends.
  const draggingRef = useRef(false)
  // Taken on mousedown, applied on dragstart — see captureBlockDragScroll.
  const pinScrollRef = useRef<(() => void) | null>(null)

  const refresh = useCallback(() => {
    if (!editor || !hovered || draggingRef.current) return
    const target = blockAt(editor.view, hovered.pos)
    if (!target) {
      setHovered(null)
      setMenuOpen(false)
      return
    }
    setHovered(hoveredFrom(target))
  }, [editor, hovered])

  // Hover tracking. The pointer is resolved through the view rather than DOM
  // events on blocks, so the empty gutter still maps to the block beside it.
  useEffect(() => {
    if (!editor) return
    const root = container ?? editor.view.dom
    const onMove = (event: MouseEvent) => {
      if (menuOpenRef.current || draggingRef.current) return
      const target = blockAtCoords(editor.view, { left: event.clientX, top: event.clientY })
      if (!target) {
        setHovered(null)
        return
      }
      setHovered(hoveredFrom(target))
    }
    // The controls are portalled out of the container, so moving the pointer
    // onto them counts as leaving it — keep the block while that is where it went.
    const onLeave = (event: MouseEvent) => {
      if (menuOpenRef.current || draggingRef.current) return
      const to = event.relatedTarget
      if (
        to instanceof Node &&
        (handleRef.current?.contains(to) ||
          menuRef.current?.contains(to) ||
          submenuRef.current?.contains(to))
      ) {
        return
      }
      setHovered(null)
    }
    root.addEventListener('mousemove', onMove)
    root.addEventListener('mouseleave', onLeave)
    return () => {
      root.removeEventListener('mousemove', onMove)
      root.removeEventListener('mouseleave', onLeave)
    }
  }, [editor, container])

  // The block moves under the controls on scroll, resize and edits.
  useEffect(() => {
    if (!hovered) return
    const onScroll = () => {
      if (menuOpenRef.current) {
        setMenuOpen(false)
        setSubmenuOpen(false)
      }
      refresh()
    }
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [hovered, refresh])

  useEffect(() => {
    if (!editor || !hovered) return
    return editor.on('update', refresh)
  }, [editor, hovered, refresh])

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (event: MouseEvent) => {
      const node = event.target as Node
      if (menuRef.current?.contains(node)) return
      if (submenuRef.current?.contains(node)) return
      if (gripRef.current?.contains(node)) return
      setMenuOpen(false)
      setSubmenuOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      setSubmenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen || !gripRef.current || !menuRef.current) return
    void computePosition(gripRef.current, menuRef.current, {
      // the panels are position: fixed, so the coordinates must be too
      strategy: 'fixed',
      placement: 'bottom-start',
      middleware: [offset(6), flip(), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      const el = menuRef.current
      if (!el) return
      el.style.left = `${String(x)}px`
      el.style.top = `${String(y)}px`
      el.style.visibility = 'visible'
    })
  }, [menuOpen])

  useEffect(() => {
    if (!submenuOpen || !turnIntoRef.current || !submenuRef.current) return
    void computePosition(turnIntoRef.current, submenuRef.current, {
      strategy: 'fixed',
      placement: 'right-start',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    }).then(({ x, y }) => {
      const el = submenuRef.current
      if (!el) return
      el.style.left = `${String(x)}px`
      el.style.top = `${String(y)}px`
      el.style.visibility = 'visible'
    })
  }, [submenuOpen])

  if (!editor || !hovered || !editor.isEditable) return null

  const view = editor.view
  const contentRect = view.dom.getBoundingClientRect()
  const bounds = (container ?? view.dom).getBoundingClientRect()
  // The block can scroll out from under the controls; nothing to point at then.
  if (hovered.rect.bottom < bounds.top || hovered.rect.top > bounds.bottom) return null
  const rowHeight = Math.min(hovered.lineHeight, hovered.rect.height)
  const top = hovered.rect.top + Math.max(0, (rowHeight - 24) / 2)
  // The controls are drawn to the left of this anchor. They hang beside the
  // block, but never march right with an indented one — and when the editor
  // leaves itself a gutter, they sit inside it rather than out in the margin.
  const gutter = handleRef.current?.offsetWidth ?? DEFAULT_GUTTER
  const left = Math.min(hovered.rect.left, contentRect.left + gutter)

  const close = () => {
    setMenuOpen(false)
    setSubmenuOpen(false)
  }

  const onInsert = () => {
    insertBlockAfter(view, hovered.pos, '/')
    setHovered(null)
  }

  return createPortal(
    <>
      <div
        ref={handleRef}
        className={`rk-block-handle${className ? ` ${className}` : ''}`}
        style={{ position: 'fixed', top: `${String(top)}px`, left: `${String(left)}px` }}
        onMouseDown={(e) => {
          // keep the editor selection while interacting with the gutter
          if (e.target === e.currentTarget) e.preventDefault()
        }}
      >
        <button
          type="button"
          className="rk-block-btn"
          title="Insert block below"
          aria-label="Insert block below"
          onMouseDown={(e) => {
            e.preventDefault()
            onInsert()
          }}
        >
          <PlusIcon />
        </button>
        <button
          type="button"
          ref={gripRef}
          className={`rk-block-btn rk-block-grip${menuOpen ? ' is-active' : ''}`}
          title="Drag to move, click for actions"
          aria-label="Block actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          draggable
          // The browser scrolls the drag source into view before dragstart
          // fires, so the positions to put back are taken on the way down.
          // Both events are wired because pointerdown alone has been seen to
          // miss the very first press on a freshly rendered handle.
          onPointerDown={() => {
            pinScrollRef.current = captureBlockDragScroll(view)
          }}
          onMouseDown={() => {
            pinScrollRef.current ??= captureBlockDragScroll(view)
          }}
          onDragStart={(e) => {
            const target = blockAt(view, hovered.pos)
            if (!target) return
            draggingRef.current = true
            startBlockDrag(view, target, e.nativeEvent)
            pinScrollRef.current?.()
            setMenuOpen(false)
            setSubmenuOpen(false)
          }}
          onDragEnd={() => {
            draggingRef.current = false
            pinScrollRef.current = null
            setHovered(null)
          }}
          // No preventDefault here: cancelling mousedown also cancels the
          // browser's drag, which is the grip's main job. The menu opens on
          // click instead, and a completed drag suppresses that click.
          onClick={() => {
            setSubmenuOpen(false)
            setMenuOpen((open) => !open)
          }}
        >
          <GripIcon />
        </button>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          className="rk-block-menu"
          role="menu"
          aria-label={`${hovered.label} actions`}
          style={{ position: 'fixed', visibility: 'hidden', zIndex: 70 }}
        >
          <div className="rk-block-menu-title">{hovered.label}</div>
          <div className="rk-block-menu-group">
            <button
              type="button"
              ref={turnIntoRef}
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={submenuOpen}
              className={`rk-block-menu-item${submenuOpen ? ' is-active' : ''}`}
              onMouseEnter={() => setSubmenuOpen(true)}
              onMouseDown={(e) => {
                // hovering already opened it; toggling here would tear the
                // submenu down mid-click on the way to one of its items
                e.preventDefault()
                setSubmenuOpen(true)
              }}
            >
              <TurnIntoIcon />
              <span>Turn Into</span>
              <ChevronRightIcon className="rk-block-menu-more" />
            </button>
          </div>
          <div className="rk-block-menu-group">
            <button
              type="button"
              role="menuitem"
              className="rk-block-menu-item"
              onMouseEnter={() => setSubmenuOpen(false)}
              onMouseDown={(e) => {
                e.preventDefault()
                duplicateBlock(view, hovered.pos)
                close()
              }}
            >
              <DuplicateIcon />
              <span>Duplicate node</span>
              <kbd>⌘D</kbd>
            </button>
            <button
              type="button"
              role="menuitem"
              className="rk-block-menu-item"
              onMouseEnter={() => setSubmenuOpen(false)}
              onMouseDown={(e) => {
                e.preventDefault()
                void copyBlock(blockHTML(view, hovered.pos), blockText(view, hovered.pos))
                close()
              }}
            >
              <CopyIcon />
              <span>Copy to clipboard</span>
              <kbd>⌘C</kbd>
            </button>
            <button
              type="button"
              role="menuitem"
              className="rk-block-menu-item"
              onMouseEnter={() => setSubmenuOpen(false)}
              onMouseDown={(e) => {
                e.preventDefault()
                const id = blockAnchorId(view, hovered.pos)
                const url = `${window.location.origin}${window.location.pathname}#${id}`
                void navigator.clipboard?.writeText(url).catch(() => {})
                close()
              }}
            >
              <LinkIcon />
              <span>Copy anchor link</span>
              <kbd>⌘⌃L</kbd>
            </button>
          </div>
          <div className="rk-block-menu-group">
            <button
              type="button"
              role="menuitem"
              className="rk-block-menu-item is-danger"
              onMouseEnter={() => setSubmenuOpen(false)}
              onMouseDown={(e) => {
                e.preventDefault()
                deleteBlock(view, hovered.pos)
                setHovered(null)
                close()
              }}
            >
              <TrashIcon />
              <span>Delete</span>
              <kbd>Del</kbd>
            </button>
          </div>
        </div>
      )}

      {menuOpen && submenuOpen && (
        <div
          ref={submenuRef}
          className="rk-block-menu rk-block-submenu"
          role="menu"
          aria-label="Turn into"
          style={{ position: 'fixed', visibility: 'hidden', zIndex: 71 }}
        >
          {turnIntoItems
            .filter((item) => !item.requires || Boolean(editor.schema.nodes[item.requires]))
            .map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className="rk-block-menu-item"
                onMouseDown={(e) => {
                  e.preventDefault()
                  focusBlock(view, hovered.pos)
                  editor
                    .chain()
                    .call(item.command, ...(item.args ?? []))
                    .focus()
                    .run()
                  close()
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
        </div>
      )}
    </>,
    container ?? document.body,
  )
}
