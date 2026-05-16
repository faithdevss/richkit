import { expect, test, type Page } from '@playwright/test'
import { focusEditor } from './_helpers'

async function selectFirstWord(page: Page) {
  await page.locator('.editor .ProseMirror').click()
  await page.keyboard.press('Home')
  await page.keyboard.down('Shift')
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight')
  await page.keyboard.up('Shift')
}

async function addCommentViaBubble(page: Page, body: string) {
  const bubble = page.locator('.bubble-menu')
  await expect(bubble).toBeVisible()
  await bubble.locator('button[title="Add comment"]').click()
  const composer = page.locator('.re-comment-composer')
  await expect(composer).toBeVisible()
  await composer.locator('textarea').fill(body)
  await composer.locator('button:has-text("Comment")').click()
  await expect(composer).toBeHidden()
}

test.describe('comments', () => {
  test('comment sidebar not visible by default', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await expect(page.locator('.re-comments-sidebar')).toHaveCount(0)
  })

  test('bubble menu Add-comment button opens composer + sidebar', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('Hello world content here')

    await selectFirstWord(page)
    await addCommentViaBubble(page, 'first review')

    await expect(page.locator('.editor .comment-mark')).toHaveCount(1)
    await expect(page.locator('.re-comments-sidebar')).toBeVisible()
    await expect(page.locator('.re-comment-thread')).toHaveCount(1)
    await expect(page.locator('.re-comment-body')).toContainText('first review')
  })

  test('bubble menu hidden when nothing selected', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('Some text')
    await page.keyboard.press('End')
    await expect(page.locator('.bubble-menu')).toBeHidden()
  })

  test('sidebar overlays editor (absolute, not pushing)', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('Hello world content here')
    const editorWidthBefore = await page.evaluate(
      () => (document.querySelector('.editor .ProseMirror') as HTMLElement).clientWidth,
    )
    await selectFirstWord(page)
    await addCommentViaBubble(page, 'overlay test')
    const editorWidthAfter = await page.evaluate(
      () => (document.querySelector('.editor .ProseMirror') as HTMLElement).clientWidth,
    )
    expect(editorWidthAfter).toBe(editorWidthBefore)
    const pos = await page.evaluate(() => {
      const s = document.querySelector('.re-comments-sidebar') as HTMLElement
      return s ? getComputedStyle(s).position : ''
    })
    expect(pos).toBe('absolute')
  })

  test('resolve hides comment from open filter', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('Hello world here')
    await selectFirstWord(page)
    await addCommentViaBubble(page, 'rev')

    await expect(page.locator('.re-comment-thread')).toHaveCount(1)
    await page.locator('.re-comment-thread button:has-text("Resolve")').click()
    await expect(page.locator('.re-comment-thread')).toHaveCount(0)

    await page.locator('.re-comments-filter button:has-text("Resolved")').click()
    await expect(page.locator('.re-comment-thread')).toHaveCount(1)
  })

  test('reopen flips resolved back to open', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('Hello world here')
    await selectFirstWord(page)
    await addCommentViaBubble(page, 'rev')

    await page.locator('.re-comment-thread button:has-text("Resolve")').click()
    await page.locator('.re-comments-filter button:has-text("Resolved")').click()
    await page.locator('.re-comment-thread button:has-text("Reopen")').click()

    await page.locator('.re-comments-filter button:has-text("Open")').click()
    await expect(page.locator('.re-comment-thread')).toHaveCount(1)
  })

  test('reply input adds reply to thread', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('Hello world here')
    await selectFirstWord(page)
    await addCommentViaBubble(page, 'top')

    const reply = page.locator('.re-comment-reply input')
    await reply.fill('a reply')
    await reply.press('Enter')

    await expect(page.locator('.re-comment-replies li')).toHaveCount(1)
    await expect(page.locator('.re-comment-replies p')).toContainText('a reply')
  })

  test('delete removes thread and strips mark', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('Hello world here')
    await selectFirstWord(page)
    await addCommentViaBubble(page, 'rev')

    page.once('dialog', (d) => d.accept())
    await page.locator('.re-comment-thread button:has-text("Delete")').click()

    await expect(page.locator('.re-comment-thread')).toHaveCount(0)
    await expect(page.locator('.editor .comment-mark')).toHaveCount(0)
  })

  test('multiple comments coexist', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('alpha bravo charlie')

    await page.keyboard.press('Home')
    await page.keyboard.down('Shift')
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight')
    await page.keyboard.up('Shift')
    await addCommentViaBubble(page, 'on alpha')

    await page.locator('.editor .ProseMirror').click()
    await page.keyboard.press('End')
    await page.keyboard.down('Shift')
    for (let i = 0; i < 7; i++) await page.keyboard.press('ArrowLeft')
    await page.keyboard.up('Shift')
    await page.waitForTimeout(150)
    await addCommentViaBubble(page, 'on charlie')

    await expect(page.locator('.re-comment-thread')).toHaveCount(2)
    await expect(page.locator('.editor .comment-mark')).toHaveCount(2)
  })
})
