import { expect, test, type Page } from '@playwright/test'
import * as os from 'node:os'

const MOD = os.platform() === 'darwin' ? 'Meta' : 'Control'

async function clearAndFocus(page: Page) {
  const editor = page.locator('.editor .ProseMirror')
  await editor.click()
  await page.keyboard.press(`${MOD}+a`)
  await page.keyboard.press('Delete')
  return editor
}

test.describe('playground smoke', () => {
  test('loads, types, and persists text', async ({ page }) => {
    await page.goto('/')
    const editor = await clearAndFocus(page)
    await page.keyboard.type('hello e2e')
    await expect(editor).toContainText('hello e2e')
    await expect(page.locator('.output pre')).toContainText('hello e2e')
  })

  test('Mod+B toggles bold', async ({ page }) => {
    await page.goto('/')
    await clearAndFocus(page)
    await page.keyboard.press(`${MOD}+b`)
    await page.keyboard.type('bolded')
    await expect(page.locator('.editor strong').first()).toHaveText('bolded')
  })

  test('markdown shortcut ## promotes to heading', async ({ page }) => {
    await page.goto('/')
    await clearAndFocus(page)
    await page.keyboard.type('## ')
    await page.keyboard.type('Heading from markdown')
    await expect(page.locator('.editor h2').first()).toHaveText('Heading from markdown')
  })

  test('markdown shortcut - starts bullet list', async ({ page }) => {
    await page.goto('/')
    await clearAndFocus(page)
    await page.keyboard.type('- ')
    await page.keyboard.type('first')
    await page.keyboard.press('Enter')
    await page.keyboard.type('second')
    const items = page.locator('.editor ul li')
    await expect(items).toHaveCount(2)
  })

  test('toolbar bold button toggles mark', async ({ page }) => {
    await page.goto('/')
    await clearAndFocus(page)
    await page.locator('.toolbar .tb-btn[title^="Bold"]').first().click()
    await page.keyboard.type('via-toolbar')
    await expect(page.locator('.editor strong').first()).toHaveText('via-toolbar')
  })

  test('inline code shortcut wraps text', async ({ page }) => {
    await page.goto('/')
    await clearAndFocus(page)
    await page.keyboard.type('`snippet` ')
    await expect(page.locator('.editor code').first()).toHaveText('snippet')
  })
})
