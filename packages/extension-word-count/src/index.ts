import { Extension } from '@richkitjs/core'
import type { Node as PMNode } from 'prosemirror-model'

export interface WordCountStats {
  words: number
  characters: number
  charactersNoSpaces: number
  readingTimeMinutes: number
}

const WORDS_PER_MINUTE = 200

export function getWordCount(doc: PMNode): WordCountStats {
  const text = doc.textBetween(0, doc.content.size, ' ', ' ')
  const trimmed = text.trim()
  const words = trimmed ? trimmed.split(/\s+/).length : 0
  return {
    words,
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    readingTimeMinutes: words ? Math.ceil(words / WORDS_PER_MINUTE) : 0,
  }
}

export const WordCount = Extension.create({
  name: 'wordCount',
})
