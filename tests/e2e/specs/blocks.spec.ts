import { expect, test } from '@playwright/test'
import { MOD, clickToolbar, focusEditor } from './_helpers'

test.describe('block types', () => {
  test('H1 via Mod+Alt+1', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+Alt+Digit1`)
    await page.keyboard.type('Heading One')
    await expect(page.locator('.editor h1')).toHaveText('Heading One')
  })

  test('H2 via Mod+Alt+2', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+Alt+Digit2`)
    await page.keyboard.type('Heading Two')
    await expect(page.locator('.editor h2')).toHaveText('Heading Two')
  })

  test('H3 via Mod+Alt+3', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+Alt+Digit3`)
    await page.keyboard.type('Three')
    await expect(page.locator('.editor h3')).toHaveText('Three')
  })

  test('Heading via block-type dropdown', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.locator('.tb-blocktype-trigger').click()
    await page.locator('.tb-pop-blocktype .tb-menu-item:has-text("Heading 2")').click()
    await page.keyboard.type('Via dropdown')
    await expect(page.locator('.editor h2')).toHaveText('Via dropdown')
  })

  test('Back to paragraph converts H1', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+Alt+Digit1`)
    await page.keyboard.type('was H1')
    await page.locator('.tb-blocktype-trigger').click()
    await page.locator('.tb-pop-blocktype .tb-menu-item:has-text("Paragraph")').click()
    await expect(page.locator('.editor h1')).toHaveCount(0)
    await expect(page.locator('.editor p')).toContainText('was H1')
  })

  test('Blockquote toolbar', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Blockquote"')
    await page.keyboard.type('quoted')
    await expect(page.locator('.editor blockquote')).toContainText('quoted')
  })

  test('Code block toolbar', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Code block"')
    await page.keyboard.type('const x = 1')
    await expect(page.locator('.editor pre code')).toHaveText('const x = 1')
  })

  test('Horizontal rule via toolbar', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Horizontal line"')
    await expect(page.locator('.editor hr')).toBeVisible()
  })

  test('Page break via Insert menu', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.locator('.menubar-trigger:has-text("Insert")').click()
    await page.locator('.menu-item:has-text("Page break")').click()
    await expect(page.locator('.editor .page-break')).toBeAttached()
  })
})
