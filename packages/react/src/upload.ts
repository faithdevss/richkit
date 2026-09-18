import { notify } from './Notifications/notify'

/** Stores a file the user picked and resolves to the URL to insert. */
export type UploadFile = (file: File) => Promise<string>

let defaultUploadFile: UploadFile | undefined

/** Set by NotificationsHost so every insert path shares the app's uploader. */
export function _registerDefaultUploadFile(fn: UploadFile | undefined): void {
  defaultUploadFile = fn
}

/** Cap on files inlined as data: URLs when the host gives no uploadFile. */
const INLINE_FILE_LIMIT = 10 * 1024 * 1024

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Hands the file to the host's uploader, or inlines it as a data: URL, which
 * keeps it in the document but grows the document by the file's size.
 * Resolves to null (after telling the user why) when nothing should be inserted.
 */
export async function storeFile(file: File, uploadFile?: UploadFile): Promise<string | null> {
  try {
    const upload = uploadFile ?? defaultUploadFile
    if (upload) return (await upload(file)) || null
    if (file.size > INLINE_FILE_LIMIT) {
      notify.toast.warn('File is too large to embed (10 MB max).')
      return null
    }
    return (await readAsDataUrl(file)) || null
  } catch {
    notify.toast.error(`Could not upload ${file.name}.`)
    return null
  }
}
