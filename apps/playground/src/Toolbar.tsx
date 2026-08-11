import type { Editor } from '@richkitjs/core'
import { DefaultToolbar, Toolbar as BaseToolbar } from '@richkitjs/react'

export function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  return (
    <BaseToolbar editor={editor} className="toolbar">
      <DefaultToolbar editor={editor} />
    </BaseToolbar>
  )
}
