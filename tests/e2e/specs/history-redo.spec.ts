import { expect, test } from '@playwright/test'
import { MOD, focusEditor } from './_helpers'

test.describe('history redo shortcuts', () => {
  test('Mod+Shift+Z redoes an undone change', async ({ page }) => {
    await page.goto('/')
    const editor = await focusEditor(page)
    await page.keyboard.type('redo me')
    await expect(editor).toContainText('redo me')
    await page.keyboard.press(`${MOD}+z`)
    await expect(editor).not.toContainText('redo me')
    await page.keyboard.press(`${MOD}+Shift+z`)
    await expect(editor).toContainText('redo me')
  })

  test('Mod+Y redoes an undone change', async ({ page }) => {
    await page.goto('/')
    const editor = await focusEditor(page)
    await page.keyboard.type('via mod y')
    await page.keyboard.press(`${MOD}+z`)
    await expect(editor).not.toContainText('via mod y')
    await page.keyboard.press(`${MOD}+y`)
    await expect(editor).toContainText('via mod y')
  })

  test('typing after undo discards the redo branch', async ({ page }) => {
    await page.goto('/')
    const editor = await focusEditor(page)
    await page.keyboard.type('original')
    await page.keyboard.press(`${MOD}+z`)
    await page.keyboard.type('replacement')
    await page.keyboard.press(`${MOD}+Shift+z`)
    await expect(editor).toContainText('replacement')
    await expect(editor).not.toContainText('original')
  })
})
