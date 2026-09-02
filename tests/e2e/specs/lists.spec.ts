import { expect, test } from '@playwright/test'
import { clickToolbar, focusEditor } from './_helpers'

test.describe('lists', () => {
  test('bullet list via toolbar', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Bullet list"')
    await page.keyboard.type('one')
    await page.keyboard.press('Enter')
    await page.keyboard.type('two')
    const items = page.locator('.editor ul li')
    await expect(items).toHaveCount(2)
    await expect(items.first()).toContainText('one')
    await expect(items.nth(1)).toContainText('two')
  })

  test('ordered list via toolbar', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Numbered list"')
    await page.keyboard.type('alpha')
    await page.keyboard.press('Enter')
    await page.keyboard.type('beta')
    const items = page.locator('.editor ol li')
    await expect(items).toHaveCount(2)
  })

  test('nest list with Tab', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Bullet list"')
    await page.keyboard.type('outer')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Tab')
    await page.keyboard.type('inner')
    await expect(page.locator('.editor ul ul li')).toContainText('inner')
  })

  test('unnest with Shift+Tab', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Bullet list"')
    await page.keyboard.type('outer')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Tab')
    await page.keyboard.type('inner')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.type('back')
    const html = await page.locator('.editor').innerHTML()
    expect(html).toContain('back')
  })

  test('toggle off bullet list', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Bullet list"')
    await page.keyboard.type('item')
    await clickToolbar(page, 'title="Bullet list"')
    await page.keyboard.press('End')
    await page.keyboard.type(' plain')
    const html = await page.locator('.editor').innerHTML()
    expect(html).toContain('plain')
  })

  test('To-do list via Format menu', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.locator('.menubar-trigger:has-text("Format")').click()
    await page.locator('.menu-item:has-text("To-do List")').click()
    await page.keyboard.type('task')
    await expect(page.locator('.editor ul[data-type="task-list"]')).toBeAttached()
  })

  test('increase indent button (sinkListItem)', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Bullet list"')
    await page.keyboard.type('a')
    await page.keyboard.press('Enter')
    await page.keyboard.type('b')
    await clickToolbar(page, 'title="Increase indent"')
    await expect(page.locator('.editor ul ul')).toBeAttached()
  })
})
