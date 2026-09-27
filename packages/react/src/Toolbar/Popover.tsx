import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface PopoverProps {
  trigger: ReactNode
  children: (close: () => void) => ReactNode
  className?: string
  align?: 'start' | 'end'
}

export function Popover({ trigger, children, className, align = 'start' }: PopoverProps) {
  const [open, setOpen] = useState(false)
  // opened from the keyboard: move focus into the panel so arrows work, and
  // hand it back to the trigger on Escape
  const [viaKeyboard, setViaKeyboard] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      if (panelRef.current?.contains(document.activeElement)) {
        rootRef.current?.querySelector<HTMLElement>('button')?.focus()
      }
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!open || !viaKeyboard) return
    const panel = panelRef.current
    const target =
      panel?.querySelector<HTMLElement>('[role^="menuitem"][aria-checked="true"]') ??
      panel?.querySelector<HTMLElement>('[role^="menuitem"]:not(:disabled), input, button')
    target?.focus()
  }, [open, viaKeyboard])

  return (
    <div className="tb-pop" ref={rootRef}>
      <div
        onMouseDown={(e) => {
          e.preventDefault()
          setViaKeyboard(false)
          setOpen((v) => !v)
        }}
        // Enter / Space on the trigger button arrives as a pointer-less click
        onClick={(e) => {
          if (e.detail !== 0) return
          setViaKeyboard(true)
          setOpen((v) => !v)
        }}
      >
        {trigger}
      </div>
      {open && (
        <div
          ref={panelRef}
          className={`tb-pop-panel ${align === 'end' ? 'is-end' : ''} ${className ?? ''}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}
