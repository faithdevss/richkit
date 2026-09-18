import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ImageInsertPanel } from '../ImageInsert/ImageInsertPanel'
import { LinkPanel } from '../Toolbar/LinkMenu'
import { _registerDefaultUploadFile, type UploadFile } from '../upload'
import {
  _registerDialogApi,
  _registerToastApi,
  type AlertOptions,
  type ConfirmOptions,
  type DialogAnchor,
  type ImageDialogOptions,
  type LinkDialogOptions,
  type PromptOptions,
  type ToastEntry,
  type ToastKind,
  type ToastOptions,
  selectionAnchor,
} from './notify'

interface PendingDialog {
  id: number
  kind: 'prompt' | 'confirm' | 'alert' | 'image' | 'link'
  prompt?: PromptOptions
  confirm?: ConfirmOptions
  alert?: AlertOptions
  image?: ImageDialogOptions
  link?: LinkDialogOptions
  resolve: (v: unknown) => void
}

/** What dismissing a dialog resolves to: false for confirm, null for inputs. */
function cancelValue(kind: PendingDialog['kind']): unknown {
  if (kind === 'confirm') return false
  if (kind === 'prompt' || kind === 'image') return null
  return undefined
}

function anchorOf(dialog: PendingDialog): DialogAnchor | undefined {
  if (dialog.kind === 'link') return dialog.link!.anchor ?? selectionAnchor(dialog.link!.editor)
  return dialog.prompt?.anchor ?? dialog.image?.anchor
}

/** Anchored dialogs render inside the anchor's theme root so they pick up its colours. */
function themeRootOf(anchor: DialogAnchor): Element | null {
  const el = anchor instanceof Element ? anchor : anchor.contextElement
  return el?.closest('[data-theme]') ?? null
}

const DEFAULT_TOAST_MS = 4000

export interface NotificationsHostProps {
  /**
   * Stores images and files users upload from the toolbar, menubar and slash
   * menu, resolving to their URL. Without it they are inlined as data: URLs.
   */
  uploadFile?: UploadFile
}

export function NotificationsHost({ uploadFile }: NotificationsHostProps = {}) {
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  const [dialog, setDialog] = useState<PendingDialog | null>(null)
  const [draft, setDraft] = useState('')
  const dialogIdRef = useRef(1)
  const toastIdRef = useRef(1)
  const panelRef = useRef<HTMLDivElement>(null)
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
    _registerDefaultUploadFile(uploadFile)
    return () => _registerDefaultUploadFile(undefined)
  }, [uploadFile])

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
      image(opts) {
        return new Promise((resolve) => {
          setDialog({
            id: dialogIdRef.current++,
            kind: 'image',
            image: opts,
            resolve: resolve as (v: unknown) => void,
          })
        })
      },
      link(opts) {
        return new Promise<void>((resolve) => {
          setDialog({
            id: dialogIdRef.current++,
            kind: 'link',
            link: opts,
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
        closeDialog(cancelValue(dialog.kind))
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [dialog, closeDialog])

  const anchor = useMemo(() => (dialog ? anchorOf(dialog) : undefined), [dialog])

  // Anchored: float under the anchor, follow scroll, and close on an outside press.
  useLayoutEffect(() => {
    const el = panelRef.current
    if (!dialog || !anchor || !el) return
    const place = () =>
      void computePosition(anchor, el, {
        strategy: 'fixed',
        placement: 'bottom-start',
        middleware: [offset(6), flip(), shift({ padding: 8 })],
      }).then(({ x, y }) => {
        el.style.left = `${x}px`
        el.style.top = `${y}px`
        el.style.visibility = 'visible'
      })
    const stop = autoUpdate(anchor, el, place)
    const onDown = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) closeDialog(cancelValue(dialog.kind))
    }
    // Deferred so the press that opened the dialog doesn't also close it.
    const arm = setTimeout(() => document.addEventListener('mousedown', onDown))
    return () => {
      stop()
      clearTimeout(arm)
      document.removeEventListener('mousedown', onDown)
    }
  }, [dialog, anchor, closeDialog])

  const card = dialog && (
    <div
      ref={panelRef}
      className={`re-dialog re-dialog-${dialog.kind}${anchor ? ' is-anchored' : ''}`}
      role="dialog"
      aria-modal={anchor ? undefined : true}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {dialog.kind !== 'link' && (
        <header className="re-dialog-header">
          <h3>
            {dialog.kind === 'prompt'
              ? dialog.prompt!.title
              : dialog.kind === 'confirm'
                ? dialog.confirm!.title
                : dialog.kind === 'image'
                  ? (dialog.image!.title ?? 'Insert image')
                  : dialog.alert!.title}
          </h3>
        </header>
      )}
      <div className="re-dialog-body">
        {dialog.kind === 'link' && (
          <LinkPanel
            key={dialog.id}
            editor={dialog.link!.editor}
            onClose={() => closeDialog(undefined)}
          />
        )}
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
        {dialog.kind === 'image' && (
          <ImageInsertPanel
            key={dialog.id}
            uploadFile={dialog.image!.uploadFile}
            defaultTab={dialog.image!.defaultTab}
            onInsert={(image) => closeDialog(image)}
            onCancel={() => closeDialog(null)}
          />
        )}
      </div>
      {dialog.kind !== 'image' && dialog.kind !== 'link' && (
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
      )}
    </div>
  )

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
      {dialog &&
        anchor &&
        (() => {
          const root = themeRootOf(anchor)
          return root ? createPortal(card, root) : card
        })()}
      {dialog && !anchor && (
        <div
          className="re-dialog-backdrop"
          onMouseDown={() => closeDialog(cancelValue(dialog.kind))}
        >
          {card}
        </div>
      )}
    </>
  )
}
