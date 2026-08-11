import { expect, test } from '@playwright/test'
import { focusEditor, MOD } from './_helpers'

test.describe('inline marks', () => {
  test('bold via shortcut', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+b`)
    await page.keyboard.type('bolded')
    await expect(page.locator('.editor strong').first()).toHaveText('bolded')
  })

  test('italic via shortcut', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+i`)
    await page.keyboard.type('italics')
    await expect(page.locator('.editor em').first()).toHaveText('italics')
  })

  test('underline via shortcut', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+u`)
    await page.keyboard.type('under')
    await expect(page.locator('.editor u').first()).toHaveText('under')
  })

  test('inline code via shortcut', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+e`)
    await page.keyboard.type('inline')
    await expect(page.locator('.editor code').first()).toHaveText('inline')
  })

  test('bold toolbar button toggles', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.locator('.toolbar .tb-btn[title^="Bold"]').first().click()
    await page.keyboard.type('viaToolbar')
    await expect(page.locator('.editor strong').first()).toHaveText('viaToolbar')
  })

  test('italic toolbar button toggles', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.locator('.toolbar .tb-btn[title^="Italic"]').first().click()
    await page.keyboard.type('italicTb')
    await expect(page.locator('.editor em').first()).toHaveText('italicTb')
  })

  test('strikethrough toolbar', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.locator('.toolbar .tb-btn[title^="Strikethrough"]').first().click()
    await page.keyboard.type('struck')
    await expect(page.locator('.editor s').first()).toHaveText('struck')
  })

  test('strikethrough via Mod+Shift+S', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+Shift+s`)
    await page.keyboard.type('struckKb')
    await expect(page.locator('.editor s').first()).toHaveText('struckKb')
  })

  test('inline code toolbar', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.locator('.toolbar .tb-btn[title="Inline code"]').first().click()
    await page.keyboard.type('codey')
    await expect(page.locator('.editor code').first()).toHaveText('codey')
  })

  test('bold isActive highlights toolbar button', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+b`)
    await page.keyboard.type('B')
    await expect(page.locator('.toolbar .tb-btn[title^="Bold"]').first()).toHaveClass(/is-active/)
  })

  test('multiple marks compose (bold+italic)', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+b`)
    await page.keyboard.press(`${MOD}+i`)
    await page.keyboard.type('combo')
    const html = await page.locator('.editor').innerHTML()
    expect(html).toMatch(
      /<strong>.*<em>combo<\/em>.*<\/strong>|<em>.*<strong>combo<\/strong>.*<\/em>/,
    )
  })

  test('toggle off bold', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+b`)
    await page.keyboard.type('A')
    await page.keyboard.press(`${MOD}+b`)
    await page.keyboard.type('B')
    await expect(page.locator('.editor strong')).toHaveText('A')
  })
})
