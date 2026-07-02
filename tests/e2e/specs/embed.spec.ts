import { expect, test } from '@playwright/test'
import { clickMenuItem, focusEditor, openMenu } from './_helpers'

test.describe('embeds', () => {
  test('Insert → Media embeds a YouTube URL as nocookie iframe', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await openMenu(page, 'Insert')
    await clickMenuItem(page, 'Media…')
    const dlg = page.locator('.re-dialog-prompt')
    await expect(dlg).toBeVisible()
    await dlg.locator('input').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    await dlg.getByRole('button', { name: 'Insert' }).click()
    const iframe = page.locator('.editor iframe').first()
    await expect(iframe).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/)
  })

  test('slash menu embed inserts video node', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('/embed')
    await page.keyboard.press('Enter')
    const dlg = page.locator('.re-dialog-prompt')
    await expect(dlg).toBeVisible()
    await dlg.locator('input').fill('https://cdn.example.com/clip.mp4')
    await dlg.getByRole('button', { name: 'Insert' }).click()
    await expect(page.locator('.editor video')).toHaveCount(1)
  })
})
