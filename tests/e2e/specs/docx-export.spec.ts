import { expect, test } from '@playwright/test'
import { focusEditor } from './_helpers'

test.describe('docx export', () => {
  test('File > Export to Word downloads .docx', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('Word export test')
    const downloadPromise = page.waitForEvent('download')
    await page.locator('.menubar-trigger:has-text("File")').click()
    await page.locator('.menu-item:has-text("Export to Word")').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.docx$/)
  })

  test('downloaded file has non-zero size', async ({ page }, testInfo) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('Content to export')
    const downloadPromise = page.waitForEvent('download')
    await page.locator('.menubar-trigger:has-text("File")').click()
    await page.locator('.menu-item:has-text("Export to Word")').click()
    const download = await downloadPromise
    const savePath = testInfo.outputPath('out.docx')
    await download.saveAs(savePath)
    const fs = await import('node:fs/promises')
    const stat = await fs.stat(savePath)
    expect(stat.size).toBeGreaterThan(1000)
  })

  test('downloaded file starts with ZIP signature', async ({ page }, testInfo) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('Quick test')
    const downloadPromise = page.waitForEvent('download')
    await page.locator('.menubar-trigger:has-text("File")').click()
    await page.locator('.menu-item:has-text("Export to Word")').click()
    const download = await downloadPromise
    const savePath = testInfo.outputPath('out.docx')
    await download.saveAs(savePath)
    const fs = await import('node:fs/promises')
    const buf = await fs.readFile(savePath)
    expect(buf[0]).toBe(0x50) // P
    expect(buf[1]).toBe(0x4b) // K
    expect(buf[2]).toBe(0x03)
    expect(buf[3]).toBe(0x04)
  })
})
