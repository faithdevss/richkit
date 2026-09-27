import type { Editor } from '@richkitjs/core'
import { WordCount } from '@richkitjs/react'

export function StatusBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  return (
    <footer className="status-bar" data-testid="status-bar">
      <WordCount editor={editor} show={['words', 'characters', 'readingTime']} />
    </footer>
  )
}
