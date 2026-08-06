import { expect, test } from '@playwright/test'
import { focusEditor } from './_helpers'

test.describe('notifications (toast + dialog)', () => {
  test('toast appears when "Add comment" clicked with empty selection', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('Some text')
    await page.keyboard.press('End')

    await page.locator('.menubar-trigger:has-text("Insert")').click()
    await page.locator('.menu-item:has-text("Comment")').click()

    const toast = page.locator('.re-toast-warn')
    await expect(toast).toBeVisible()
    await expect(toast).toContainText('Select some text')
  })

  test('toast auto-dismisses after timeout', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('x')
    await page.keyboard.press('End')

    await page.locator('.menubar-trigger:has-text("Insert")').click()
    await page.locator('.menu-item:has-text("Comment")').click()
    await expect(page.locator('.re-toast')).toBeVisible()

    await expect(page.locator('.re-toast')).toHaveCount(0, { timeout: 6000 })
  })

  test('toast dismissed via × button', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('x')
    await page.keyboard.press('End')

    await page.locator('.menubar-trigger:has-text("Insert")').click()
    await page.locator('.menu-item:has-text("Comment")').click()
    await expect(page.locator('.re-toast')).toBeVisible()

    await page.locator('.re-toast .re-toast-close').click()
    await expect(page.locator('.re-toast')).toHaveCount(0)
  })

  test('alert dialog shows on Help > About and closes on OK', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.locator('.menubar-trigger:has-text("Help")').click()
    await page.locator('.menu-item:has-text("About RichKit")').click()

    const dlg = page.locator('.re-dialog-alert')
    await expect(dlg).toBeVisible()
    await expect(dlg).toContainText('RichKit')
    await dlg.locator('button:has-text("OK")').click()
    await expect(page.locator('.re-dialog-alert')).toHaveCount(0)
  })

  test('prompt dialog returns value on OK', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('hello')
    await page.keyboard.press(`Meta+a`)

    await page.locator('.menubar-trigger:has-text("Insert")').click()
    await page.locator('.menu-item:has-text("Link")').click()

    const dlg = page.locator('.re-dialog-prompt')
    await expect(dlg).toBeVisible()
    await dlg.locator('input').fill('https://example.com')
    await dlg.locator('button:has-text("Apply")').click()

    await expect(page.locator('.editor a[href="https://example.com"]')).toBeVisible()
  })

  test('prompt dialog returns null on Cancel', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)

    await page.locator('.menubar-trigger:has-text("Insert")').click()
    await page.locator('.menu-item:has-text("Image")').click()

    const dlg = page.locator('.re-dialog-prompt')
    await expect(dlg).toBeVisible()
    await dlg.locator('button:has-text("Cancel")').click()
    await expect(page.locator('.re-dialog-prompt')).toHaveCount(0)
    await expect(page.locator('.editor img')).toHaveCount(0)
  })

  test('Escape closes prompt dialog', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)

    await page.locator('.menubar-trigger:has-text("Insert")').click()
    await page.locator('.menu-item:has-text("Image")').click()
    await expect(page.locator('.re-dialog-prompt')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('.re-dialog-prompt')).toHaveCount(0)
  })

  test('confirm dialog destructive button has danger style', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('hello world')
    await page.keyboard.press('Home')
    await page.keyboard.down('Shift')
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight')
    await page.keyboard.up('Shift')

    await page.locator('.bubble-menu button[title="Add comment"]').click()
    const composer = page.locator('.re-comment-composer')
    await expect(composer).toBeVisible()
    await composer.locator('textarea').fill('todelete')
    await composer.locator('button:has-text("Comment")').click()

    await page.locator('.re-comment-thread button:has-text("Delete")').click()
    const dlg = page.locator('.re-dialog-confirm')
    await expect(dlg).toBeVisible()
    await expect(dlg.locator('.tb-btn-danger')).toBeVisible()
  })
})
