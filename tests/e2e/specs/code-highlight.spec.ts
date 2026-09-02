import { expect, test } from '@playwright/test'
import { clickToolbar, focusEditor } from './_helpers'

test.describe('code block syntax highlighting', () => {
  test('NodeView renders language picker', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Code block"')
    await expect(page.locator('.code-block-lang')).toBeVisible()
  })

  test('NodeView renders Copy button', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Code block"')
    await expect(page.locator('.code-block-copy')).toBeVisible()
  })

  test('changing language updates class on inner code', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Code block"')
    await page.keyboard.type('const x = 1')
    await page.locator('.code-block-lang').selectOption('javascript')
    await expect(page.locator('.editor .code-block-pre code')).toHaveClass(/language-javascript/)
  })

  test('javascript keywords get highlight classes', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Code block"')
    await page.locator('.code-block-lang').selectOption('javascript')
    await page.locator('.editor .ProseMirror').click()
    await page.keyboard.type('const x = 1')
    await expect(page.locator('.editor pre code .hljs-keyword').first()).toBeAttached()
  })

  test('python strings get highlighted', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Code block"')
    await page.locator('.code-block-lang').selectOption('python')
    await page.locator('.editor .ProseMirror').click()
    await page.keyboard.type('print("hello")')
    await expect(page.locator('.editor pre code .hljs-string').first()).toBeAttached()
  })

  test('language attr persists in output HTML', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Code block"')
    await page.locator('.code-block-lang').selectOption('typescript')
    await page.locator('.editor .ProseMirror').click()
    await page.keyboard.type('let n: number')
    await expect(page.locator('.output pre')).toContainText('language-typescript')
  })

  test('plaintext disables highlighting', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Code block"')
    await page.locator('.code-block-lang').selectOption('plaintext')
    await page.locator('.editor .ProseMirror').click()
    await page.keyboard.type('const x = 1')
    await expect(page.locator('.editor pre code .hljs-keyword')).toHaveCount(0)
  })

  test('language list contains common languages', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Code block"')
    const opts = await page.locator('.code-block-lang option').allTextContents()
    expect(opts).toContain('javascript')
    expect(opts).toContain('python')
    expect(opts).toContain('typescript')
    expect(opts).toContain('plaintext')
  })
})
