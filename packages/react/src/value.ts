import type { Editor } from '@richkitjs/core'
import { docToMarkdown, markdownToHtml } from '@richkitjs/markdown'

/** How an editor's content is read out through `onChange` and taken in through `value`. */
export type ValueFormat = 'html' | 'markdown' | 'text' | 'json'

/** A ProseMirror document as plain JSON — what `editor.getJSON()` returns. */
export type JSONContent = Record<string, unknown>

/** The value type a format produces: a string, or the document JSON for `'json'`. */
export type EditorValue<F extends ValueFormat = 'html'> = F extends 'json' ? JSONContent : string

/**
 * The editor's content in `format`. String formats read an empty document as
 * `''` rather than `<p></p>`, so a form's required and dirty checks behave the
 * way they do for a plain input.
 */
export function getEditorValue<F extends ValueFormat>(editor: Editor, format: F): EditorValue<F> {
  if (format === 'json') return editor.getJSON() as EditorValue<F>
  if (editor.isEmpty) return '' as EditorValue<F>
  const { doc } = editor.state
  if (format === 'markdown') return docToMarkdown(doc) as EditorValue<F>
  if (format === 'text') return doc.textBetween(0, doc.content.size, '\n', '\n') as EditorValue<F>
  return editor.getHTML() as EditorValue<F>
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/** Turns a `value` in `format` into content `Editor` accepts: HTML or document JSON. */
export function toEditorContent(
  value: string | JSONContent | undefined,
  format: ValueFormat,
): string | JSONContent {
  if (value === undefined || value === '') return ''
  if (typeof value !== 'string') return value
  if (format === 'markdown') return markdownToHtml(value)
  if (format === 'text') {
    return value
      .split('\n')
      .map((line) => `<p>${escapeHtml(line)}</p>`)
      .join('')
  }
  return value
}

/** Whether two values in the same format describe the same content. */
export function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a === 'object' && typeof b === 'object' && a && b) {
    return JSON.stringify(a) === JSON.stringify(b)
  }
  return false
}
