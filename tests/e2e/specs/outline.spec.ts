import { expect, test } from '@playwright/test'
import { clickMenuItem, focusEditor, openMenu } from './_helpers'

test.describe('outline sidebar', () => {
  test('lists headings and scrolls on click', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.evaluate(() => {
      const editor = (window as unknown as { __editor: { setContent: (s: string) => void } })
        .__editor
      const filler = `<p>${'lorem ipsum '.repeat(60)}</p>`.repeat(10)
      editor.setContent(`<h1>Top</h1>${filler}<h2>Middle</h2>${filler}<h3>Bottom</h3>`)
    })
    await openMenu(page, 'View')
    await clickMenuItem(page, 'Outline panel')
    const sidebar = page.locator('.re-outline-sidebar')
    await expect(sidebar).toBeVisible()
    await expect(sidebar.locator('.re-outline-item')).toHaveCount(3)
    await expect(sidebar.locator('.re-outline-item').nth(1)).toHaveText('Middle')

    await sidebar.locator('.re-outline-item', { hasText: 'Bottom' }).click()
    await expect(page.locator('.editor h3', { hasText: 'Bottom' })).toBeInViewport()
  })

  test('Insert → Table of contents opens the outline panel', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await openMenu(page, 'Insert')
    await clickMenuItem(page, 'Table of contents')
    await expect(page.locator('.re-outline-sidebar')).toBeVisible()
  })
})
