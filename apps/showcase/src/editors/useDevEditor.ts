import type { Editor } from '@richkitjs/core'

// Dev/testing aid: expose the currently mounted editor instance on window so
// automated smoke tests can drive it via the real API. Harmless in production.
// Pass it as a ready-made editor's `onEditorReady`.
export function exposeEditor(editor: Editor): void {
  if (typeof window !== 'undefined') {
    ;(window as unknown as { __ed: unknown }).__ed = editor
  }
}
