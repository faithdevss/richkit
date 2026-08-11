import type { Editor } from '@richkitjs/core'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export type MenuShortcut = string

export interface MenuItemDef {
  label: string
  icon?: ReactNode
  shortcut?: MenuShortcut
  disabled?: boolean
  checked?: boolean
  onSelect?: (editor: Editor) => void
  submenu?: MenuItemDef[]
  separator?: false
}

export interface MenuSeparator {
  separator: true
}

export type MenuEntry = MenuItemDef | MenuSeparator

export interface MenuDef {
  label: string
  items: MenuEntry[]
}

export interface MenubarProps {
  editor: Editor
  menus: MenuDef[]
  className?: string
}

export function Menubar({ editor, menus, className }: MenubarProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (openIdx == null) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpenIdx(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIdx(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openIdx])

  return (
    <div className={className ?? 'menubar'} role="menubar" ref={rootRef}>
      {menus.map((menu, i) => (
        <div key={menu.label} className="menubar-item">
          <button
            type="button"
            className={`menubar-trigger ${openIdx === i ? 'is-open' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault()
              setOpenIdx(openIdx === i ? null : i)
            }}
            onMouseEnter={() => {
              if (openIdx !== null && openIdx !== i) setOpenIdx(i)
            }}
            aria-haspopup="menu"
            aria-expanded={openIdx === i}
          >
            {menu.label}
          </button>
          {openIdx === i && (
            <MenuPanel editor={editor} items={menu.items} onClose={() => setOpenIdx(null)} />
          )}
        </div>
      ))}
    </div>
  )
}

interface MenuPanelProps {
  editor: Editor
  items: MenuEntry[]
  onClose: () => void
  level?: number
}

function MenuPanel({ editor, items, onClose, level = 0 }: MenuPanelProps) {
  return (
    <div className="menu-panel" role="menu" data-level={level}>
      {items.map((entry, i) => {
        if ('separator' in entry && entry.separator) {
          return <div key={`sep-${i}`} className="menu-sep" />
        }
        const item = entry as MenuItemDef
        return <MenuItem key={item.label} editor={editor} item={item} onClose={onClose} />
      })}
    </div>
  )
}

interface MenuItemProps {
  editor: Editor
  item: MenuItemDef
  onClose: () => void
}

function MenuItem({ editor, item, onClose }: MenuItemProps) {
  const [subOpen, setSubOpen] = useState(false)
  const hasSub = !!item.submenu?.length

  return (
    <div
      className="menu-item-wrap"
      onMouseEnter={() => hasSub && setSubOpen(true)}
      onMouseLeave={() => hasSub && setSubOpen(false)}
    >
      <button
        type="button"
        role="menuitem"
        className={`menu-item ${item.disabled ? 'is-disabled' : ''} ${
          item.checked ? 'is-checked' : ''
        }`}
        disabled={item.disabled}
        title={item.disabled ? 'Coming soon' : undefined}
        onMouseDown={(e) => {
          e.preventDefault()
          if (item.disabled) return
          if (hasSub) return
          item.onSelect?.(editor)
          onClose()
        }}
      >
        <span className="menu-icon">{item.icon}</span>
        <span className="menu-label">{item.label}</span>
        <span className="menu-meta">
          {item.checked ? <span className="menu-check">✓</span> : null}
          {item.shortcut ? <kbd className="menu-shortcut">{item.shortcut}</kbd> : null}
          {hasSub ? <span className="menu-arrow">›</span> : null}
        </span>
      </button>
      {hasSub && subOpen && (
        <div className="menu-submenu">
          <MenuPanel editor={editor} items={item.submenu!} onClose={onClose} level={1} />
        </div>
      )}
    </div>
  )
}
