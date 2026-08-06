import type { Editor } from '@richkit/core'

export interface PrintOptions {
  title?: string
  extraCss?: string
}

const PRINT_CSS = `
@page { margin: 1in; }
body {
  font-family: ui-sans-serif, system-ui, sans-serif;
  line-height: 1.6;
  color: #1a1a1a;
  max-width: 7in;
  margin: 0 auto;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
img { max-width: 100%; }
table { border-collapse: collapse; width: auto; }
th, td { border: 1px solid #999; padding: 6px 10px; }
th { background: #f0f0f0; }
.page-break { page-break-after: always; break-after: page; height: 0; }
h1, h2, h3 { margin: 0.8em 0 0.4em; }
blockquote { border-left: 3px solid #ccc; margin-left: 0; padding-left: 1em; color: #444; }
pre {
  background: #f6f6f6;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px 12px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
}
code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em; }
mark { background: #fff2a8; }
sub, sup { font-size: 0.75em; }
ul[data-type='task-list'] { list-style: none; padding-left: 1.2em; }
ul[data-type='task-list'] li::before { content: '☐ '; }
ul[data-type='task-list'] li[data-checked='true']::before { content: '☑ '; }
div[data-embed] {
  border: 1px dashed #999;
  padding: 12px;
  aspect-ratio: auto !important;
  height: auto !important;
}
div[data-embed] iframe, div[data-embed] video { display: none; }
div[data-embed]::after { content: 'Embedded media: ' attr(data-src); font-size: 0.85em; color: #555; }
a { color: #1155cc; text-decoration: underline; }
`

export function printEditor(editor: Editor, opts: PrintOptions = {}): void {
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.setAttribute('aria-hidden', 'true')
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) {
    iframe.remove()
    return
  }

  const title = opts.title ?? 'Document'
  doc.open()
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${PRINT_CSS}${opts.extraCss ?? ''}</style></head><body>${editor.getHTML()}</body></html>`,
  )
  doc.close()

  const cleanup = () => {
    // delay removal so the print dialog finishes reading the frame
    setTimeout(() => iframe.remove(), 100)
  }
  win.addEventListener('afterprint', cleanup, { once: true })
  // fallback: some browsers never fire afterprint on iframes
  setTimeout(() => iframe.parentNode && iframe.remove(), 60_000)

  // give the frame a tick to layout images/fonts before printing
  setTimeout(() => {
    try {
      win.focus()
      win.print()
    } catch {
      cleanup()
    }
  }, 150)
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  )
}
