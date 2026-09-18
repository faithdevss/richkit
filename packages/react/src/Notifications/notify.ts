import type { Editor } from '@richkitjs/core'
import type { ImageInsertTab, ImageInsertValue } from '../ImageInsert/ImageInsertPanel'
import type { UploadFile } from '../upload'

export type ToastKind = 'info' | 'success' | 'warn' | 'error'

export interface ToastOptions {
  durationMs?: number
}

export interface ToastEntry {
  id: number
  kind: ToastKind
  message: string
  createdAt: number
  durationMs: number
}

/**
 * Where an anchored dialog floats: an element, or a rect such as
 * `selectionAnchor(editor)`. `contextElement` keeps it following scroll.
 */
export type DialogAnchor = Element | { getBoundingClientRect(): DOMRect; contextElement?: Element }

export interface PromptOptions {
  title: string
  /** Float the prompt under this spot instead of centring it as a modal. */
  anchor?: DialogAnchor
  message?: string
  placeholder?: string
  defaultValue?: string
  okLabel?: string
  cancelLabel?: string
  required?: boolean
}

export interface ConfirmOptions {
  title: string
  message?: string
  okLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

export interface AlertOptions {
  title: string
  message?: string
  okLabel?: string
}

export interface ImageDialogOptions {
  title?: string
  /** Overrides the uploader given to NotificationsHost. */
  uploadFile?: UploadFile
  defaultTab?: ImageInsertTab
  /** Float the picker under this spot instead of centring it as a modal. */
  anchor?: DialogAnchor
}

export interface LinkDialogOptions {
  editor: Editor
  /** Defaults to the editor's selection. */
  anchor?: DialogAnchor
}

export interface ToastApi {
  show(kind: ToastKind, message: string, opts?: ToastOptions): number
  dismiss(id: number): void
}

export interface DialogApi {
  prompt(opts: PromptOptions): Promise<string | null>
  confirm(opts: ConfirmOptions): Promise<boolean>
  alert(opts: AlertOptions): Promise<void>
  image(opts: ImageDialogOptions): Promise<ImageInsertValue | null>
  link(opts: LinkDialogOptions): Promise<void>
}

let toastApi: ToastApi | null = null
let dialogApi: DialogApi | null = null

function show(kind: ToastKind) {
  return (message: string, opts?: ToastOptions): number => {
    if (toastApi) return toastApi.show(kind, message, opts)
    // fallback: console
    if (typeof console !== 'undefined') {
      const fn = kind === 'error' ? 'error' : kind === 'warn' ? 'warn' : 'log'
      console[fn](`[${kind}] ${message}`)
    }
    return -1
  }
}

export const notify = {
  toast: {
    info: show('info'),
    success: show('success'),
    warn: show('warn'),
    error: show('error'),
    dismiss(id: number): void {
      toastApi?.dismiss(id)
    },
  },
  prompt(opts: PromptOptions): Promise<string | null> {
    if (!dialogApi) return Promise.resolve(opts.defaultValue ?? null)
    return dialogApi.prompt(opts)
  },
  confirm(opts: ConfirmOptions): Promise<boolean> {
    if (!dialogApi) return Promise.resolve(false)
    return dialogApi.confirm(opts)
  },
  alert(opts: AlertOptions): Promise<void> {
    if (!dialogApi) return Promise.resolve()
    return dialogApi.alert(opts)
  },
  /** Upload-or-link image picker; resolves to the image to insert, or null. */
  image(opts: ImageDialogOptions = {}): Promise<ImageInsertValue | null> {
    if (!dialogApi) return Promise.resolve(null)
    return dialogApi.image(opts)
  },
  /** Link + display-text form floating under the selection; edits the link in place. */
  link(opts: LinkDialogOptions): Promise<void> {
    if (!dialogApi) return Promise.resolve()
    return dialogApi.link(opts)
  },
}

/** Anchor at a document position, or at the selection when `pos` is omitted. */
export function selectionAnchor(editor: Editor, pos?: number): DialogAnchor {
  return {
    contextElement: editor.view.dom,
    getBoundingClientRect: () => {
      const { from, to } = editor.state.selection
      const start = editor.view.coordsAtPos(pos ?? from)
      const end = pos == null ? editor.view.coordsAtPos(to) : start
      const left = Math.min(start.left, end.left)
      const top = Math.min(start.top, end.top)
      const right = Math.max(start.right, end.right)
      const bottom = Math.max(start.bottom, end.bottom)
      return new DOMRect(left, top, right - left, bottom - top)
    },
  }
}

export function _registerToastApi(api: ToastApi | null): void {
  toastApi = api
}
export function _registerDialogApi(api: DialogApi | null): void {
  dialogApi = api
}
