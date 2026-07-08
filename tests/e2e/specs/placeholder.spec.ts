import { expect, test } from '@playwright/test'
import { focusEditor } from './_helpers'

test.describe('placeholder', () => {
  test('empty editor shows placeholder decoration', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    const empty = page.locator('.editor .ProseMirror p.is-empty')
    await expect(empty).toHaveAttribute('data-placeholder', 'Write something…')
  })

  test('placeholder disappears when typing starts', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('hello')
    await expect(page.locator('.editor .ProseMirror p.is-empty')).toHaveCount(0)
  })

  test('placeholder returns after content is deleted', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('temporary text')
    await expect(page.locator('.editor .ProseMirror p.is-empty')).toHaveCount(0)
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.press('Delete')
    await expect(page.locator('.editor .ProseMirror p.is-empty')).toHaveAttribute(
      'data-placeholder',
      'Write something…',
    )
  })
})
