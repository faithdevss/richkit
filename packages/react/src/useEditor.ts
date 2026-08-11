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
  editor.on('update', bump)
  editor.on('selectionUpdate', bump)
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
    const instance = new Editor(optionsRef.current)
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
