import {
  AlignmentType,
  BorderStyle,
  ExternalHyperlink,
  HeadingLevel,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type IParagraphOptions,
  type IRunOptions,
} from 'docx'
import type { JSONMark, JSONNode } from './types'

const HEADING_LEVEL: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
}

const ALIGN_MAP: Record<string, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
}

interface ListContext {
  kind: 'bullet' | 'number' | 'task'
  level: number
}

export function convertDoc(doc: JSONNode): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = []
  for (const child of doc.content ?? []) {
    out.push(...convertBlock(child))
  }
  if (out.length === 0) out.push(new Paragraph({}))
  return out
}

function convertBlock(
  node: JSONNode,
  listCtx: ListContext | null = null,
  extra: Record<string, unknown> = {},
): (Paragraph | Table)[] {
  switch (node.type) {
    case 'paragraph':
      return [paragraph(node, { ...baseParaOpts(node, listCtx), ...extra })]
    case 'heading': {
      const level = (node.attrs?.level as number | undefined) ?? 1
      return [
        paragraph(node, {
          ...baseParaOpts(node, listCtx),
          ...extra,
          heading: HEADING_LEVEL[level] ?? HeadingLevel.HEADING_1,
        }),
      ]
    }
    case 'blockquote': {
      const quoteExtra: Record<string, unknown> = {
        ...extra,
        indent: { left: 720 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: '888888', space: 12 } },
      }
      const inner: (Paragraph | Table)[] = []
      for (const child of node.content ?? []) {
        inner.push(...convertBlock(child, listCtx, quoteExtra))
      }
      return inner.length ? inner : [new Paragraph({ indent: { left: 720 } })]
    }
    case 'codeBlock':
      return [
        new Paragraph({
          shading: { type: ShadingType.SOLID, color: 'F0F0F3', fill: 'F0F0F3' },
          children: [
            new TextRun({
              text: collectText(node),
              font: 'Courier New',
              size: 20,
            }),
          ],
        }),
      ]
    case 'horizontalRule':
      return [
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: 'CCCCCC' } },
        }),
      ]
    case 'pageBreak':
      return [new Paragraph({ pageBreakBefore: true })]
    case 'bulletList':
      return convertList(node, 'bullet')
    case 'orderedList':
      return convertList(node, 'number')
    case 'taskList':
      return convertList(node, 'task')
    case 'table':
      return [convertTable(node)]
    default:
      if (node.content) return (node.content ?? []).flatMap((c) => convertBlock(c, listCtx, extra))
      return []
  }
}

function convertList(node: JSONNode, kind: 'bullet' | 'number' | 'task', level = 0): Paragraph[] {
  const out: Paragraph[] = []
  for (const item of node.content ?? []) {
    if (item.type !== 'listItem' && item.type !== 'taskItem') continue
    const ctx: ListContext = { kind, level }
    for (const child of item.content ?? []) {
      if (child.type === 'paragraph') {
        out.push(paragraph(child, listParaOpts(ctx, item)))
      } else if (
        child.type === 'bulletList' ||
        child.type === 'orderedList' ||
        child.type === 'taskList'
      ) {
        const subKind =
          child.type === 'bulletList' ? 'bullet' : child.type === 'orderedList' ? 'number' : 'task'
        out.push(...convertList(child, subKind, level + 1))
      } else {
        const blocks = convertBlock(child, ctx)
        for (const b of blocks) if (b instanceof Paragraph) out.push(b)
      }
    }
  }
  return out
}

function listParaOpts(ctx: ListContext, item: JSONNode): Record<string, unknown> {
  if (ctx.kind === 'bullet') return { bullet: { level: ctx.level } }
  if (ctx.kind === 'number') return { numbering: { reference: 'numbered', level: ctx.level } }
  const checked = item.attrs?.checked === true
  return {
    bullet: { level: ctx.level },
    children: [new TextRun({ text: checked ? '☑ ' : '☐ ' })],
  }
}

function convertTable(node: JSONNode): Table {
  const rows: TableRow[] = []
  for (const rowNode of node.content ?? []) {
    if (rowNode.type !== 'table_row') continue
    const cells: TableCell[] = []
    for (const cellNode of rowNode.content ?? []) {
      const isHeader = cellNode.type === 'table_header'
      const cellChildren: (Paragraph | Table)[] = []
      for (const block of cellNode.content ?? []) {
        cellChildren.push(...convertBlock(block))
      }
      if (cellChildren.length === 0) cellChildren.push(new Paragraph({}))
      const onlyParas = cellChildren.filter((c): c is Paragraph => c instanceof Paragraph)
      cells.push(
        new TableCell({
          children: onlyParas.length ? onlyParas : [new Paragraph({})],
          shading: isHeader
            ? { type: ShadingType.SOLID, color: 'F0F0F3', fill: 'F0F0F3' }
            : undefined,
        }),
      )
    }
    rows.push(new TableRow({ children: cells }))
  }
  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  })
}

function baseParaOpts(node: JSONNode, listCtx: ListContext | null): Record<string, unknown> {
  const opts: Record<string, unknown> = {}
  const align = node.attrs?.textAlign as string | undefined
  if (align && ALIGN_MAP[align]) opts.alignment = ALIGN_MAP[align]
  if (listCtx) {
    if (listCtx.kind === 'bullet') opts.bullet = { level: listCtx.level }
    else if (listCtx.kind === 'number')
      opts.numbering = { reference: 'numbered', level: listCtx.level }
  }
  return opts
}

function paragraph(node: JSONNode, baseOpts: Record<string, unknown>): Paragraph {
  const userChildren = (baseOpts.children as (TextRun | ExternalHyperlink)[] | undefined) ?? []
  const children: (TextRun | ExternalHyperlink)[] = [...userChildren]
  for (const inline of node.content ?? []) {
    children.push(...convertInline(inline))
  }
  const opts = { ...baseOpts, children }
  return new Paragraph(opts as unknown as IParagraphOptions)
}

function convertInline(node: JSONNode): (TextRun | ExternalHyperlink)[] {
  if (node.type === 'text') {
    return [textRunWithMarks(node.text ?? '', node.marks ?? [])]
  }
  if (node.type === 'hardBreak') {
    return [new TextRun({ text: '', break: 1 })]
  }
  return []
}

function textRunWithMarks(text: string, marks: JSONMark[]): TextRun | ExternalHyperlink {
  const runOpts: Record<string, unknown> = { text }
  let href: string | null = null
  for (const m of marks) {
    switch (m.type) {
      case 'bold':
        runOpts.bold = true
        break
      case 'italic':
        runOpts.italics = true
        break
      case 'underline':
        runOpts.underline = {}
        break
      case 'strike':
        runOpts.strike = true
        break
      case 'code':
        runOpts.font = 'Courier New'
        runOpts.shading = { type: ShadingType.SOLID, color: 'F0F0F3', fill: 'F0F0F3' }
        break
      case 'link':
        href = (m.attrs?.href as string) ?? null
        break
      case 'highlight': {
        const color = ((m.attrs?.color as string) ?? '#fff59d').replace('#', '')
        runOpts.highlight = 'yellow'
        runOpts.shading = { type: ShadingType.SOLID, color, fill: color }
        break
      }
      case 'textStyle': {
        const color = m.attrs?.color as string | null
        const family = m.attrs?.fontFamily as string | null
        const size = m.attrs?.fontSize as string | null
        if (color) runOpts.color = color.replace('#', '')
        if (family) {
          const first = family.split(',')[0]
          if (first) runOpts.font = first.trim().replace(/['"]/g, '')
        }
        if (size) {
          const m2 = size.match(/(\d+(?:\.\d+)?)/)
          if (m2 && m2[1]) runOpts.size = Math.round(parseFloat(m2[1]) * 2)
        }
        break
      }
    }
  }
  const run = new TextRun(runOpts as IRunOptions)
  if (href) return new ExternalHyperlink({ link: href, children: [run] })
  return run
}

function collectText(node: JSONNode): string {
  if (node.text) return node.text
  return (node.content ?? []).map(collectText).join('')
}
