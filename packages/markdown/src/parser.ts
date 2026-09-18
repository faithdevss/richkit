import { htmlToDoc, type Editor } from '@richkitjs/core'
import type { Node as PMNode, Schema } from 'prosemirror-model'
import MarkdownIt from 'markdown-it'
import type { StateCore } from 'markdown-it'

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

const md = new MarkdownIt({ html: true, linkify: true })
md.core.ruler.push('rich_editor_task_lists', taskListRule)

export function markdownToHtml(markdown: string): string {
  return md.render(markdown)
}

export function markdownToDoc(markdown: string, schema: Schema): PMNode {
  return htmlToDoc(markdownToHtml(markdown), schema)
}

export function setMarkdownContent(editor: Editor, markdown: string): void {
  editor.setContent(markdownToHtml(markdown))
}
