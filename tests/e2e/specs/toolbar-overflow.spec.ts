import { expect, test } from '@playwright/test'
import { clickToolbar, focusEditor, getHtml } from './_helpers'

test.describe('toolbar overflow', () => {
  test('a narrow viewport keeps every row on one line', async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 800 })
    await page.goto('/')
    await focusEditor(page)

    const rows = page.locator('.toolbar .tb-row')
    await expect(rows).toHaveCount(2)
    for (const row of await rows.all()) {
      const box = await row.evaluate((el) => ({ w: el.clientWidth, sw: el.scrollWidth }))
      expect(box.sw).toBeLessThanOrEqual(box.w)
      await expect(row.locator('.tb-more-btn')).toHaveCount(1)
    }
  })

  test('a collapsed button still runs its command from the more popover', async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 800 })
    await page.goto('/')
    await focusEditor(page)

    // "Bullet list" is one of the trailing groups, so it only exists in the popover
    await expect(page.locator('.toolbar .tb-btn[title="Bullet list"]')).toHaveCount(0)
    await clickToolbar(page, 'title="Bullet list"')
    await page.keyboard.type('one')
    await expect(page.locator('.editor ul li')).toHaveCount(1)
    expect(await getHtml(page)).toContain('<ul')
  })

  test('a wide viewport leaves the first row uncollapsed', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await focusEditor(page)

    const firstRow = page.locator('.toolbar .tb-row').first()
    await expect(firstRow.locator('.tb-more-btn')).toHaveCount(0)
    await expect(firstRow.locator('.tb-btn[title="Fullscreen"]')).toBeVisible()
  })

  test('widening the window brings collapsed buttons back into the row', async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 800 })
    await page.goto('/')
    await focusEditor(page)
    await expect(page.locator('.toolbar .tb-btn[title="Fullscreen"]')).toHaveCount(0)

    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(page.locator('.toolbar .tb-btn[title="Fullscreen"]')).toBeVisible()
  })
})
