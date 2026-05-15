import type { Editor } from '@rich-editor/core'
import { DefaultToolbar, Toolbar as BaseToolbar } from '@rich-editor/react'

export function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  return (
    <BaseToolbar editor={editor} className="toolbar">
      <DefaultToolbar editor={editor} />
    </BaseToolbar>
  )
}
