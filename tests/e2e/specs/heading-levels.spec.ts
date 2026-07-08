import { expect, test } from '@playwright/test'
import { MOD, focusEditor } from './_helpers'

test.describe('heading levels 4–6', () => {
  test('H4 via Mod+Alt+4', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+Alt+4`)
    await page.keyboard.type('Heading Four')
    await expect(page.locator('.editor h4')).toHaveText('Heading Four')
  })

  test('H5 via Mod+Alt+5', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+Alt+5`)
    await page.keyboard.type('Heading Five')
    await expect(page.locator('.editor h5')).toHaveText('Heading Five')
  })

  test('H6 via Mod+Alt+6', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+Alt+6`)
    await page.keyboard.type('Heading Six')
    await expect(page.locator('.editor h6')).toHaveText('Heading Six')
  })

  test('H4 via block-type dropdown', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('dropdown four')
    await page.locator('.tb-blocktype-trigger').click()
    await page.locator('.tb-pop-blocktype .tb-menu-item:has-text("Heading 4")').click()
    await expect(page.locator('.editor h4')).toHaveText('dropdown four')
  })
})
