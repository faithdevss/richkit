import { expect, test } from '@playwright/test'
import { MOD, clickToolbar, focusEditor } from './_helpers'

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
    await clickToolbar(page, 'title="Clear formatting"')
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
    await clickToolbar(page, 'title="Insert image"')
    await page.locator('.re-image-tab', { hasText: 'Link' }).click()
    await page
      .locator('.re-image-insert input[type="url"]')
      .fill('https://placehold.co/100x100.png')
    await page.locator('.re-image-insert .tb-btn-primary').click()
    await expect(page.locator('.editor img')).toBeVisible()
  })

  test('insert via popover upload', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Insert image"')
    await page.locator('.re-image-insert input[type="file"]').setInputFiles({
      name: 'pixel.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64',
      ),
    })
    await expect(page.locator('.re-image-drop img')).toBeVisible()
    await page.locator('.re-image-insert .tb-btn-primary').click()
    await expect(page.locator('.editor img[alt="pixel.png"]')).toHaveAttribute(
      'src',
      /^data:image\/png/,
    )
  })
})

test.describe('link', () => {
  test('apply via link popover', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('click here')
    await page.keyboard.press(`${MOD}+a`)
    await clickToolbar(page, 'title="Link"')
    await page.locator('.tb-link-form input[type="url"]').fill('https://example.com')
    await page.locator('.tb-link-form .tb-btn-primary').click()
    await expect(page.locator('.editor a[href="https://example.com"]')).toContainText('click here')
  })

  test('selected text fills the display text field', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('click here')
    await page.keyboard.press(`${MOD}+a`)
    await clickToolbar(page, 'title="Link"')
    await expect(page.locator('.tb-link-form input[type="text"]')).toHaveValue('click here')
  })

  test('inserts a link with custom text, or the URL when text is empty', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Link"')
    await page.locator('.tb-link-form input[type="url"]').fill('https://a.com')
    await page.locator('.tb-link-form input[type="text"]').fill('Site A')
    await page.locator('.tb-link-form .tb-btn-primary').click()
    await expect(page.locator('.editor a[href="https://a.com"]')).toHaveText('Site A')
    await clickToolbar(page, 'title="Link"')
    await page.locator('.tb-link-form input[type="url"]').fill('https://b.com')
    await page.locator('.tb-link-form .tb-btn-primary').click()
    await expect(page.locator('.editor a[href="https://b.com"]')).toHaveText('https://b.com')
  })

  test('remove link', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('to unlink')
    await page.keyboard.press(`${MOD}+a`)
    await clickToolbar(page, 'title="Link"')
    await page.locator('.tb-link-form input[type="url"]').fill('https://x.com')
    await page.locator('.tb-link-form .tb-btn-primary').click()
    await page.keyboard.press(`${MOD}+a`)
    await clickToolbar(page, 'title="Link"')
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
    const draft = await page.evaluate(() => localStorage.getItem('richkit:draft'))
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
    await clickToolbar(page, 'title="Insert emoji"')
    await page.locator('.tb-emoji-grid .tb-emoji-btn').first().click()
    await expect(page.locator('.editor')).toContainText('😀')
  })

  test('special char popover inserts', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await clickToolbar(page, 'title="Special characters"')
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
    await clickToolbar(page, 'title^="Bold"')
    await expect(page.locator('.editor strong')).toContainText('aaa bbb ccc')
  })
})

test.describe('table of contents', () => {
  test('Insert > Table of contents opens outline panel with headings', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.press(`${MOD}+Alt+Digit2`)
    await page.keyboard.type('First Section')
    await page.keyboard.press('Enter')
    await page.locator('.tb-blocktype-trigger').click()
    await page.locator('.tb-pop-blocktype .tb-menu-item:has-text("Paragraph")').click()
    await page.locator('.menubar-trigger:has-text("Insert")').click()
    await page.locator('.menu-item:has-text("Table of contents")').click()
    await expect(page.locator('.re-outline-sidebar')).toBeVisible()
    await expect(page.locator('.re-outline-item:has-text("First Section")')).toBeVisible()
  })
})
