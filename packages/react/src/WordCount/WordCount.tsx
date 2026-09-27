import type { Editor } from '@richkitjs/core'
import { getWordCount, type WordCountStats } from '@richkitjs/extension-word-count'
import { useEffect, useState } from 'react'

type Stat = 'words' | 'characters' | 'readingTime'

export interface WordCountProps {
  editor: Editor | null
  /** Which figures to show, in order. Default: words and characters. */
  show?: Stat[]
  /**
   * A soft cap: the count reads "n / limit" and turns to the danger colour
   * past it. Nothing stops typing — enforce hard limits in the schema.
   */
  limit?: number
  /** What `limit` counts. Default: characters. */
  limitBy?: 'words' | 'characters'
  className?: string
}

interface Counts {
  doc: WordCountStats
  /** Counts for a non-empty selection, shown as "x of y". */
  selection: WordCountStats | null
}

function count(editor: Editor): Counts {
  const { doc, selection } = editor.state
  const { from, to, empty } = selection
  // a selected image or other leaf is not text to count
  const hasText = !empty && doc.textBetween(from, to, ' ', '').trim() !== ''
  return {
    doc: getWordCount(doc),
    selection: hasText ? getWordCount(doc.cut(from, to)) : null,
  }
}

const plural = (n: number, one: string) => `${n.toLocaleString()} ${one}${n === 1 ? '' : 's'}`

/**
 * Live word / character count for a status bar. With text selected it
 * counts the selection against the whole ("12 of 340 words").
 */
export function WordCount({
  editor,
  show = ['words', 'characters'],
  limit,
  limitBy = 'characters',
  className,
}: WordCountProps) {
  const [counts, setCounts] = useState<Counts | null>(null)

  useEffect(() => {
    if (!editor) return
    const sync = () => setCounts(count(editor))
    sync()
    const offUpdate = editor.on('update', sync)
    const offSelection = editor.on('selectionUpdate', sync)
    return () => {
      offUpdate()
      offSelection()
    }
  }, [editor])

  if (!counts) return null
  const { doc, selection } = counts

  const figure = (stat: Stat): string => {
    if (stat === 'readingTime') return `${doc.readingTimeMinutes} min read`
    const one = stat === 'words' ? 'word' : 'character'
    const total = doc[stat]
    if (limit != null && stat === limitBy) {
      return `${total.toLocaleString()} / ${plural(limit, one)}`
    }
    return selection
      ? `${selection[stat].toLocaleString()} of ${plural(total, one)}`
      : plural(total, one)
  }

  const over = limit != null && doc[limitBy] > limit

  return (
    <div
      // not a live region: announcing every keystroke would drown out typing
      className={`rk-word-count${over ? ' is-over' : ''}${className ? ` ${className}` : ''}`}
    >
      {show.map((stat, i) => (
        <span key={stat} className={`rk-word-count-${stat}`}>
          {i > 0 && <span className="rk-word-count-dot" aria-hidden="true" />}
          {figure(stat)}
        </span>
      ))}
    </div>
  )
}
