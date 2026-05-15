import type { Editor } from '../editor'

export interface AutosaveOptions {
  onSave: (html: string, editor: Editor) => void | Promise<void>
  debounceMs?: number
}

export function createAutosave(editor: Editor, opts: AutosaveOptions): () => void {
  const debounceMs = opts.debounceMs ?? 500
  let timer: ReturnType<typeof setTimeout> | null = null

  const unsubscribe = editor.on('update', () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      void opts.onSave(editor.getHTML(), editor)
    }, debounceMs)
  })

  return () => {
    if (timer) clearTimeout(timer)
    unsubscribe()
  }
}
