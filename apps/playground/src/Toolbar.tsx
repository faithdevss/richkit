import type { Editor } from '@richkit/core'
import { DefaultToolbar, Toolbar as BaseToolbar } from '@richkit/react'

export function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  return (
    <BaseToolbar editor={editor} className="toolbar">
      <DefaultToolbar editor={editor} />
    </BaseToolbar>
  )
}
