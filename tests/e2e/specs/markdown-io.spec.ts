import { expect, test } from '@playwright/test'
import { clickMenuItem, focusEditor, openMenu } from './_helpers'

test.describe('markdown import/export', () => {
  test('File → Export to Markdown downloads GFM content', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('# Title')
    await page.keyboard.press('Enter')
    await page.keyboard.type('plain text')
    await openMenu(page, 'File')
    const downloadPromise = page.waitForEvent('download')
    await clickMenuItem(page, 'Export to Markdown…')
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('document.md')
    const stream = await download.createReadStream()
    const chunks: Buffer[] = []
    for await (const chunk of stream) chunks.push(chunk as Buffer)
    const content = Buffer.concat(chunks).toString('utf-8')
    expect(content).toContain('# Title')
    expect(content).toContain('plain text')
  })

  test('SourceCode markdown tab round-trips content', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('# Heading here')
    await openMenu(page, 'Tools')
    await clickMenuItem(page, 'Source code')
    await page.locator('.re-source-tabs button', { hasText: 'Markdown' }).click()
    const textarea = page.locator('.re-source-textarea')
    await expect(textarea).toHaveValue(/# Heading here/)
    await textarea.fill('## Replaced\n\nWith **markdown** body')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.locator('.editor h2').first()).toHaveText('Replaced')
    await expect(page.locator('.editor strong').first()).toHaveText('markdown')
  })
})
