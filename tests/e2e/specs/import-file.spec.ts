import { expect, test, type Page } from '@playwright/test'
import { focusEditor } from './_helpers'

async function importVia(page: Page, filePath: string) {
  const chooserPromise = page.waitForEvent('filechooser')
  await page.locator('.menubar-trigger:has-text("File")').click()
  await page.locator('.menu-item:has-text("Import file")').click()
  const chooser = await chooserPromise
  await chooser.setFiles(filePath)
}

test.describe('file import', () => {
  test('imports markdown file as rich content', async ({ page }, testInfo) => {
    await page.goto('/')
    await focusEditor(page)
    const fs = await import('node:fs/promises')
    const mdPath = testInfo.outputPath('doc.md')
    await fs.writeFile(mdPath, '# Imported Heading\n\nSome **bold** body.\n')
    await importVia(page, mdPath)
    await expect(page.locator('.editor h1')).toHaveText('Imported Heading')
    await expect(page.locator('.editor strong')).toHaveText('bold')
  })

  test('imports html file', async ({ page }, testInfo) => {
    await page.goto('/')
    await focusEditor(page)
    const fs = await import('node:fs/promises')
    const htmlPath = testInfo.outputPath('doc.html')
    await fs.writeFile(htmlPath, '<h2>From HTML</h2><p>paragraph body</p>')
    await importVia(page, htmlPath)
    await expect(page.locator('.editor h2')).toHaveText('From HTML')
    await expect(page.locator('.editor .ProseMirror')).toContainText('paragraph body')
  })

  test('imports plain text file', async ({ page }, testInfo) => {
    await page.goto('/')
    await focusEditor(page)
    const fs = await import('node:fs/promises')
    const txtPath = testInfo.outputPath('doc.txt')
    await fs.writeFile(txtPath, 'plain text payload')
    await importVia(page, txtPath)
    await expect(page.locator('.editor .ProseMirror')).toContainText('plain text payload')
  })

  test('docx export → import round-trips content', async ({ page }, testInfo) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('Round trip docx body')

    const downloadPromise = page.waitForEvent('download')
    await page.locator('.menubar-trigger:has-text("File")').click()
    await page.locator('.menu-item:has-text("Export to Word")').click()
    const download = await downloadPromise
    const docxPath = testInfo.outputPath('roundtrip.docx')
    await download.saveAs(docxPath)

    await focusEditor(page)
    await expect(page.locator('.editor .ProseMirror')).not.toContainText('Round trip docx body')

    await importVia(page, docxPath)
    await expect(page.locator('.editor .ProseMirror')).toContainText('Round trip docx body')
  })
})
