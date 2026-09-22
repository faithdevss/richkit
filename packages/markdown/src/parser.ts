import {
  docToHtml,
  getSchema,
  htmlToDoc,
  type AnyExtension,
  type Editor,
  type HtmlDomOptions,
} from '@richkitjs/core'
import type { Node as PMNode, Schema } from 'prosemirror-model'
import MarkdownIt from 'markdown-it'
import type { StateCore } from 'markdown-it'
import { mathPlugin } from './math'

const TASK_RE = /^\[([ xX])\]\s+/

/**
 * Rewrite `- [ ] foo` / `- [x] foo` list items into the HTML shape
 * extension-task-list parses: <ul data-type="task-list"><li data-type="task-item" data-checked>
 */
function taskListRule(state: StateCore): void {
  const tokens = state.tokens
  for (let i = 0; i < tokens.length; i++) {
    const open = tokens[i]
    if (!open || open.type !== 'list_item_open') continue
    // find first inline token inside this list item
    let j = i + 1
    while (
      j < tokens.length &&
      tokens[j]?.type !== 'inline' &&
      tokens[j]?.type !== 'list_item_close'
    )
      j++
    const inline = tokens[j]
    if (!inline || inline.type !== 'inline') continue
    const m = TASK_RE.exec(inline.content)
    if (!m) continue
    const checked = m[1]?.toLowerCase() === 'x'
    inline.content = inline.content.replace(TASK_RE, '')
    const first = inline.children?.[0]
    if (first && first.type === 'text') first.content = first.content.replace(TASK_RE, '')
    open.attrSet('data-type', 'task-item')
    open.attrSet('data-checked', String(checked))
    // walk back to the enclosing bullet_list_open and tag it
    for (let k = i - 1; k >= 0; k--) {
      const t = tokens[k]
      if (t?.type === 'bullet_list_open') {
        if (t.attrGet('data-type') !== 'task-list') t.attrSet('data-type', 'task-list')
        break
      }
      if (t?.type === 'bullet_list_close') break
    }
  }
}

function createParser(html: boolean): InstanceType<typeof MarkdownIt> {
  const md = new MarkdownIt({ html, linkify: true })
  md.core.ruler.push('rich_editor_task_lists', taskListRule)
  md.use(mathPlugin)
  return md
}

const rawParser = createParser(true)
const escapingParser = createParser(false)

export interface MarkdownToHtmlOptions extends HtmlDomOptions {
  /**
   * Let raw HTML in the Markdown through. Off by default: `<script>`,
   * `<img onerror>` and the like come out as escaped text. Turning it on
   * without `extensions` or `schema` returns the HTML unfiltered — only do
   * that when the output is going straight into an editor, which filters it.
   */
  html?: boolean
  /**
   * Clean the output through this schema. Raw HTML is then allowed, so the
   * tags RichKit's own Markdown uses (`<u>`, `<mark>`, `<sub>`, `<details>`,
   * tables and images with sizes) survive, and anything the schema does not
   * define, along with unsafe URLs, is removed.
   */
  extensions?: readonly AnyExtension[]
  /** A schema you already have, such as `editor.schema`. Same as `extensions`. */
  schema?: Schema
}

/**
 * Renders Markdown to HTML.
 *
 * With no options, raw HTML in the source is escaped, so the result is safe
 * to put on a page. Pass `extensions` (or `schema`) to keep RichKit's HTML
 * extensions and sanitize through the schema instead:
 *
 * ```ts
 * markdownToHtml(md) // safe, raw HTML escaped
 * markdownToHtml(md, { extensions: StarterKit }) // safe, full fidelity
 * ```
 */
export function markdownToHtml(markdown: string, options: MarkdownToHtmlOptions = {}): string {
  const schema = options.schema ?? (options.extensions ? getSchema(options.extensions) : undefined)
  if (schema)
    return docToHtml(htmlToDoc(rawParser.render(markdown), schema, options), schema, options)
  return (options.html ? rawParser : escapingParser).render(markdown)
}

export function markdownToDoc(
  markdown: string,
  schema: Schema,
  options: HtmlDomOptions = {},
): PMNode {
  // the schema filters it, so the raw HTML RichKit writes can come back in
  return htmlToDoc(rawParser.render(markdown), schema, options)
}

export function setMarkdownContent(editor: Editor, markdown: string): void {
  editor.setContent(markdownToDoc(markdown, editor.schema))
}
