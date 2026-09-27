import type { KeyboardEvent, ReactNode } from 'react'

const ITEM_SELECTOR = '[role^="menuitem"]:not(:disabled)'

export interface MenuListProps {
  children: ReactNode
  /** Extra class names, added after `rk-menu`. */
  className?: string
  /**
   * Drop the menu's own frame (border, shadow, background) — for a list that
   * sits inside a panel that already draws one, such as a toolbar Popover.
   */
  inline?: boolean
  'aria-label'?: string
}

/**
 * The list every RichKit dropdown and context menu is built from: one frame,
 * one row style, and arrow-key navigation between rows. Rows are
 * `MenuItem`s, optionally split by `MenuLabel` and `MenuSeparator`.
 */
export function MenuList({ children, className, inline = false, ...aria }: MenuListProps) {
  // Roving focus: arrows walk the enabled rows and wrap, Home/End jump.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
    if (!keys.includes(e.key)) return
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(ITEM_SELECTOR))
    if (!items.length) return
    e.preventDefault()
    const at = items.indexOf(document.activeElement as HTMLElement)
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? items.length - 1
          : e.key === 'ArrowDown'
            ? (at + 1) % items.length
            : (at - 1 + items.length) % items.length
    items[next]?.focus()
  }

  return (
    <div
      role="menu"
      className={`rk-menu${inline ? ' is-inline' : ''}${className ? ` ${className}` : ''}`}
      onKeyDown={onKeyDown}
      {...aria}
    >
      {children}
    </div>
  )
}

export interface MenuItemProps {
  children: ReactNode
  /** Runs on click or Enter/Space. The editor keeps its selection meanwhile. */
  onSelect: () => void
  /** Leading icon or glyph. */
  icon?: ReactNode
  /** Trailing hint, usually a keyboard shortcut. */
  hint?: ReactNode
  /**
   * Marks the row as the current value. Passing it at all turns the row into a
   * radio item, so assistive tech announces checked / not checked.
   */
  active?: boolean
  danger?: boolean
  disabled?: boolean
  title?: string
  className?: string
}

export function MenuItem({
  children,
  onSelect,
  icon,
  hint,
  active,
  danger = false,
  disabled = false,
  title,
  className,
}: MenuItemProps) {
  const radio = active !== undefined
  return (
    <button
      type="button"
      role={radio ? 'menuitemradio' : 'menuitem'}
      aria-checked={radio ? active : undefined}
      disabled={disabled}
      title={title}
      className={`rk-menu-item${active ? ' is-active' : ''}${danger ? ' is-danger' : ''}${
        className ? ` ${className}` : ''
      }`}
      // mousedown, not click: a click would blur the editor and lose the
      // selection the command is meant to act on
      onMouseDown={(e) => {
        e.preventDefault()
        if (!disabled) onSelect()
      }}
      // keyboard activation arrives as a click with no pointer (detail 0)
      onClick={(e) => {
        if (e.detail === 0 && !disabled) onSelect()
      }}
    >
      {icon !== undefined && (
        <span className="rk-menu-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="rk-menu-text">{children}</span>
      {hint !== undefined && <kbd className="rk-menu-hint">{hint}</kbd>}
    </button>
  )
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <div className="rk-menu-label" role="presentation">
      {children}
    </div>
  )
}

export function MenuSeparator() {
  return <div className="rk-menu-sep" role="separator" />
}
