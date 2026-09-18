import { Editor, type EditorOptions } from '@richkitjs/core'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

interface Store {
  subscribe: (cb: () => void) => () => void
  getSnapshot: () => number
}

function createStore(editor: Editor): Store {
  let version = 0
  const listeners = new Set<() => void>()
  const bump = () => {
    version++
    listeners.forEach((l) => l())
  }
  // Every dispatch, not just `update`: a silent setContent (a controlled value
  // syncing in) and plugin-state-only transactions still change what the UI shows.
  editor.on('transaction', bump)
  return {
    subscribe: (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    getSnapshot: () => version,
  }
}

export function useEditor(
  options: EditorOptions,
  deps: ReadonlyArray<unknown> = [],
): Editor | null {
  const [editor, setEditor] = useState<Editor | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    // The Editor subscribes the handler functions it is constructed with, once.
    // Passing options.onUpdate straight through would therefore freeze the
    // mount-time closure and hand every callback stale props and state. These
    // trampolines are stable for the editor's lifetime but always dispatch to
    // the current render's handlers.
    const instance = new Editor({
      ...optionsRef.current,
      onCreate: (props) => optionsRef.current.onCreate?.(props),
      onUpdate: (props) => optionsRef.current.onUpdate?.(props),
      onSelectionUpdate: (props) => optionsRef.current.onSelectionUpdate?.(props),
      onFocus: (props) => optionsRef.current.onFocus?.(props),
      onBlur: (props) => optionsRef.current.onBlur?.(props),
      onDestroy: () => optionsRef.current.onDestroy?.(),
    })
    setEditor(instance)
    return () => {
      instance.destroy()
      setEditor(null)
    }
  }, deps)

  const storeRef = useRef<Store | null>(null)
  if (editor && !storeRef.current) storeRef.current = createStore(editor)
  useSyncExternalStore(
    storeRef.current?.subscribe ?? (() => () => {}),
    storeRef.current?.getSnapshot ?? (() => 0),
    storeRef.current?.getSnapshot ?? (() => 0),
  )

  return editor
}
