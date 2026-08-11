import { expect, test, type Page } from '@playwright/test'
import { focusEditor, MOD } from './_helpers'

async function openSuggestionsPanel(page: Page) {
  await page.locator('.menubar-trigger:has-text("View")').click()
  await page.locator('.menu-item:has-text("Suggestions panel")').click()
}

async function enableTracking(page: Page) {
  await page.locator('.menubar-trigger:has-text("View")').click()
  await page.locator('.menu-item:has-text("Track changes")').click()
}

test.describe('track changes', () => {
  test('toggle Track changes shows suggestions panel + tracking ON state', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await enableTracking(page)
    await expect(page.locator('.re-suggestions-sidebar')).toBeVisible()
    await expect(page.locator('.re-track-toggle.is-on')).toContainText('Tracking ON')
  })

  test('typing while tracking creates insertion mark + sidebar entry', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await enableTracking(page)

    const editor = page.locator('.editor .ProseMirror')
    await editor.click()
    await page.keyboard.type('hello')

    await expect(page.locator('.editor .suggestion-insertion')).toHaveCount(1)
    await expect(page.locator('.re-suggestion-insertion')).toHaveCount(1)
    await expect(page.locator('.re-suggestion-badge-insertion')).toBeVisible()
  })

  test('Backspace while tracking creates deletion mark', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('hello world')

    await openSuggestionsPanel(page)
    await enableTracking(page)

    const editor = page.locator('.editor .ProseMirror')
    await editor.click()
    await page.keyboard.press('End')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Backspace')

    await expect(page.locator('.editor .suggestion-deletion')).toHaveCount(1)
    await expect(page.locator('.re-suggestion-deletion')).toHaveCount(1)
  })

  test('Accept on insertion strips mark, keeps text', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await enableTracking(page)

    const editor = page.locator('.editor .ProseMirror')
    await editor.click()
    await page.keyboard.type('hello')

    await page.locator('.re-suggestion-insertion button:has-text("Accept")').click()
    await expect(page.locator('.editor .suggestion-insertion')).toHaveCount(0)
    await expect(editor).toContainText('hello')
    await expect(page.locator('.re-suggestion')).toHaveCount(0)
  })

  test('Reject on insertion removes the inserted text', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await enableTracking(page)

    const editor = page.locator('.editor .ProseMirror')
    await editor.click()
    await page.keyboard.type('hello')

    await page.locator('.re-suggestion-insertion button:has-text("Reject")').click()
    await expect(page.locator('.editor .suggestion-insertion')).toHaveCount(0)
    const text = await editor.innerText()
    expect(text).not.toContain('hello')
  })

  test('Disabling tracking stops marking new typing', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await enableTracking(page)

    const editor = page.locator('.editor .ProseMirror')
    await editor.click()
    await page.keyboard.type('aaa')
    await expect(page.locator('.editor .suggestion-insertion')).toHaveCount(1)

    await enableTracking(page) // toggle off
    await editor.click()
    await page.keyboard.press('End')
    await page.keyboard.type('bbb')

    const insSpans = page.locator('.editor .suggestion-insertion')
    const text = await editor.innerText()
    expect(text).toContain('bbb')
    // bbb should not be inside an insertion span
    const insText = (await insSpans.allInnerTexts()).join('')
    expect(insText).not.toContain('bbb')
  })

  test('Accept all clears every suggestion', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await enableTracking(page)

    const editor = page.locator('.editor .ProseMirror')
    await editor.click()
    await page.keyboard.type('foo')

    await expect(page.locator('.re-suggestion')).toHaveCount(1)
    await page.locator('.re-suggestions-bulk button:has-text("Accept all")').click()
    await expect(page.locator('.re-suggestion')).toHaveCount(0)
    await expect(page.locator('.editor .suggestion-insertion')).toHaveCount(0)
  })

  test('select-all + Delete while tracking marks a deletion instead of erasing', async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))

    await page.goto('/')
    const editor = await focusEditor(page)
    await page.keyboard.type('hello world')
    await enableTracking(page)

    await editor.click()
    await page.keyboard.press(`${MOD}+a`)
    await page.keyboard.press('Delete')

    // regression: nodeAt(from - 1) threw "Position -1 outside of fragment" on a
    // whole-document selection, so the keymap bailed and the text was erased untracked
    expect(errors).toEqual([])
    await expect(page.locator('.editor .suggestion-deletion')).toHaveCount(1)
    await expect(editor).toContainText('hello world')
  })
})
