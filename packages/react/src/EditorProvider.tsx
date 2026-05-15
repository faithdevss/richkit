import type { Editor } from '@rich-editor/core'
import { createContext, useContext, type ReactNode } from 'react'

const EditorContext = createContext<Editor | null>(null)

export function EditorProvider({
  editor,
  children,
}: {
  editor: Editor | null
  children: ReactNode
}) {
  return <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>
}

export function useEditorContext(): Editor | null {
  return useContext(EditorContext)
}
