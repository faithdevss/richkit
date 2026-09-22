import { MarkdownSerializer, type MarkdownSerializerState } from 'prosemirror-markdown'
import { DOMSerializer, type Node as PMNode } from 'prosemirror-model'

type NodeSerializer = (
  state: MarkdownSerializerState,
  node: PMNode,
  parent: PMNode,
  index: number,
) => void

function backticksFor(node: PMNode, side: -1 | 1): string {
  const ticks = /`+/g
  let len = 0
  if (node.isText && node.text) {
    let m: RegExpExecArray | null
    while ((m = ticks.exec(node.text))) len = Math.max(len, m[0].length)
  }
  let result = len > 0 && side > 0 ? ' `' : '`'
  for (let i = 0; i < len; i++) result += '`'
  if (len > 0 && side < 0) result += ' '
  return result
}

function serializeInlineCell(cell: PMNode): string {
  // flatten cell blocks to single-line inline markdown via a nested serializer run
  const doc = cell.type.schema.topNodeType.create(null, cell.content)
  const md = serializer.serialize(doc, { tightLists: true })
  return md
    .replace(/\|/g, '\\|')
    .replace(/\s*\n+\s*/g, ' ')
    .trim()
}

/** Whether every attr on `node` still has its schema default. */
function hasDefaultAttrs(node: PMNode): boolean {
  const specs = node.type.spec.attrs ?? {}
  return Object.entries(node.attrs).every(([key, value]) => {
    const fallback = (specs[key] as { default?: unknown } | undefined)?.default ?? null
    if (Array.isArray(value) && Array.isArray(fallback)) return value.length === fallback.length
    return (value ?? null) === fallback
  })
}

/**
 * `node` as HTML, for the details Markdown has no syntax for. markdown-it
 * reads raw HTML blocks back in, and the editor schema parses them. Needs a
 * DOM; without one (a bare Node process) the caller falls back to plain
 * Markdown and the details are lost, as before.
 */
function nodeToHtml(node: PMNode): string | null {
  const doc = typeof document === 'undefined' ? null : document
  if (!doc) return null
  const wrap = doc.createElement('div')
  wrap.appendChild(
    DOMSerializer.fromSchema(node.type.schema).serializeNode(node, { document: doc }),
  )
  // an HTML block ends at the first blank line, so keep the markup on one
  return wrap.innerHTML.replace(/\n\s*\n/g, '\n')
}

/**
 * GFM tables hold one line of inline text per cell and always have a header
 * row. Anything more — no header, a header cell further down, merged cells,
 * column widths, row heights, several blocks or aligned text in a cell — only
 * survives as HTML.
 */
function isPlainTable(table: PMNode): boolean {
  let plain = true
  table.forEach((row, _offset, rowIndex) => {
    row.forEach((cell) => {
      const isHeader = cell.type.name === 'table_header'
      if (isHeader !== (rowIndex === 0) || !hasDefaultAttrs(cell)) plain = false
      if (cell.childCount > 1) plain = false
      const block = cell.firstChild
      if (block && (block.type.name !== 'paragraph' || !hasDefaultAttrs(block))) plain = false
      block?.forEach((inline) => {
        if (!inline.isText) plain = false
      })
    })
  })
  return plain
}

const tableSerializer: NodeSerializer = (state, node) => {
  if (!isPlainTable(node)) {
    const html = nodeToHtml(node)
    if (html) {
      state.write(html)
      state.closeBlock(node)
      return
    }
  }
  const rows: string[][] = []
  node.forEach((row) => {
    const cells: string[] = []
    row.forEach((cell) => cells.push(serializeInlineCell(cell)))
    rows.push(cells)
  })
  if (!rows.length) return
  const cols = Math.max(...rows.map((r) => r.length))
  const pad = (r: string[]) => {
    while (r.length < cols) r.push('')
    return r
  }
  const line = (r: string[]) => `| ${pad(r).join(' | ')} |`
  const out: string[] = []
  // GFM requires a header row, so without a DOM the first row stands in for one
  out.push(line(rows[0] ?? []))
  out.push(`| ${new Array(cols).fill('---').join(' | ')} |`)
  for (let i = 1; i < rows.length; i++) out.push(line(rows[i] ?? []))
  state.write(out.join('\n'))
  state.closeBlock(node)
}

export const serializer = new MarkdownSerializer(
  {
    paragraph: (state, node) => {
      state.renderInline(node)
      state.closeBlock(node)
    },
    heading: (state, node) => {
      state.write(`${'#'.repeat((node.attrs['level'] as number) || 1)} `)
      state.renderInline(node)
      state.closeBlock(node)
    },
    blockquote: (state, node) => {
      state.wrapBlock('> ', null, node, () => state.renderContent(node))
    },
    codeBlock: (state, node) => {
      const lang = (node.attrs['language'] as string) || ''
      state.write(`\`\`\`${lang}\n`)
      state.text(node.textContent, false)
      state.ensureNewLine()
      state.write('```')
      state.closeBlock(node)
    },
    horizontalRule: (state, node) => {
      state.write('---')
      state.closeBlock(node)
    },
    pageBreak: (state, node) => {
      state.write('<div data-page-break></div>')
      state.closeBlock(node)
    },
    bulletList: (state, node) => {
      state.renderList(node, '  ', () => '- ')
    },
    orderedList: (state, node) => {
      const start = (node.attrs['start'] as number) || 1
      const maxW = String(start + node.childCount - 1).length
      const space = ' '.repeat(maxW + 2)
      state.renderList(node, space, (i) => {
        const n = String(start + i)
        return `${' '.repeat(maxW - n.length)}${n}. `
      })
    },
    listItem: (state, node) => {
      state.renderContent(node)
    },
    taskList: (state, node) => {
      state.renderList(node, '  ', () => '- ')
    },
    taskItem: (state, node) => {
      state.write(node.attrs['checked'] ? '[x] ' : '[ ] ')
      state.renderContent(node)
    },
    image: (state, node) => {
      // `![alt](src "title")` has no room for a size, alignment or caption
      const { width, height, align, caption } = node.attrs
      if (width != null || height != null || align || caption) {
        const html = nodeToHtml(node)
        if (html) {
          state.write(html)
          return
        }
      }
      const alt = state.esc((node.attrs['alt'] as string) || '')
      const src = (node.attrs['src'] as string) || ''
      const title = node.attrs['title']
        ? ` "${String(node.attrs['title']).replace(/"/g, '\\"')}"`
        : ''
      state.write(`![${alt}](${src}${title})`)
    },
    embed: (state, node) => {
      const src = (node.attrs['src'] as string) || ''
      const provider = (node.attrs['provider'] as string) || 'generic'
      state.write(`<div data-embed data-provider="${provider}" data-src="${src}"></div>`)
      state.closeBlock(node)
    },
    table: tableSerializer,
    // GitHub-style alerts are the closest Markdown has to a callout
    callout: (state, node) => {
      const kind = String(node.attrs['kind'] ?? 'tip').toUpperCase()
      state.wrapBlock('> ', null, node, () => {
        state.write(`[!${kind}]`)
        state.ensureNewLine()
        state.renderContent(node)
      })
    },
    toggle: (state, node) => {
      const open = node.attrs['open'] ? ' open' : ''
      state.write(`<details${open}>`)
      state.ensureNewLine()
      state.renderContent(node)
      state.write('</details>')
      state.closeBlock(node)
    },
    toggleSummary: (state, node) => {
      state.write('<summary>')
      state.renderInline(node)
      state.write('</summary>')
      state.closeBlock(node)
    },
    toggleBody: (state, node) => {
      state.renderContent(node)
    },
    bookmark: (state, node) => {
      const href = (node.attrs['href'] as string) || ''
      const title = state.esc((node.attrs['title'] as string) || href)
      state.write(`[${title}](${href})`)
      state.closeBlock(node)
    },
    media: (state, node) => {
      const src = (node.attrs['src'] as string) || ''
      const name = state.esc((node.attrs['name'] as string) || src)
      state.write(`[${name}](${src})`)
      state.closeBlock(node)
    },
    mention: (state, node) => {
      state.write(`@${String(node.attrs['label'] ?? node.attrs['id'] ?? '')}`)
    },
    hardBreak: (state) => {
      state.write('\\\n')
    },
    math: (state, node) => {
      state.write(`$${String(node.attrs['latex'] ?? '')}$`)
    },
    mathBlock: (state, node) => {
      state.write('$$')
      state.ensureNewLine()
      state.text(String(node.attrs['latex'] ?? ''), false)
      state.ensureNewLine()
      state.write('$$')
      state.closeBlock(node)
    },
    text: (state, node) => {
      const text = node.text ?? ''
      // With math in the schema a bare `$` could open a formula on the way
      // back in, so it is written escaped. Without math, output is unchanged.
      if (!node.type.schema.nodes['math'] || !text.includes('$')) {
        state.text(text)
        return
      }
      text.split('$').forEach((part, i) => {
        if (i > 0) state.write('\\$')
        if (part) state.text(part)
      })
    },
  },
  {
    bold: { open: '**', close: '**', mixable: true, expelEnclosingWhitespace: true },
    italic: { open: '*', close: '*', mixable: true, expelEnclosingWhitespace: true },
    strike: { open: '~~', close: '~~', mixable: true, expelEnclosingWhitespace: true },
    underline: { open: '<u>', close: '</u>', mixable: true },
    highlight: { open: '<mark>', close: '</mark>', mixable: true },
    subscript: { open: '<sub>', close: '</sub>', mixable: true },
    superscript: { open: '<sup>', close: '</sup>', mixable: true },
    code: {
      open: (_state, _mark, parent, index) => backticksFor(parent.child(index), -1),
      close: (_state, _mark, parent, index) => backticksFor(parent.child(index - 1), 1),
      escape: false,
    },
    link: {
      open: '[',
      close: (_state, mark) => {
        const href = (mark.attrs['href'] as string) || ''
        const title = mark.attrs['title']
          ? ` "${String(mark.attrs['title']).replace(/"/g, '\\"')}"`
          : ''
        return `](${href}${title})`
      },
      mixable: false,
    },
    // dropped on serialize (accepted lossy)
    textStyle: { open: '', close: '', mixable: true },
    comment: { open: '', close: '', mixable: true },
    insertion: { open: '', close: '', mixable: true },
    deletion: { open: '', close: '', mixable: true },
  },
  { strict: false },
)

export function docToMarkdown(doc: PMNode): string {
  return serializer.serialize(doc, { tightLists: true })
}
