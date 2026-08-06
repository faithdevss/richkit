import type { Editor } from '@richkit/core'
import { useEffect, useRef, type HTMLAttributes } from 'react'

export interface EditorContentProps extends HTMLAttributes<HTMLDivElement> {
  editor: Editor | null
}

export function EditorContent({ editor, ...rest }: EditorContentProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editor || !ref.current) return
    const container = ref.current
    container.appendChild(editor.view.dom)
    return () => {
      if (editor.view.dom.parentNode === container) {
        container.removeChild(editor.view.dom)
      }
    }
  }, [editor])

  return <div ref={ref} {...rest} />
}
