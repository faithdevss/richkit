import { expect, test } from '@playwright/test'
import { MOD, clickToolbar, focusEditor } from './_helpers'

async function typeAndSelect(page: import('@playwright/test').Page, text: string) {
  await page.keyboard.type(text)
  await page.keyboard.press(`${MOD}+a`)
}

test.describe('text color', () => {
  test('apply red via color picker', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await typeAndSelect(page, 'colored')
    await clickToolbar(page, 'title="Text color"')
    await page.locator('.tb-pop-color .tb-swatch').nth(5).click() // #dc2626 (red)
    const html = await page.locator('.editor').innerHTML()
    expect(html).toMatch(/color:\s*rgb\(220,\s*38,\s*38\)/i)
  })

  test('reset color', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await typeAndSelect(page, 'x')
    await clickToolbar(page, 'title="Text color"')
    await page.locator('.tb-pop-color .tb-swatch').nth(0).click()
    await clickToolbar(page, 'title="Text color"')
    await page.locator('.tb-pop-color .tb-color-reset').click()
    const html = await page.locator('.editor').innerHTML()
    expect(html).not.toContain('color: rgb(0, 0, 0)')
  })
})

test.describe('highlight', () => {
  test('apply yellow highlight', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await typeAndSelect(page, 'mark me')
    await clickToolbar(page, 'title="Highlight"')
    await page.locator('.tb-pop-color .tb-swatch').first().click()
    await expect(page.locator('.editor mark')).toContainText('mark me')
  })

  test('Mod+Shift+H highlights selection', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await typeAndSelect(page, 'shortcut')
    await page.keyboard.press(`${MOD}+Shift+h`)
    await expect(page.locator('.editor mark')).toContainText('shortcut')
  })

  test('remove highlight', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await typeAndSelect(page, 'x')
    await page.keyboard.press(`${MOD}+Shift+h`)
    await page.keyboard.press(`${MOD}+a`)
    await clickToolbar(page, 'title="Highlight"')
    await page.locator('.tb-pop-color .tb-color-reset').click()
    await expect(page.locator('.editor mark')).toHaveCount(0)
  })
})

test.describe('font family + size', () => {
  test('set font family', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await typeAndSelect(page, 'serif')
    await page.locator('.tb-font-trigger').click()
    await page.getByRole('menuitem', { name: 'Serif', exact: true }).click()
    const html = await page.locator('.editor').innerHTML()
    expect(html).toMatch(/font-family:\s*Georgia/i)
  })

  test('set font size', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await typeAndSelect(page, 'big')
    await page.locator('.tb-fontsize-trigger').click()
    await page.locator('.tb-pop-fontsize .tb-menu-item:has-text("24")').click()
    const html = await page.locator('.editor').innerHTML()
    expect(html).toMatch(/font-size:\s*24px/i)
  })

  test('font family + size compose', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await typeAndSelect(page, 'both')
    await page.locator('.tb-font-trigger').click()
    await page.getByRole('menuitem', { name: 'Serif', exact: true }).click()
    await page.keyboard.press(`${MOD}+a`)
    await page.locator('.tb-fontsize-trigger').click()
    await page.locator('.tb-pop-fontsize .tb-menu-item:has-text("20")').click()
    const html = await page.locator('.editor').innerHTML()
    expect(html).toMatch(/font-family:/i)
    expect(html).toMatch(/font-size:\s*20px/i)
  })
})

test.describe('text alignment', () => {
  test('center via toolbar', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('centered')
    await clickToolbar(page, 'title="Align center"')
    await expect(page.locator('.editor p')).toHaveAttribute('style', /text-align:\s*center/)
  })

  test('right via toolbar', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('right side')
    await clickToolbar(page, 'title="Align right"')
    await expect(page.locator('.editor p')).toHaveAttribute('style', /text-align:\s*right/)
  })

  test('justify via toolbar', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('justify this text now')
    await clickToolbar(page, 'title="Justify"')
    await expect(page.locator('.editor p')).toHaveAttribute('style', /text-align:\s*justify/)
  })

  test('back to left removes attr', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('text')
    await clickToolbar(page, 'title="Align center"')
    await clickToolbar(page, 'title="Align left"')
    const html = await page.locator('.editor').innerHTML()
    expect(html).not.toMatch(/text-align/i)
  })

  test('alignment persists in output', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('persisted')
    await clickToolbar(page, 'title="Align center"')
    await expect(page.locator('.output pre')).toContainText('text-align')
  })
})

test.describe('line height', () => {
  test('set 1.5', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('text')
    await clickToolbar(page, 'title="Line height"')
    await page.locator('.tb-pop .tb-menu-item:has-text("1.5")').first().click()
    await expect(page.locator('.editor p')).toHaveAttribute('style', /line-height:\s*1\.5/)
  })

  test('default removes line-height', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('y')
    await clickToolbar(page, 'title="Line height"')
    await page.locator('.tb-pop .tb-menu-item:has-text("2.0")').first().click()
    await clickToolbar(page, 'title="Line height"')
    await page.locator('.tb-pop .tb-menu-item:has-text("Default")').first().click()
    const html = await page.locator('.editor').innerHTML()
    expect(html).not.toMatch(/line-height/i)
  })
})
