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
})
