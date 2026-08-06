import { cleanPastedHTML } from '@richkit/extension-paste-handler'
import { describe, expect, it } from 'vitest'

const OPTS = { cleanWord: true, cleanGoogleDocs: true }

const WORD_FIXTURE = `
<html xmlns:o="urn:schemas-microsoft-com:office:office">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Normal</w:View></w:WordDocument></xml><![endif]-->
<style>p.MsoNormal { margin: 0in; }</style>
<p class="MsoNormal" style="mso-margin-top-alt:auto;margin-bottom:12pt;color:#333">Hello <b>Word</b> text<o:p></o:p></p>
`

const GDOCS_FIXTURE = `<b style="font-weight:normal;" id="docs-internal-guid-abc123"><p dir="ltr"><span style="font-size:11pt;font-variant:normal;vertical-align:baseline;">Plain text</span><span style="font-weight:700;">bold text</span></p></b>`

describe('cleanPastedHTML', () => {
  it('strips Word conditional comments, xml/style blocks, o:p tags', () => {
    const out = cleanPastedHTML(WORD_FIXTURE, OPTS)
    expect(out).not.toContain('mso-')
    expect(out).not.toContain('<o:p>')
    expect(out).not.toContain('MsoNormal')
    expect(out).not.toContain('WordDocument')
    expect(out).not.toContain('<style')
    expect(out).toContain('Hello')
    expect(out).toContain('<b>Word</b>')
    // non-mso inline styles survive
    expect(out).toContain('margin-bottom')
  })

  it('unwraps Google Docs guid wrapper and noise spans', () => {
    const out = cleanPastedHTML(GDOCS_FIXTURE, OPTS)
    expect(out).not.toContain('docs-internal-guid')
    expect(out).not.toContain('font-variant')
    expect(out).toContain('Plain text')
    // meaningful bold-weight span preserved for mark parsing
    expect(out).toContain('font-weight:700')
  })

  it('leaves ordinary HTML untouched', () => {
    const html = '<p>Hello <strong>there</strong></p>'
    expect(cleanPastedHTML(html, OPTS)).toBe(html)
  })

  it('respects disabled options', () => {
    const out = cleanPastedHTML(WORD_FIXTURE, { cleanWord: false, cleanGoogleDocs: true })
    expect(out).toContain('MsoNormal')
  })
})
