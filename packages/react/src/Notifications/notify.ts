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

export interface PromptOptions {
  title: string
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

export interface ToastApi {
  show(kind: ToastKind, message: string, opts?: ToastOptions): number
  dismiss(id: number): void
}

export interface DialogApi {
  prompt(opts: PromptOptions): Promise<string | null>
  confirm(opts: ConfirmOptions): Promise<boolean>
  alert(opts: AlertOptions): Promise<void>
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
}

export function _registerToastApi(api: ToastApi | null): void {
  toastApi = api
}
export function _registerDialogApi(api: DialogApi | null): void {
  dialogApi = api
}
