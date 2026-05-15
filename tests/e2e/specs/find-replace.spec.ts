import { expect, test } from '@playwright/test'
import { focusEditor, MOD } from './_helpers'

test.describe('find & replace', () => {
  test('opens via menu and highlights matches', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('The fox jumps over the fox again. fox.')

    await page.locator('.menubar-trigger:has-text("Edit")').click()
    await page.locator('.menu-item:has-text("Find and replace")').click()

    const dialog = page.locator('.re-modal')
    await expect(dialog).toBeVisible()

    await dialog.locator('input').first().fill('fox')
    await expect(dialog.locator('.re-modal-meta')).toContainText('1 of 3')
    await expect(page.locator('.editor .find-match')).toHaveCount(3)
    await expect(page.locator('.editor .find-match-current')).toHaveCount(1)
  })

  test('Next button advances current match', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('one two one two one')

    await page.locator('.menubar-trigger:has-text("Edit")').click()
    await page.locator('.menu-item:has-text("Find and replace")').click()
    const dialog = page.locator('.re-modal')
    await dialog.locator('input').first().fill('one')
    await expect(dialog.locator('.re-modal-meta')).toContainText('1 of 3')

    await dialog.locator('button:has-text("Next")').click()
    await expect(dialog.locator('.re-modal-meta')).toContainText('2 of 3')
  })

  test('Replace all replaces every match', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('foo bar foo baz foo')

    await page.locator('.menubar-trigger:has-text("Edit")').click()
    await page.locator('.menu-item:has-text("Find and replace")').click()
    const dialog = page.locator('.re-modal')
    await dialog.locator('input').first().fill('foo')
    await dialog.locator('input').nth(1).fill('XX')
    await expect(dialog.locator('.re-modal-meta')).toContainText('1 of 3')

    await dialog.locator('button:has-text("Replace all")').click()

    const text = await page.locator('.editor .ProseMirror').innerText()
    expect(text).toContain('XX bar XX baz XX')
    expect(text).not.toContain('foo')
  })

  test('Match case toggle filters results', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('Apple apple APPLE')

    await page.locator('.menubar-trigger:has-text("Edit")').click()
    await page.locator('.menu-item:has-text("Find and replace")').click()
    const dialog = page.locator('.re-modal')
    await dialog.locator('input').first().fill('apple')
    await expect(dialog.locator('.re-modal-meta')).toContainText('1 of 3')

    await dialog.locator('input[type="checkbox"]').first().check()
    await expect(dialog.locator('.re-modal-meta')).toContainText('1 of 1')
  })

  test('Esc closes and clears highlights', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('alpha beta alpha')

    await page.locator('.menubar-trigger:has-text("Edit")').click()
    await page.locator('.menu-item:has-text("Find and replace")').click()
    const dialog = page.locator('.re-modal')
    await dialog.locator('input').first().fill('alpha')
    await expect(page.locator('.editor .find-match')).toHaveCount(2)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page.locator('.editor .find-match')).toHaveCount(0)
  })

  test('Cmd/Ctrl+F shortcut opens dialog', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('shortcut test')

    await page.keyboard.press(`${MOD}+f`)
    await expect(page.locator('.re-modal')).toBeVisible()
  })
})
