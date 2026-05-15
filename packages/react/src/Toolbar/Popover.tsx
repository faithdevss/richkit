import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface PopoverProps {
  trigger: ReactNode
  children: (close: () => void) => ReactNode
  className?: string
  align?: 'start' | 'end'
}

export function Popover({ trigger, children, className, align = 'start' }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="tb-pop" ref={rootRef}>
      <div
        onMouseDown={(e) => {
          e.preventDefault()
          setOpen((v) => !v)
        }}
      >
        {trigger}
      </div>
      {open && (
        <div className={`tb-pop-panel ${align === 'end' ? 'is-end' : ''} ${className ?? ''}`}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}
