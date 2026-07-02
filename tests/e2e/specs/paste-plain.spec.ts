import { expect, test } from '@playwright/test'
import { focusEditor, getHtml } from './_helpers'

function dispatchPaste(page: import('@playwright/test').Page, html: string, text: string) {
  return page.evaluate(
    ([h, t]) => {
      const target = document.querySelector('.editor .ProseMirror') as HTMLElement
      const dt = new DataTransfer()
      dt.setData('text/html', h ?? '')
      dt.setData('text/plain', t ?? '')
      const event = new ClipboardEvent('paste', {
        clipboardData: dt,
        bubbles: true,
        cancelable: true,
      })
      target.dispatchEvent(event)
    },
    [html, text],
  )
}

test.describe('paste handling', () => {
  test('cleans Word markup on paste', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await dispatchPaste(
      page,
      '<p class="MsoNormal" style="mso-margin-top-alt:auto">Word <b>content</b><o:p></o:p></p>',
      'Word content',
    )
    const html = await getHtml(page)
    expect(html).toContain('Word')
    expect(html).toContain('content')
    expect(html).not.toContain('MsoNormal')
    expect(html).not.toContain('mso-')
  })

  test('unwraps Google Docs guid wrapper on paste', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await dispatchPaste(
      page,
      '<b style="font-weight:normal" id="docs-internal-guid-xyz"><p><span style="font-weight:700">gdocs bold</span></p></b>',
      'gdocs bold',
    )
    const html = await getHtml(page)
    expect(html).toContain('gdocs bold')
    expect(html).not.toContain('docs-internal-guid')
    expect(html).toContain('<strong>')
  })
})
