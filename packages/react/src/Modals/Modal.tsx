import { useEffect, type ReactNode } from 'react'

export interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: number | string
}

export function Modal({ open, title, onClose, children, footer, width = 520 }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="re-modal-backdrop" onMouseDown={onClose}>
      <div
        className="re-modal"
        style={{ width }}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="re-modal-header">
          <h3>{title}</h3>
          <button type="button" className="re-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="re-modal-body">{children}</div>
        {footer && <footer className="re-modal-footer">{footer}</footer>}
      </div>
    </div>
  )
}
