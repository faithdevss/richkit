import type { Editor } from '@rich-editor/core'
import { downloadDocx } from '@rich-editor/docx'
import { createElement } from 'react'
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BlockquoteIcon,
  BoldIcon,
  BulletListIcon,
  ClearFormatIcon,
  CodeBlockIcon,
  CodeIcon,
  EmojiIcon,
  FontIcon,
  FullscreenIcon,
  HeadingIcon,
  HighlightIcon,
  HorizontalRuleIcon,
  ImageIcon,
  IndentInIcon,
  IndentOutIcon,
  ItalicIcon,
  LineHeightIcon,
  LinkIcon,
  OmegaIcon,
  OrderedListIcon,
  ParagraphIcon,
  RedoIcon,
  StrikeIcon,
  TableIcon,
  TextColorIcon,
  UnderlineIcon,
  UndoIcon,
} from '../icons'
import type { MenuDef } from './Menubar'

const MOD = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform) ? '⌘' : 'Ctrl'

export interface MenuActions {
  findReplace?: () => void
  sourceCode?: () => void
  restoreDraft?: () => void
  importFile?: () => void
  wordCount?: () => void
  shortcuts?: () => void
  toggleSpellcheck?: () => void
  spellcheckOn?: boolean
}

function runCmd(editor: Editor, cmd: string, ...args: unknown[]) {
  editor.chain().call(cmd, ...args).focus().run()
}

function promptLink(editor: Editor) {
  const url = window.prompt('Link URL')
  if (url === null) return
  if (url === '') runCmd(editor, 'unsetLink')
  else runCmd(editor, 'setLink', { href: url })
}

function promptImage(editor: Editor) {
  const url = window.prompt('Image URL')
  if (!url) return
  runCmd(editor, 'insertImage', { src: url })
}

function promptTable(editor: Editor) {
  const rows = parseInt(window.prompt('Rows', '3') ?? '0', 10)
  const cols = parseInt(window.prompt('Columns', '3') ?? '0', 10)
  if (!rows || !cols) return
  runCmd(editor, 'insertTable', { rows, cols, withHeaderRow: true })
}

function insertText(editor: Editor, text: string) {
  editor.view.dispatch(editor.view.state.tr.insertText(text))
  editor.focus()
}

function exportFile(editor: Editor, kind: 'html' | 'json') {
  const data =
    kind === 'html'
      ? `<!doctype html><html><head><meta charset="utf-8"></head><body>${editor.getHTML()}</body></html>`
      : JSON.stringify(editor.getJSON(), null, 2)
  const mime = kind === 'html' ? 'text/html' : 'application/json'
  const blob = new Blob([data], { type: mime })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `document.${kind}`
  a.click()
  URL.revokeObjectURL(a.href)
}

async function exportWord(editor: Editor) {
  await downloadDocx(editor, { filename: 'document.docx', author: 'Rich Editor' })
}

function exportPdf(editor: Editor) {
  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) return
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>Export PDF</title><style>@page{margin:1in}body{font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#1a1a1a;max-width:7in;margin:0 auto}img{max-width:100%}table{border-collapse:collapse;width:auto}th,td{border:1px solid #999;padding:6px 10px}.page-break{page-break-after:always}h1,h2,h3{margin:.8em 0 .4em}</style></head><body>${editor.getHTML()}<script>window.onload=()=>setTimeout(()=>window.print(),200);</script></body></html>`,
  )
  w.document.close()
}

function previewHtml(editor: Editor) {
  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) return
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>Preview</title><style>body{font-family:ui-sans-serif,system-ui,sans-serif;padding:2rem;max-width:800px;margin:0 auto;line-height:1.65;color:#1a1a1a}img{max-width:100%}table{border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 10px}.page-break{display:block;height:1px;background:#ccc;margin:1rem 0}</style></head><body>${editor.getHTML()}</body></html>`,
  )
  w.document.close()
}

async function pasteAsText(editor: Editor) {
  try {
    const text = await navigator.clipboard.readText()
    if (text) insertText(editor, text)
  } catch {
    window.alert('Clipboard read denied. Use Cmd/Ctrl+Shift+V.')
  }
}

async function pasteRich(editor: Editor) {
  try {
    if (typeof navigator.clipboard.read === 'function') {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        if (item.types.includes('text/html')) {
          const blob = await item.getType('text/html')
          const html = await blob.text()
          const current = editor.getHTML()
          editor.setContent(current + html)
          return
        }
      }
    }
    await pasteAsText(editor)
  } catch {
    await pasteAsText(editor)
  }
}

function insertTableOfContents(editor: Editor) {
  const headings: { level: number; text: string }[] = []
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'heading') {
      headings.push({ level: node.attrs.level as number, text: node.textContent })
    }
    return true
  })
  if (!headings.length) {
    window.alert('No headings found.')
    return
  }
  const items = headings
    .map((h) => `<li style="margin-left: ${(h.level - 1) * 20}px">${escapeHtml(h.text)}</li>`)
    .join('')
  const tocHtml = `<h2>Table of contents</h2><ul>${items}</ul>`
  editor.setContent(tocHtml + editor.getHTML())
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  )
}

function insertFileLink(editor: Editor) {
  const input = document.createElement('input')
  input.type = 'file'
  input.onchange = () => {
    const f = input.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    runCmd(editor, 'setLink', { href: url })
    insertText(editor, f.name)
  }
  input.click()
}

function insertMedia(editor: Editor) {
  const url = window.prompt('Media URL (YouTube/Vimeo/MP4)')
  if (!url) return
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/)
  const embed = yt
    ? `<p><iframe src="https://www.youtube.com/embed/${yt[1]}" width="560" height="315" frameborder="0" allowfullscreen></iframe></p>`
    : url.endsWith('.mp4')
      ? `<p><video src="${escapeHtml(url)}" controls width="560"></video></p>`
      : `<p><iframe src="${escapeHtml(url)}" width="560" height="315" frameborder="0"></iframe></p>`
  const current = editor.getHTML()
  editor.setContent(current + embed)
}

const EMOJI = ['😀', '😂', '😍', '😎', '🤔', '👍', '🎉', '❤️', '🔥', '🚀', '✨', '⭐']
const SPECIAL = ['©', '®', '™', '§', '¶', '†', '‡', '°', '±', '×', '÷', '≈', '≠', '≤', '≥', '→', '←', '↑', '↓', '—', '–', '…']

function icon(C: (props: object) => unknown) {
  return createElement(C as never, { width: 16, height: 16 })
}

export function buildMenus(_editor: Editor, actions: MenuActions = {}): MenuDef[] {
  return [
    {
      label: 'File',
      items: [
        { label: 'New document', icon: icon(ParagraphIcon), onSelect: (e) => e.setContent('<p></p>') },
        { label: 'Restore last draft', icon: icon(UndoIcon), disabled: !actions.restoreDraft, onSelect: () => actions.restoreDraft?.() },
        { separator: true },
        { label: 'Preview', icon: icon(FontIcon), onSelect: previewHtml },
        { separator: true },
        { label: 'Import HTML…', icon: icon(LinkIcon), disabled: !actions.importFile, onSelect: () => actions.importFile?.() },
        { label: 'Export to HTML…', icon: icon(CodeIcon), onSelect: (e) => exportFile(e, 'html') },
        { label: 'Export to JSON…', icon: icon(CodeIcon), onSelect: (e) => exportFile(e, 'json') },
        { label: 'Export to PDF…', icon: icon(FontIcon), onSelect: exportPdf },
        { label: 'Export to Word…', icon: icon(FontIcon), onSelect: exportWord },
        { separator: true },
        { label: 'Print…', icon: icon(FontIcon), shortcut: `${MOD}P`, onSelect: () => window.print() },
        { separator: true },
        { label: 'Clear document', icon: icon(ClearFormatIcon), onSelect: (e) => e.setContent('<p></p>') },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', icon: icon(UndoIcon), shortcut: `${MOD}Z`, onSelect: (e) => runCmd(e, 'undo') },
        { label: 'Redo', icon: icon(RedoIcon), shortcut: `${MOD}⇧Z`, onSelect: (e) => runCmd(e, 'redo') },
        { separator: true },
        { label: 'Cut', shortcut: `${MOD}X`, onSelect: () => document.execCommand('cut') },
        { label: 'Copy', shortcut: `${MOD}C`, onSelect: () => document.execCommand('copy') },
        { label: 'Paste', shortcut: `${MOD}V`, onSelect: pasteRich },
        { label: 'Paste as text', onSelect: pasteAsText },
        { separator: true },
        { label: 'Select all', shortcut: `${MOD}A`, onSelect: (e) => runCmd(e, 'selectAll') },
        { label: 'Find and replace…', shortcut: `${MOD}F`, disabled: !actions.findReplace, onSelect: () => actions.findReplace?.() },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Fullscreen', icon: icon(FullscreenIcon), shortcut: 'F11', onSelect: toggleFullscreen },
        { label: 'Source code', icon: icon(CodeIcon), disabled: !actions.sourceCode, onSelect: () => actions.sourceCode?.() },
      ],
    },
    {
      label: 'Insert',
      items: [
        { label: 'Image…', icon: icon(ImageIcon), onSelect: promptImage },
        { label: 'File…', icon: icon(LinkIcon), onSelect: insertFileLink },
        { label: 'Table…', icon: icon(TableIcon), onSelect: promptTable },
        { separator: true },
        { label: 'Link…', icon: icon(LinkIcon), shortcut: `${MOD}K`, onSelect: promptLink },
        {
          label: 'Emoji',
          icon: icon(EmojiIcon),
          submenu: EMOJI.map((e) => ({ label: e, onSelect: (ed) => insertText(ed, e) })),
        },
        { separator: true },
        { label: 'Media…', icon: icon(ImageIcon), onSelect: insertMedia },
        {
          label: 'Special characters',
          icon: icon(OmegaIcon),
          submenu: SPECIAL.map((c) => ({ label: c, onSelect: (ed) => insertText(ed, c) })),
        },
        { label: 'Block quote', icon: icon(BlockquoteIcon), onSelect: (e) => runCmd(e, 'toggleBlockquote') },
        { label: 'Code block', icon: icon(CodeBlockIcon), onSelect: (e) => runCmd(e, 'toggleCodeBlock') },
        { separator: true },
        { label: 'Horizontal line', icon: icon(HorizontalRuleIcon), onSelect: (e) => runCmd(e, 'insertHorizontalRule') },
        { label: 'Page break', icon: icon(HorizontalRuleIcon), onSelect: (e) => runCmd(e, 'insertPageBreak') },
        { label: 'Table of contents', icon: icon(BulletListIcon), onSelect: insertTableOfContents },
      ],
    },
    {
      label: 'Format',
      items: [
        {
          label: 'Text',
          icon: icon(BoldIcon),
          submenu: [
            { label: 'Bold', icon: icon(BoldIcon), shortcut: `${MOD}B`, onSelect: (e) => runCmd(e, 'toggleBold') },
            { label: 'Italic', icon: icon(ItalicIcon), shortcut: `${MOD}I`, onSelect: (e) => runCmd(e, 'toggleItalic') },
            { label: 'Underline', icon: icon(UnderlineIcon), shortcut: `${MOD}U`, onSelect: (e) => runCmd(e, 'toggleUnderline') },
            { label: 'Strikethrough', icon: icon(StrikeIcon), onSelect: (e) => runCmd(e, 'toggleStrike') },
            { label: 'Inline code', icon: icon(CodeIcon), onSelect: (e) => runCmd(e, 'toggleCode') },
            { label: 'Highlight', icon: icon(HighlightIcon), shortcut: `${MOD}⇧H`, onSelect: (e) => runCmd(e, 'setHighlight', '#fff59d') },
            { label: 'Text color (red)', icon: icon(TextColorIcon), onSelect: (e) => runCmd(e, 'setColor', '#dc2626') },
          ],
        },
        {
          label: 'Font',
          icon: icon(FontIcon),
          submenu: [
            { label: 'Default', onSelect: (e) => runCmd(e, 'setFontFamily', null) },
            { label: 'Sans-serif', onSelect: (e) => runCmd(e, 'setFontFamily', 'ui-sans-serif, system-ui, sans-serif') },
            { label: 'Serif', onSelect: (e) => runCmd(e, 'setFontFamily', 'Georgia, serif') },
            { label: 'Monospace', onSelect: (e) => runCmd(e, 'setFontFamily', 'ui-monospace, Menlo, monospace') },
          ],
        },
        {
          label: 'Heading',
          icon: icon(HeadingIcon),
          submenu: [
            { label: 'Paragraph', icon: icon(ParagraphIcon), onSelect: (e) => runCmd(e, 'setParagraph') },
            { label: 'Heading 1', onSelect: (e) => runCmd(e, 'setHeading', { level: 1 }) },
            { label: 'Heading 2', onSelect: (e) => runCmd(e, 'setHeading', { level: 2 }) },
            { label: 'Heading 3', onSelect: (e) => runCmd(e, 'setHeading', { level: 3 }) },
            { label: 'Heading 4', onSelect: (e) => runCmd(e, 'setHeading', { level: 4 }) },
            { label: 'Heading 5', onSelect: (e) => runCmd(e, 'setHeading', { level: 5 }) },
            { label: 'Heading 6', onSelect: (e) => runCmd(e, 'setHeading', { level: 6 }) },
          ],
        },
        { separator: true },
        { label: 'Bulleted List', icon: icon(BulletListIcon), onSelect: (e) => runCmd(e, 'toggleBulletList') },
        { label: 'Numbered List', icon: icon(OrderedListIcon), onSelect: (e) => runCmd(e, 'toggleOrderedList') },
        { label: 'To-do List', onSelect: (e) => runCmd(e, 'toggleTaskList') },
        { separator: true },
        {
          label: 'Text alignment',
          icon: icon(AlignLeftIcon),
          submenu: [
            { label: 'Left', icon: icon(AlignLeftIcon), shortcut: `${MOD}⇧L`, onSelect: (e) => runCmd(e, 'setTextAlign', null) },
            { label: 'Center', icon: icon(AlignCenterIcon), shortcut: `${MOD}⇧E`, onSelect: (e) => runCmd(e, 'setTextAlign', 'center') },
            { label: 'Right', icon: icon(AlignRightIcon), shortcut: `${MOD}⇧R`, onSelect: (e) => runCmd(e, 'setTextAlign', 'right') },
            { label: 'Justify', icon: icon(AlignJustifyIcon), shortcut: `${MOD}⇧J`, onSelect: (e) => runCmd(e, 'setTextAlign', 'justify') },
          ],
        },
        {
          label: 'Line height',
          icon: icon(LineHeightIcon),
          submenu: [
            { label: 'Default', onSelect: (e) => runCmd(e, 'setLineHeight', null) },
            { label: '1.0', onSelect: (e) => runCmd(e, 'setLineHeight', '1.0') },
            { label: '1.15', onSelect: (e) => runCmd(e, 'setLineHeight', '1.15') },
            { label: '1.5', onSelect: (e) => runCmd(e, 'setLineHeight', '1.5') },
            { label: '2.0', onSelect: (e) => runCmd(e, 'setLineHeight', '2.0') },
            { label: '2.5', onSelect: (e) => runCmd(e, 'setLineHeight', '2.5') },
          ],
        },
        { label: 'Increase indent', icon: icon(IndentInIcon), onSelect: (e) => runCmd(e, 'sinkListItem') },
        { label: 'Decrease indent', icon: icon(IndentOutIcon), onSelect: (e) => runCmd(e, 'liftListItem') },
        { separator: true },
        {
          label: 'Case change',
          icon: icon(FontIcon),
          submenu: [
            { label: 'UPPERCASE', onSelect: (e) => runCmd(e, 'changeCase', 'upper') },
            { label: 'lowercase', onSelect: (e) => runCmd(e, 'changeCase', 'lower') },
            { label: 'Title Case', onSelect: (e) => runCmd(e, 'changeCase', 'title') },
            { label: 'Sentence case', onSelect: (e) => runCmd(e, 'changeCase', 'sentence') },
            { label: 'tOGGLE cASE', onSelect: (e) => runCmd(e, 'changeCase', 'toggle') },
          ],
        },
        { label: 'Remove Format', icon: icon(ClearFormatIcon), onSelect: (e) => runCmd(e, 'clearFormatting') },
      ],
    },
    {
      label: 'Tools',
      items: [
        { label: 'Spellcheck', checked: actions.spellcheckOn, disabled: !actions.toggleSpellcheck, onSelect: () => actions.toggleSpellcheck?.() },
        { separator: true },
        { label: 'Source code', icon: icon(CodeIcon), disabled: !actions.sourceCode, onSelect: () => actions.sourceCode?.() },
        { label: 'Word count', disabled: !actions.wordCount, onSelect: () => actions.wordCount?.() },
        { separator: true },
        { label: 'Typography (smart quotes)', checked: true, disabled: true },
      ],
    },
    {
      label: 'Table',
      items: [
        { label: 'Insert table…', icon: icon(TableIcon), onSelect: promptTable },
        { separator: true },
        { label: 'Add row before', onSelect: (e) => runCmd(e, 'addRowBefore') },
        { label: 'Add row after', onSelect: (e) => runCmd(e, 'addRowAfter') },
        { label: 'Add column before', onSelect: (e) => runCmd(e, 'addColumnBefore') },
        { label: 'Add column after', onSelect: (e) => runCmd(e, 'addColumnAfter') },
        { separator: true },
        { label: 'Merge cells', onSelect: (e) => runCmd(e, 'mergeCells') },
        { label: 'Split cell', onSelect: (e) => runCmd(e, 'splitCell') },
        { separator: true },
        { label: 'Toggle header row', onSelect: (e) => runCmd(e, 'toggleHeaderRow') },
        { label: 'Toggle header column', onSelect: (e) => runCmd(e, 'toggleHeaderColumn') },
        { separator: true },
        { label: 'Delete row', onSelect: (e) => runCmd(e, 'deleteRow') },
        { label: 'Delete column', onSelect: (e) => runCmd(e, 'deleteColumn') },
        { label: 'Delete table', onSelect: (e) => runCmd(e, 'deleteTable') },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'Keyboard shortcuts', disabled: !actions.shortcuts, onSelect: () => actions.shortcuts?.() },
        { label: 'About Rich Editor', onSelect: () => window.alert('Rich Editor v0.1.0') },
      ],
    },
  ]
}

function toggleFullscreen() {
  const root = document.documentElement
  if (!document.fullscreenElement) root.requestFullscreen().catch(() => {})
  else document.exitFullscreen().catch(() => {})
}
