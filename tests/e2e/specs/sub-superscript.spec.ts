import { expect, test } from '@playwright/test'
import { focusEditor, MOD } from './_helpers'

test.describe('subscript & superscript', () => {
  test('subscript via shortcut', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+Comma`)
    await page.keyboard.type('below')
    await expect(page.locator('.editor sub').first()).toHaveText('below')
  })

  test('superscript via shortcut', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+Period`)
    await page.keyboard.type('above')
    await expect(page.locator('.editor sup').first()).toHaveText('above')
  })

  test('sub and sup are mutually exclusive', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('x2')
    await page.keyboard.press(`${MOD}+a`)
    await page.keyboard.press(`${MOD}+Comma`)
    await expect(page.locator('.editor sub')).toHaveCount(1)
    await page.keyboard.press(`${MOD}+Period`)
    await expect(page.locator('.editor sup')).toHaveCount(1)
    await expect(page.locator('.editor sub')).toHaveCount(0)
  })

  test('toolbar buttons toggle marks', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('base')
    await page.keyboard.press(`${MOD}+a`)
    await page.locator('button[title^="Subscript"]').first().click()
    await expect(page.locator('.editor sub').first()).toHaveText('base')
  })
})
