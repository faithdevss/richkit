import { describe, expect, it } from 'vitest'
import { isSafeUrl, safeUrl } from '../html/url'

describe('isSafeUrl', () => {
  it.each([
    'https://example.com',
    'http://example.com/a:b',
    'mailto:a@example.com',
    'tel:+15550100',
    '/relative/path',
    './file.png',
    '../up',
    '#section',
    '?q=1',
    'example.com/page',
  ])('accepts %s', (url) => {
    expect(isSafeUrl(url)).toBe(true)
  })

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    '\u0000javascript:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html,<script>alert(1)</script>',
    'data:image/png;base64,AAAA',
    'blob:https://example.com/id',
    'file:///etc/passwd',
    '',
    '   ',
  ])('rejects %j for links', (url) => {
    expect(isSafeUrl(url)).toBe(false)
  })

  it('rejects non-strings', () => {
    expect(isSafeUrl(null)).toBe(false)
    expect(isSafeUrl(undefined)).toBe(false)
    expect(isSafeUrl(42)).toBe(false)
  })

  it('lets media sources use data: and blob:, minus script-capable types', () => {
    const media = { media: true }
    expect(isSafeUrl('data:image/png;base64,AAAA', media)).toBe(true)
    expect(isSafeUrl('data:video/mp4;base64,AAAA', media)).toBe(true)
    expect(isSafeUrl('data:application/pdf;base64,AAAA', media)).toBe(true)
    expect(isSafeUrl('blob:https://example.com/id', media)).toBe(true)
    expect(isSafeUrl('data:image/svg+xml,<svg onload=alert(1)>', media)).toBe(false)
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>', media)).toBe(false)
    expect(isSafeUrl('data:application/xhtml+xml,x', media)).toBe(false)
    expect(isSafeUrl('data:text/javascript,alert(1)', media)).toBe(false)
    expect(isSafeUrl('javascript:alert(1)', media)).toBe(false)
  })
})

describe('safeUrl', () => {
  it('returns the trimmed url or null', () => {
    expect(safeUrl('  https://example.com  ')).toBe('https://example.com')
    expect(safeUrl('javascript:alert(1)')).toBeNull()
  })
})
