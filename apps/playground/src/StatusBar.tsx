import type { Editor } from '@rich-editor/core'
import { getWordCount, type WordCountStats } from '@rich-editor/extension-word-count'
import { useEffect, useState } from 'react'

export function StatusBar({ editor }: { editor: Editor | null }) {
  const [stats, setStats] = useState<WordCountStats | null>(null)

  useEffect(() => {
    if (!editor) return
    const sync = () => setStats(getWordCount(editor.state.doc))
    sync()
    return editor.on('update', sync)
  }, [editor])

  if (!editor || !stats) return null

  return (
    <footer className="status-bar" data-testid="status-bar">
      <span>{stats.words} words</span>
      <span>·</span>
      <span>{stats.characters} characters</span>
      <span>·</span>
      <span>~{stats.readingTimeMinutes} min read</span>
    </footer>
  )
}
