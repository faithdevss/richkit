import { expect, test } from '@playwright/test'
import { focusEditor, MOD } from './_helpers'

test.describe('bubble menu', () => {
  test('appears on selection', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('select me please')
    await page.keyboard.press(`${MOD}+a`)
    await expect(page.locator('.bubble-menu')).toBeVisible()
  })

  test('bold from bubble', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('bubble bold')
    await page.keyboard.press(`${MOD}+a`)
    await page.locator('.bubble-menu .tb-btn[title="Bold"]').click()
    await expect(page.locator('.editor strong')).toContainText('bubble bold')
  })

  test('italic from bubble', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('bubble italic')
    await page.keyboard.press(`${MOD}+a`)
    await page.locator('.bubble-menu .tb-btn[title="Italic"]').click()
    await expect(page.locator('.editor em')).toContainText('bubble italic')
  })
})

test.describe('clear formatting', () => {
  test('removes marks from selection', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+b`)
    await page.keyboard.type('was bold')
    await page.keyboard.press(`${MOD}+a`)
    await page.locator('.toolbar .tb-btn[title="Clear formatting"]').click()
    await expect(page.locator('.editor strong')).toHaveCount(0)
  })

  test('Format > Remove Format clears', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+i`)
    await page.keyboard.type('italic text')
    await page.keyboard.press(`${MOD}+a`)
    await page.locator('.menubar-trigger:has-text("Format")').click()
    await page.locator('.menu-item:has-text("Remove Format")').click()
    await expect(page.locator('.editor em')).toHaveCount(0)
  })
})

test.describe('case change', () => {
  test('UPPERCASE', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('hello world')
    await page.keyboard.press(`${MOD}+a`)
    await page.locator('.menubar-trigger:has-text("Format")').click()
    await page.locator('.menu-item:has-text("Case change")').first().hover()
    await page.locator('.menu-submenu .menu-item:has-text("UPPERCASE")').click()
    await expect(page.locator('.editor')).toContainText('HELLO WORLD')
  })

  test('lowercase', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('HELLO WORLD')
    await page.keyboard.press(`${MOD}+a`)
    await page.locator('.menubar-trigger:has-text("Format")').click()
    await page.locator('.menu-item:has-text("Case change")').first().hover()
    await page.locator('.menu-submenu .menu-item:has-text("lowercase")').click()
    await expect(page.locator('.editor')).toContainText('hello world')
  })

  test('Title Case', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('hello world')
    await page.keyboard.press(`${MOD}+a`)
    await page.locator('.menubar-trigger:has-text("Format")').click()
    await page.locator('.menu-item:has-text("Case change")').first().hover()
    await page.locator('.menu-submenu .menu-item:has-text("Title Case")').click()
    await expect(page.locator('.editor')).toContainText('Hello World')
  })
})

test.describe('image insert', () => {
  test('insert via popover URL', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.locator('.toolbar .tb-btn[title="Insert image"]').click()
    await page.locator('.tb-image-form input[type="url"]').fill('https://placehold.co/100x100.png')
    await page.locator('.tb-image-form .tb-btn-primary').click()
    await expect(page.locator('.editor img')).toBeVisible()
  })
})

test.describe('link', () => {
  test('apply via link popover', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('click here')
    await page.keyboard.press(`${MOD}+a`)
    await page.locator('.toolbar .tb-btn[title="Link"]').first().click()
    await page.locator('.tb-link-form input[type="url"]').fill('https://example.com')
    await page.locator('.tb-link-form .tb-btn-primary').click()
    await expect(page.locator('.editor a[href="https://example.com"]')).toContainText('click here')
  })

  test('remove link', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('to unlink')
    await page.keyboard.press(`${MOD}+a`)
    await page.locator('.toolbar .tb-btn[title="Link"]').first().click()
    await page.locator('.tb-link-form input[type="url"]').fill('https://x.com')
    await page.locator('.tb-link-form .tb-btn-primary').click()
    await page.keyboard.press(`${MOD}+a`)
    await page.locator('.toolbar .tb-btn[title="Link"]').first().click()
    await page.locator('.tb-link-form .tb-btn-ghost').click()
    await expect(page.locator('.editor a')).toHaveCount(0)
  })
})

test.describe('autosave + draft restore', () => {
  test('saves to localStorage on update', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('save me')
    await page.waitForTimeout(150)
    const draft = await page.evaluate(() => localStorage.getItem('rich-editor:draft'))
    expect(draft).toContain('save me')
  })

  test('restores from localStorage on reload', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('persisted content')
    await page.waitForTimeout(150)
    await page.reload()
    await expect(page.locator('.editor')).toContainText('persisted content')
  })
})

test.describe('output panel', () => {
  test('updates as user types', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('reflected')
    await expect(page.locator('.output pre')).toContainText('reflected')
  })

  test('reflects bold formatting', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+b`)
    await page.keyboard.type('strong')
    await expect(page.locator('.output pre')).toContainText('<strong')
  })
})

test.describe('insert misc', () => {
  test('emoji popover inserts', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.locator('.toolbar .tb-btn[title="Insert emoji"]').click()
    await page.locator('.tb-emoji-grid .tb-emoji-btn').first().click()
    await expect(page.locator('.editor')).toContainText('😀')
  })

  test('special char popover inserts', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.locator('.toolbar .tb-btn[title="Special characters"]').click()
    await page.locator('.tb-char-grid .tb-char-btn').first().click()
    await expect(page.locator('.editor')).toContainText('©')
  })
})

test.describe('select all', () => {
  test('Mod+A selects whole doc', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('aaa bbb ccc')
    await page.keyboard.press(`${MOD}+a`)
    await page.locator('.toolbar .tb-btn[title^="Bold"]').click()
    await expect(page.locator('.editor strong')).toContainText('aaa bbb ccc')
  })
})

test.describe('table of contents', () => {
  test('Insert > Table of contents creates list', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+Alt+Digit2`)
    await page.keyboard.type('First Section')
    await page.keyboard.press('Enter')
    await page.locator('.tb-blocktype-trigger').click()
    await page.locator('.tb-pop-blocktype .tb-menu-item:has-text("Paragraph")').click()
    await page.locator('.menubar-trigger:has-text("Insert")').click()
    await page.locator('.menu-item:has-text("Table of contents")').click()
    await expect(page.locator('.editor h2:has-text("Table of contents")')).toBeVisible()
  })
})
