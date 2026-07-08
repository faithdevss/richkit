import { expect, test } from '@playwright/test'
import { MOD, focusEditor, getHtml } from './_helpers'

test.describe('task list', () => {
  test('Mod+Shift+9 wraps paragraph in task list', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('buy milk')
    await page.keyboard.press(`${MOD}+Shift+9`)
    const item = page.locator('.editor li[data-type="task-item"]')
    await expect(item).toHaveCount(1)
    await expect(item).toHaveText('buy milk')
  })

  test('task item serializes checked state in output HTML', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('task one')
    await page.keyboard.press(`${MOD}+Shift+9`)
    const html = await getHtml(page)
    expect(html).toContain('data-type="task-list"')
    expect(html).toContain('data-checked="false"')
  })

  test('Enter creates a new task item', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('first task')
    await page.keyboard.press(`${MOD}+Shift+9`)
    await page.keyboard.press('End')
    await page.keyboard.press('Enter')
    await page.keyboard.type('second task')
    await expect(page.locator('.editor li[data-type="task-item"]')).toHaveCount(2)
  })
})
