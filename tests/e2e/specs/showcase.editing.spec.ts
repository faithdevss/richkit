import { test, expect, type Page } from '@playwright/test'
import { MOD } from './_helpers'

/**
 * Keyboard and pointer affordances a Notion or TipTap user reaches for without
 * thinking: getting out of a trailing block, indenting code, undoing a
 * markdown rule, growing a table with Tab. Each of these was a dead end once,
 * so the file guards the escape hatches rather than the block types.
 */

const ED = '.demo-notion .editor .ProseMirror'

async function open(page: Page) {
  await page.goto('/docs/usecases/notion-blocks', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => {
    try {
      localStorage.removeItem('richkit:notion-draft')
    } catch {
      // storage can be unavailable; the demo falls back to its seed content
    }
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  const editor = page.locator(ED)
  await editor.waitFor()
  await editor.click()
  await page.keyboard.press(`${MOD}+a`)
  await page.keyboard.press('Delete')
  // let prosemirror-history close the group so a later undo is its own step
  await page.waitForTimeout(700)
  return editor
}

const html = (page: Page) => page.locator(ED).innerHTML()

/**
 * Type into a code block and wait for the text to land. The node view
 * re-renders on every highlight pass, so a key pressed before that settles can
 * act on a stale caret.
 */
async function typeCode(page: Page, text: string) {
  await page.keyboard.type(text)
  await expect(page.locator(`${ED} code`)).toHaveText(text)
}

/**
 * Move the caret to the head of the current line and wait for the browser to
 * report it there — a key pressed too early acts on the old position.
 */
async function toLineStart(page: Page, key: string) {
  await page.keyboard.press(key)
  await expect.poll(() => page.evaluate(() => window.getSelection()?.anchorOffset ?? -1)).toBe(0)
  // the browser reports the caret before ProseMirror has read it back
  await page.waitForTimeout(50)
}

/** Type "/" plus a query and pick the first hit. */
async function runSlash(page: Page, query: string) {
  await page.keyboard.type(`/${query}`)
  await page.locator('.slash-menu-item').first().click()
}

test.describe('leaving a trailing block', () => {
  test('ArrowDown exits a code block at the end of the document', async ({ page }) => {
    await open(page)
    await page.keyboard.type('```')
    await typeCode(page, 'code')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.type('after')
    expect(await html(page)).toMatch(/<\/pre>[\s\S]*after/)
  })

  test('ArrowDown mid-document just moves to the next block', async ({ page }) => {
    await open(page)
    await page.keyboard.type('```')
    await typeCode(page, 'code')
    await page.keyboard.press(`${MOD}+Enter`)
    await page.keyboard.type('below')
    await page.locator(`${ED} code`).click()
    await page.waitForTimeout(100)
    await page.keyboard.press(`${MOD}+ArrowRight`)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.type('X')
    const h = await html(page)
    expect(h).toMatch(/<p>[a-z]*X[a-z]*<\/p>/)
    expect((h.match(/<p>/g) ?? []).length, 'no extra paragraph inserted').toBe(1)
  })

  test('clicking under a trailing code block starts a paragraph', async ({ page }) => {
    await open(page)
    await page.keyboard.type('```')
    await typeCode(page, 'code')
    const box = (await page.locator('.demo-notion .demo-page-notion').boundingBox())!
    await page.mouse.click(box.x + box.width / 2, box.y + box.height - 6)
    await page.keyboard.type('after')
    expect(await html(page)).toMatch(/<\/pre>[\s\S]*after/)
  })

  test('clicking under a trailing table starts a paragraph', async ({ page }) => {
    await open(page)
    await runSlash(page, 'table')
    const box = (await page.locator('.demo-notion .demo-page-notion').boundingBox())!
    await page.mouse.click(box.x + box.width / 2, box.y + box.height - 6)
    await page.keyboard.type('after')
    expect(await html(page)).toMatch(/<\/table>[\s\S]*after/)
  })

  test('Backspace at the head of a code block turns it back into a paragraph', async ({ page }) => {
    await open(page)
    await page.keyboard.type('```')
    await typeCode(page, 'x')
    await toLineStart(page, 'ArrowLeft')
    await page.keyboard.press('Backspace')
    expect(await html(page)).not.toContain('<pre')
  })

  test('Mod+Enter leaves a code block without a stray line break', async ({ page }) => {
    await open(page)
    await page.keyboard.type('```')
    await typeCode(page, 'code')
    await page.keyboard.press(`${MOD}+Enter`)
    await page.keyboard.type('after')
    expect(await html(page)).toContain('<p>after</p>')
  })

  test('Mod+Enter outside code still inserts a line break', async ({ page }) => {
    await open(page)
    await page.keyboard.type('one')
    await page.keyboard.press(`${MOD}+Enter`)
    await page.keyboard.type('two')
    expect(await html(page)).toBe('<p>one<br>two</p>')
  })
})

test.describe('Tab', () => {
  test('indents inside a code block instead of moving focus away', async ({ page }) => {
    await open(page)
    await page.keyboard.type('```')
    await typeCode(page, 'a')
    await page.keyboard.press('Tab')
    await page.keyboard.type('b')
    expect(await page.locator(`${ED} code`).innerText()).toBe('a  b')
  })

  test('Shift+Tab takes one indent step off the line', async ({ page }) => {
    await open(page)
    await page.keyboard.type('```')
    await typeCode(page, 'a')
    await toLineStart(page, `${MOD}+ArrowLeft`)
    await page.keyboard.press('Tab')
    expect(await page.locator(`${ED} code`).innerText()).toBe('  a')
    await page.keyboard.press('Shift+Tab')
    expect(await page.locator(`${ED} code`).innerText()).toBe('a')
  })

  test('still nests lists outside a code block', async ({ page }) => {
    await open(page)
    await page.keyboard.type('- one')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Tab')
    await page.keyboard.type('nested')
    expect(await html(page)).toMatch(/<ul[\s\S]*<ul/)
  })

  test('adds a row when pressed in the last table cell', async ({ page }) => {
    await open(page)
    await runSlash(page, 'table')
    const before = await page.locator(`${ED} tr`).count()
    await page.locator(`${ED} td, ${ED} th`).last().click()
    await page.waitForTimeout(150)
    await page.keyboard.press('Tab')
    expect(await page.locator(`${ED} tr`).count()).toBe(before + 1)
  })

  test('walks to the next cell without growing the table', async ({ page }) => {
    await open(page)
    await runSlash(page, 'table')
    const rows = await page.locator(`${ED} tr`).count()
    await page.locator(`${ED} th`).first().click()
    await page.waitForTimeout(150)
    await page.keyboard.press('Tab')
    await page.keyboard.type('second cell')
    expect(await page.locator(`${ED} tr`).count()).toBe(rows)
    expect(await page.locator(`${ED} th`).nth(1).innerText()).toContain('second cell')
  })
})

test.describe('markdown rules', () => {
  test('"---" becomes a divider on the third character', async ({ page }) => {
    await open(page)
    await page.keyboard.type('---')
    expect(await html(page)).toContain('<hr')
  })

  test('"***" and "___" are dividers too', async ({ page }) => {
    await open(page)
    await page.keyboard.type('***')
    expect(await html(page), 'asterisks').toContain('<hr')
    await open(page)
    await page.keyboard.type('___')
    expect(await html(page), 'underscores').toContain('<hr')
  })

  test('Backspace undoes the rule and restores the literal text', async ({ page }) => {
    await open(page)
    await page.keyboard.type('# ')
    expect(await html(page), 'heading applied').toContain('<h1')
    await page.keyboard.press('Backspace')
    const h = await html(page)
    expect(h, 'back to a paragraph').not.toContain('<h1')
    expect(h, 'characters restored').toContain('#')
  })

  test('Backspace elsewhere still deletes a character', async ({ page }) => {
    await open(page)
    await page.keyboard.type('abc')
    await page.keyboard.press('Backspace')
    expect(await page.locator(ED).innerText()).toBe('ab')
  })
})

test.describe('clicking below the content', () => {
  test('a drag that ends below the content selects text instead of adding a block', async ({
    page,
  }) => {
    await open(page)
    await page.keyboard.type('select me')
    const p = (await page.locator(`${ED} p`).first().boundingBox())!
    const stage = (await page.locator('.demo-notion .demo-page-notion').boundingBox())!
    await page.mouse.move(p.x + 4, p.y + p.height / 2)
    await page.mouse.down()
    await page.mouse.move(p.x + 70, p.y + p.height / 2, { steps: 8 })
    await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height - 6, { steps: 10 })
    await page.mouse.up()
    expect(await page.evaluate(() => window.getSelection()?.toString() ?? '')).toContain('elect')
    expect((await html(page)).match(/<p>/g) ?? [], 'no paragraph appended').toHaveLength(1)
  })
})
