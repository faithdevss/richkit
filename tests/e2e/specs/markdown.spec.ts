import { expect, test } from '@playwright/test'
import { focusEditor } from './_helpers'

test.describe('markdown shortcuts', () => {
  test('# heading', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('# H1 text')
    await expect(page.locator('.editor h1')).toHaveText('H1 text')
  })

  test('## heading', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('## H2 text')
    await expect(page.locator('.editor h2')).toHaveText('H2 text')
  })

  test('### heading', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('### H3 text')
    await expect(page.locator('.editor h3')).toHaveText('H3 text')
  })

  test('blockquote with >', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('> quoted')
    await expect(page.locator('.editor blockquote')).toContainText('quoted')
  })

  test('bullet with - ', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('- first')
    await expect(page.locator('.editor ul li')).toContainText('first')
  })

  test('ordered with 1.', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('1. first')
    await expect(page.locator('.editor ol li')).toContainText('first')
  })

  test('bold via **text**', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('**bold** ')
    await expect(page.locator('.editor strong')).toHaveText('bold')
  })

  test('italic via *text*', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('*it* ')
    await expect(page.locator('.editor em')).toHaveText('it')
  })

  test('strike via ~~text~~', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('~~struck~~ ')
    await expect(page.locator('.editor s')).toHaveText('struck')
  })

  test('inline code via `text`', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('`snippet` ')
    await expect(page.locator('.editor code')).toHaveText('snippet')
  })

  test('URL autolink', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('https://example.com ')
    await expect(page.locator('.editor a[href="https://example.com"]')).toBeVisible()
  })
})

test.describe('typography smart input rules', () => {
  test('-- becomes em-dash', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('x--')
    await expect(page.locator('.editor')).toContainText('x—')
  })

  test('... becomes ellipsis', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('wait...')
    await expect(page.locator('.editor')).toContainText('wait…')
  })

  test('-> becomes arrow', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('a->')
    await expect(page.locator('.editor')).toContainText('a→')
  })

  test('(c) becomes copyright', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('(c)')
    await expect(page.locator('.editor')).toContainText('©')
  })

  test('(tm) becomes trademark', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('(tm)')
    await expect(page.locator('.editor')).toContainText('™')
  })

  test('smart open quote after space', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('say "')
    await expect(page.locator('.editor')).toContainText('“')
  })
})
