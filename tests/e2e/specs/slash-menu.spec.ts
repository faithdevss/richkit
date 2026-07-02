import { expect, test } from '@playwright/test'
import { focusEditor } from './_helpers'

test.describe('slash command menu', () => {
  test('opens on "/" and inserts heading via Enter', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('/')
    await expect(page.locator('.slash-menu')).toBeVisible()
    await page.keyboard.type('heading')
    await page.keyboard.press('Enter')
    await page.keyboard.type('Big title')
    await expect(page.locator('.editor h1').first()).toHaveText('Big title')
  })

  test('filters items by query', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('/task')
    await expect(page.locator('.slash-menu-item')).toHaveCount(1)
    await expect(page.locator('.slash-menu-item').first()).toContainText('Task list')
  })

  test('arrow keys move selection', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('/')
    await expect(page.locator('.slash-menu')).toBeVisible()
    const first = page.locator('.slash-menu-item').first()
    await expect(first).toHaveClass(/is-active/)
    await page.keyboard.press('ArrowDown')
    await expect(page.locator('.slash-menu-item').nth(1)).toHaveClass(/is-active/)
  })

  test('escape closes and suppresses menu', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('/he')
    await expect(page.locator('.slash-menu')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.slash-menu')).toHaveCount(0)
    await page.keyboard.type('ad')
    await expect(page.locator('.slash-menu')).toHaveCount(0)
  })

  test('inserts table via mouse click', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('/table')
    await page.locator('.slash-menu-item', { hasText: 'Table' }).first().click()
    await expect(page.locator('.editor table')).toHaveCount(1)
  })

  test('does not open mid-word', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('path/to')
    await expect(page.locator('.slash-menu')).toHaveCount(0)
  })
})
