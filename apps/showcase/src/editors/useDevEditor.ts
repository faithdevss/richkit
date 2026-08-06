import { useEffect } from 'react'

// Dev/testing aid: expose the currently mounted editor instance on window so
// automated smoke tests can drive it via the real API. Harmless in production.
export function useDevEditor(editor: unknown): void {
  useEffect(() => {
    if (editor && typeof window !== 'undefined') {
      ;(window as unknown as { __ed: unknown }).__ed = editor
    }
  }, [editor])
}
