import { DOMParser as PMDOMParser, Slice } from 'prosemirror-model'
import type { EditorView } from 'prosemirror-view'

const URL_ONLY_RE = /^(https?:\/\/|www\.)[^\s]+$/i

/**
 * Block-level Markdown worth converting on paste. Inline emphasis alone is
 * not enough — pasting `a * b * c` should stay literal text.
 */
const MARKDOWN_BLOCK_RE = /^\s{0,3}(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```|\|.*\|)/m

export function looksLikeMarkdown(text: string): boolean {
  return MARKDOWN_BLOCK_RE.test(text)
}

export function looksLikeUrl(text: string): boolean {
  return URL_ONLY_RE.test(text.trim())
}

/** Links the current selection, or inserts the URL as a link when empty. */
export function pasteUrl(view: EditorView, raw: string): boolean {
  const linkType = view.state.schema.marks['link']
  if (!linkType) return false
  const url = raw.trim()
  const href = url.startsWith('http') ? url : `https://${url}`
  const mark = linkType.create({ href, target: '_blank', rel: 'noopener noreferrer' })
  const { from, to, empty } = view.state.selection
  const tr = view.state.tr
  if (empty) {
    tr.insertText(url, from)
    tr.addMark(from, from + url.length, mark)
  } else {
    tr.addMark(from, to, mark)
  }
  view.dispatch(tr.scrollIntoView())
  return true
}

/** Replaces the selection with the blocks the Markdown describes. */
export function pasteMarkdown(view: EditorView, html: string): boolean {
  const dom = new window.DOMParser().parseFromString(html, 'text/html')
  const slice = PMDOMParser.fromSchema(view.state.schema).parseSlice(dom.body, {
    preserveWhitespace: false,
  })
  if (!slice.content.size) return false
  view.dispatch(view.state.tr.replaceSelection(new Slice(slice.content, 0, 0)).scrollIntoView())
  return true
}
