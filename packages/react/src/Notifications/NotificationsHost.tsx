import { useCallback, useEffect, useRef, useState } from 'react'
import {
  _registerDialogApi,
  _registerToastApi,
  type AlertOptions,
  type ConfirmOptions,
  type PromptOptions,
  type ToastEntry,
  type ToastKind,
  type ToastOptions,
} from './notify'

interface PendingDialog {
  id: number
  kind: 'prompt' | 'confirm' | 'alert'
  prompt?: PromptOptions
  confirm?: ConfirmOptions
  alert?: AlertOptions
  resolve: (v: unknown) => void
}

const DEFAULT_TOAST_MS = 4000

export function NotificationsHost() {
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  const [dialog, setDialog] = useState<PendingDialog | null>(null)
  const [draft, setDraft] = useState('')
  const dialogIdRef = useRef(1)
  const toastIdRef = useRef(1)
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const dismissToast = useCallback((id: number) => {
    setToasts((arr) => arr.filter((t) => t.id !== id))
    const tm = timersRef.current.get(id)
    if (tm) {
      clearTimeout(tm)
      timersRef.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (kind: ToastKind, message: string, opts?: ToastOptions) => {
      const id = toastIdRef.current++
      const durationMs = opts?.durationMs ?? DEFAULT_TOAST_MS
      setToasts((arr) => [...arr, { id, kind, message, createdAt: Date.now(), durationMs }])
      if (durationMs > 0) {
        const tm = setTimeout(() => dismissToast(id), durationMs)
        timersRef.current.set(id, tm)
      }
      return id
    },
    [dismissToast],
  )

  useEffect(() => {
    _registerToastApi({ show: showToast, dismiss: dismissToast })
    _registerDialogApi({
      prompt(opts) {
        return new Promise<string | null>((resolve) => {
          setDraft(opts.defaultValue ?? '')
          setDialog({
            id: dialogIdRef.current++,
            kind: 'prompt',
            prompt: opts,
            resolve: resolve as (v: unknown) => void,
          })
        })
      },
      confirm(opts) {
        return new Promise<boolean>((resolve) => {
          setDialog({
            id: dialogIdRef.current++,
            kind: 'confirm',
            confirm: opts,
            resolve: resolve as (v: unknown) => void,
          })
        })
      },
      alert(opts) {
        return new Promise<void>((resolve) => {
          setDialog({
            id: dialogIdRef.current++,
            kind: 'alert',
            alert: opts,
            resolve: resolve as (v: unknown) => void,
          })
        })
      },
    })
    return () => {
      _registerToastApi(null)
      _registerDialogApi(null)
      const map = timersRef.current
      for (const tm of map.values()) clearTimeout(tm)
      map.clear()
    }
  }, [showToast, dismissToast])

  const closeDialog = useCallback(
    (value: unknown) => {
      if (!dialog) return
      dialog.resolve(value)
      setDialog(null)
      setDraft('')
    },
    [dialog],
  )

  useEffect(() => {
    if (!dialog) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (dialog.kind === 'prompt') closeDialog(null)
        else if (dialog.kind === 'confirm') closeDialog(false)
        else closeDialog(undefined)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [dialog, closeDialog])

  return (
    <>
      <div className="re-toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`re-toast re-toast-${t.kind}`}
            role={t.kind === 'error' || t.kind === 'warn' ? 'alert' : 'status'}
          >
            <span className="re-toast-message">{t.message}</span>
            <button
              type="button"
              className="re-toast-close"
              aria-label="Dismiss"
              onClick={() => dismissToast(t.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {dialog && (
        <div
          className="re-dialog-backdrop"
          onMouseDown={() =>
            closeDialog(
              dialog.kind === 'confirm' ? false : dialog.kind === 'prompt' ? null : undefined,
            )
          }
        >
          <div
            className={`re-dialog re-dialog-${dialog.kind}`}
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className="re-dialog-header">
              <h3>
                {dialog.kind === 'prompt'
                  ? dialog.prompt!.title
                  : dialog.kind === 'confirm'
                    ? dialog.confirm!.title
                    : dialog.alert!.title}
              </h3>
            </header>
            <div className="re-dialog-body">
              {dialog.kind === 'prompt' && (
                <>
                  {dialog.prompt!.message && (
                    <p className="re-dialog-message">{dialog.prompt!.message}</p>
                  )}
                  <input
                    autoFocus
                    type="text"
                    className="re-dialog-input"
                    placeholder={dialog.prompt!.placeholder ?? ''}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (!dialog.prompt!.required || draft.trim()) closeDialog(draft)
                      }
                    }}
                  />
                </>
              )}
              {dialog.kind === 'confirm' && (
                <p className="re-dialog-message">{dialog.confirm!.message ?? ''}</p>
              )}
              {dialog.kind === 'alert' && (
                <p className="re-dialog-message">{dialog.alert!.message ?? ''}</p>
              )}
            </div>
            <footer className="re-dialog-footer">
              {dialog.kind === 'prompt' && (
                <>
                  <button type="button" className="tb-btn-ghost" onClick={() => closeDialog(null)}>
                    {dialog.prompt!.cancelLabel ?? 'Cancel'}
                  </button>
                  <button
                    type="button"
                    className="tb-btn-primary"
                    onClick={() => closeDialog(draft)}
                    disabled={dialog.prompt!.required ? !draft.trim() : false}
                  >
                    {dialog.prompt!.okLabel ?? 'OK'}
                  </button>
                </>
              )}
              {dialog.kind === 'confirm' && (
                <>
                  <button type="button" className="tb-btn-ghost" onClick={() => closeDialog(false)}>
                    {dialog.confirm!.cancelLabel ?? 'Cancel'}
                  </button>
                  <button
                    type="button"
                    className={dialog.confirm!.destructive ? 'tb-btn-danger' : 'tb-btn-primary'}
                    onClick={() => closeDialog(true)}
                    autoFocus
                  >
                    {dialog.confirm!.okLabel ?? 'OK'}
                  </button>
                </>
              )}
              {dialog.kind === 'alert' && (
                <button
                  type="button"
                  className="tb-btn-primary"
                  onClick={() => closeDialog(undefined)}
                  autoFocus
                >
                  {dialog.alert!.okLabel ?? 'OK'}
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </>
  )
}
