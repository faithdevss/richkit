import type MarkdownIt from 'markdown-it'
import type { StateBlock, StateInline, Token } from 'markdown-it'

// `$…$` for inline math and `$$…$$` for display math, matching how
// extension-math's nodes serialize. The inline rule follows Pandoc: the
// opening `$` must be followed by a non-space, the closing one preceded by a
// non-space and not followed by a digit, so "$5 and $10" stays text.

const DOLLAR = 0x24

function isSpace(code: number): boolean {
  return code === 0x20 || code === 0x09 || code === 0x0a
}

function mathInline(state: StateInline, silent: boolean): boolean {
  const { src, pos, posMax } = state
  if (src.charCodeAt(pos) !== DOLLAR) return false
  const first = src.charCodeAt(pos + 1)
  if (pos + 1 >= posMax || first === DOLLAR || isSpace(first)) return false

  let end = pos + 1
  for (;;) {
    end = src.indexOf('$', end)
    if (end === -1 || end >= posMax) return false
    // `\$` is a literal dollar inside LaTeX, not the closing delimiter
    if (src.charCodeAt(end - 1) === 0x5c) {
      end++
      continue
    }
    break
  }
  if (isSpace(src.charCodeAt(end - 1))) return false
  const after = src.charCodeAt(end + 1)
  if (after >= 0x30 && after <= 0x39) return false

  if (!silent) {
    const token = state.push('math_inline', '', 0)
    token.content = src.slice(pos + 1, end)
    token.markup = '$'
  }
  state.pos = end + 1
  return true
}

function mathBlock(
  state: StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean,
): boolean {
  if (state.sCount[startLine]! - state.blkIndent >= 4) return false
  const start = state.bMarks[startLine]! + state.tShift[startLine]!
  const max = state.eMarks[startLine]!
  if (state.src.slice(start, start + 2) !== '$$') return false

  const opening = state.src.slice(start + 2, max).trim()
  let content: string
  let last = startLine

  if (opening.length >= 2 && opening.endsWith('$$')) {
    content = opening.slice(0, -2)
  } else {
    const lines = opening ? [opening] : []
    let closed = false
    for (last = startLine + 1; last < endLine; last++) {
      const text = state.src.slice(state.bMarks[last]! + state.tShift[last]!, state.eMarks[last]!)
      const trimmed = text.trim()
      if (trimmed.endsWith('$$')) {
        const rest = trimmed.slice(0, -2)
        if (rest) lines.push(rest)
        closed = true
        break
      }
      lines.push(text)
    }
    if (!closed) return false
    content = lines.join('\n')
  }

  if (silent) return true
  state.line = last + 1
  const token = state.push('math_block', '', 0)
  token.block = true
  token.content = content.trim()
  token.markup = '$$'
  token.map = [startLine, state.line]
  return true
}

export function mathPlugin(md: InstanceType<typeof MarkdownIt>): void {
  const esc = md.utils.escapeHtml
  md.inline.ruler.after('escape', 'math_inline', mathInline)
  md.block.ruler.before('fence', 'math_block', mathBlock, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  })
  md.renderer.rules['math_inline'] = (tokens: Token[], i: number) => {
    // The delimiters stay in the text: a schema with math reads the formula
    // from the attribute, and one without keeps `$…$` as written instead of
    // silently dropping the dollars.
    const latex = esc(tokens[i]!.content)
    return `<span data-math="${latex}">$${latex}$</span>`
  }
  md.renderer.rules['math_block'] = (tokens: Token[], i: number) => {
    const latex = esc(tokens[i]!.content)
    return `<div data-math-block="${latex}">$$${latex}$$</div>\n`
  }
}
