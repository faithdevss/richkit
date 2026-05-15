import { expect, test } from '@playwright/test'
import { focusEditor, MOD } from './_helpers'

test.describe('menubar opens menus', () => {
  for (const label of ['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Table', 'Help']) {
    test(`${label} menu opens`, async ({ page }) => {
      await page.goto('/')
      await page.locator(`.menubar-trigger:has-text("${label}")`).click()
      await expect(page.locator('.menu-panel').first()).toBeVisible()
    })
  }

  test('Escape closes menu', async ({ page }) => {
    await page.goto('/')
    await page.locator(`.menubar-trigger:has-text("Insert")`).click()
    await expect(page.locator('.menu-panel')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.menu-panel')).toHaveCount(0)
  })

  test('click outside closes menu', async ({ page }) => {
    await page.goto('/')
    await page.locator(`.menubar-trigger:has-text("Insert")`).click()
    await page.locator('body').click({ position: { x: 5, y: 600 } })
    await expect(page.locator('.menu-panel')).toHaveCount(0)
  })

  test('hover switches to sibling menu', async ({ page }) => {
    await page.goto('/')
    await page.locator(`.menubar-trigger:has-text("File")`).click()
    await page.locator(`.menubar-trigger:has-text("Edit")`).hover()
    await expect(page.locator('.menu-panel:has(.menu-item:has-text("Undo"))')).toBeVisible()
  })

  test('submenu opens on hover', async ({ page }) => {
    await page.goto('/')
    await page.locator(`.menubar-trigger:has-text("Format")`).click()
    await page.locator('.menu-item:has-text("Heading")').first().hover()
    await expect(page.locator('.menu-submenu .menu-item:has-text("Heading 1")')).toBeVisible()
  })

  test('disabled item present in Tools', async ({ page }) => {
    await page.goto('/')
    await page.locator(`.menubar-trigger:has-text("Tools")`).click()
    await expect(page.locator('.menu-panel .menu-item[disabled], .menu-panel .menu-item.is-disabled').first()).toBeAttached()
  })
})

test.describe('modals', () => {
  test('find & replace opens', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('alpha beta gamma alpha')
    await page.keyboard.press(`${MOD}+f`)
    await expect(page.locator('.re-modal')).toBeVisible()
    await page.locator('.re-modal input').first().fill('alpha')
    await expect(page.locator('.re-modal-meta')).toContainText(/of/i)
  })

  test('find & replace performs replace all', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('foo foo foo')
    await page.keyboard.press(`${MOD}+f`)
    await page.locator('.re-modal input').first().fill('foo')
    await page.locator('.re-modal input').nth(1).fill('bar')
    await page.locator('.re-modal-footer .tb-btn-primary').click()
    await expect(page.locator('.editor')).toContainText('bar bar bar')
  })

  test('find & replace replace one', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('cat cat')
    await page.keyboard.press(`${MOD}+f`)
    await page.locator('.re-modal input').first().fill('cat')
    await page.locator('.re-modal input').nth(1).fill('dog')
    await page.locator('.re-modal-footer button:has-text("Replace")').first().click()
    await expect(page.locator('.editor')).toContainText('dog cat')
  })

  test('Escape closes find/replace', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+f`)
    await expect(page.locator('.re-modal')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.re-modal')).toHaveCount(0)
  })

  test('source code modal shows HTML', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('hello')
    await page.locator('.menubar-trigger:has-text("Tools")').click()
    await page.locator('.menu-item:has-text("Source code")').click()
    await expect(page.locator('.re-source-textarea')).toContainText('hello')
  })

  test('source code apply updates editor', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.locator('.menubar-trigger:has-text("Tools")').click()
    await page.locator('.menu-item:has-text("Source code")').click()
    await page.locator('.re-source-textarea').fill('<h1>From source</h1>')
    await page.locator('.re-modal-footer .tb-btn-primary').click()
    await expect(page.locator('.editor h1')).toHaveText('From source')
  })
})

test.describe('history (undo/redo)', () => {
  test('undo via toolbar', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('typed text')
    await page.locator('.toolbar .tb-btn[title^="Undo"]').click()
    await expect(page.locator('.editor')).not.toContainText('typed text')
  })

  test('Mod+Z undoes', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('to undo')
    await page.keyboard.press(`${MOD}+z`)
    await expect(page.locator('.editor')).not.toContainText('to undo')
  })

  test('redo via toolbar', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('content')
    await page.keyboard.press(`${MOD}+z`)
    await page.locator('.toolbar .tb-btn[title^="Redo"]').click()
    await expect(page.locator('.editor')).toContainText('content')
  })
})
