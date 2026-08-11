export interface CleanOptions {
  cleanWord: boolean
  cleanGoogleDocs: boolean
}

const WORD_COMMENT_RE = /<!--\[if [^]*?<!\[endif\]-->/gi
const XML_BLOCK_RE = /<(xml|style)[^>]*>[^]*?<\/\1>/gi
const HTML_COMMENT_RE = /<!--[^]*?-->/g

function isWordHtml(html: string): boolean {
  return /class="?Mso|mso-|urn:schemas-microsoft-com|<o:p>/i.test(html)
}

function isGoogleDocsHtml(html: string): boolean {
  return /docs-internal-guid/i.test(html)
}

function stripMsoStyles(el: HTMLElement): void {
  const style = el.getAttribute('style')
  if (!style) return
  const kept = style
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s && !/^mso-/i.test(s) && !/^(tab-stops|text-underline)/i.test(s))
    .join('; ')
  if (kept) el.setAttribute('style', kept)
  else el.removeAttribute('style')
}

function cleanWordTree(root: HTMLElement): void {
  // Office namespaced tags (<o:p>, <w:sdt>, …) come through as unknown elements
  for (const el of Array.from(root.querySelectorAll('*'))) {
    const tag = el.tagName.toLowerCase()
    if (tag.includes(':') || tag.startsWith('o:') || tag.startsWith('w:')) {
      el.replaceWith(...Array.from(el.childNodes))
      continue
    }
    const html = el as HTMLElement
    const cls = html.getAttribute('class')
    if (cls && /(^|\s)Mso/i.test(cls)) html.removeAttribute('class')
    stripMsoStyles(html)
    html.removeAttribute('lang')
  }
}

const NOISE_DECL_RE =
  /^(font-variant|vertical-align\s*:\s*baseline|white-space|orphans|widows|text-decoration\s*:\s*none|font-weight\s*:\s*(normal|400)|font-style\s*:\s*normal|background-color\s*:\s*transparent)/i

function stripNoiseDecls(el: HTMLElement): void {
  const style = el.getAttribute('style')
  if (!style) return
  const kept = style
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !NOISE_DECL_RE.test(s))
    .join('; ')
  if (kept) el.setAttribute('style', kept)
  else el.removeAttribute('style')
}

function isNoiseSpan(el: HTMLElement): boolean {
  if (el.tagName !== 'SPAN') return false
  return el.attributes.length === 0
}

function cleanGoogleDocsTree(root: HTMLElement): void {
  for (const b of Array.from(root.querySelectorAll('b[id^="docs-internal-guid"]'))) {
    b.replaceWith(...Array.from(b.childNodes))
  }
  // strip style noise from formatting spans, then unwrap spans left with no attrs
  for (const span of Array.from(root.querySelectorAll('span'))) {
    stripNoiseDecls(span as HTMLElement)
  }
  let changed = true
  while (changed) {
    changed = false
    for (const span of Array.from(root.querySelectorAll('span'))) {
      if (isNoiseSpan(span as HTMLElement)) {
        span.replaceWith(...Array.from(span.childNodes))
        changed = true
      }
    }
  }
}

export function cleanPastedHTML(html: string, opts: CleanOptions): string {
  const word = opts.cleanWord && isWordHtml(html)
  const gdocs = opts.cleanGoogleDocs && isGoogleDocsHtml(html)
  if (!word && !gdocs) return html

  let input = html
  if (word) {
    input = input
      .replace(WORD_COMMENT_RE, '')
      .replace(XML_BLOCK_RE, '')
      .replace(HTML_COMMENT_RE, '')
  }

  const doc = new DOMParser().parseFromString(input, 'text/html')
  const body = doc.body
  if (word) cleanWordTree(body)
  if (gdocs) cleanGoogleDocsTree(body)
  return body.innerHTML
}
