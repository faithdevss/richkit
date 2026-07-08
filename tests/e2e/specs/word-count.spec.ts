import { expect, test } from '@playwright/test'
import { focusEditor } from './_helpers'

test.describe('word count status bar', () => {
  test('updates live while typing', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    const bar = page.locator('[data-testid="status-bar"]')
    await expect(bar).toContainText('0 words')
    await page.keyboard.type('one two three')
    await expect(bar).toContainText('3 words')
    await expect(bar).toContainText('13 characters')
  })

  test('Tools > Word count opens statistics dialog', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('alpha beta gamma delta')
    await page.locator('.menubar-trigger:has-text("Tools")').click()
    await page.locator('.menu-item:has-text("Word count")').click()
    const dlg = page.locator('.re-dialog-alert')
    await expect(dlg).toBeVisible()
    await expect(dlg).toContainText('Document statistics')
    await expect(dlg).toContainText('Words: 4')
    await dlg.locator('button:has-text("OK")').click()
    await expect(dlg).toHaveCount(0)
  })
})
