import { MarkdownSerializer, type MarkdownSerializerState } from 'prosemirror-markdown'
import type { Node as PMNode } from 'prosemirror-model'

type NodeSerializer = (state: MarkdownSerializerState, node: PMNode, parent: PMNode, index: number) => void

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
  return md.replace(/\|/g, '\\|').replace(/\s*\n+\s*/g, ' ').trim()
}

const tableSerializer: NodeSerializer = (state, node) => {
  const rows: string[][] = []
  let headerRow = false
  node.forEach((row, _offset, rowIndex) => {
    const cells: string[] = []
    row.forEach((cell) => {
      if (rowIndex === 0 && cell.type.name === 'table_header') headerRow = true
      cells.push(serializeInlineCell(cell))
    })
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
  const first = rows[0] ?? []
  out.push(line(first))
  out.push(`| ${new Array(cols).fill('---').join(' | ')} |`)
  for (let i = 1; i < rows.length; i++) out.push(line(rows[i] ?? []))
  // if there was no header row, we still emit rows[0] as header (GFM requires one)
  void headerRow
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
      const alt = state.esc((node.attrs['alt'] as string) || '')
      const src = (node.attrs['src'] as string) || ''
      const title = node.attrs['title'] ? ` "${String(node.attrs['title']).replace(/"/g, '\\"')}"` : ''
      state.write(`![${alt}](${src}${title})`)
    },
    embed: (state, node) => {
      const src = (node.attrs['src'] as string) || ''
      const provider = (node.attrs['provider'] as string) || 'generic'
      state.write(`<div data-embed data-provider="${provider}" data-src="${src}"></div>`)
      state.closeBlock(node)
    },
    table: tableSerializer,
    hardBreak: (state) => {
      state.write('\\\n')
    },
    text: (state, node) => {
      state.text(node.text ?? '')
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
        const title = mark.attrs['title'] ? ` "${String(mark.attrs['title']).replace(/"/g, '\\"')}"` : ''
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
