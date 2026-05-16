import { expect, test } from '@playwright/test'
import { focusEditor } from './_helpers'

async function addCommentViaBubble(page: import('@playwright/test').Page, body: string) {
  await page.locator('.bubble-menu button[title="Add comment"]').click()
  const composer = page.locator('.re-comment-composer')
  await expect(composer).toBeVisible()
  await composer.locator('textarea').fill(body)
  await composer.locator('button:has-text("Comment")').click()
}

test('comments sidebar has close button and closes on click', async ({ page }) => {
  await page.goto('/')
  await focusEditor(page)
  await page.keyboard.type('Hello world')
  await page.keyboard.press('Home')
  await page.keyboard.down('Shift')
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight')
  await page.keyboard.up('Shift')
  await addCommentViaBubble(page, 'rev')

  await expect(page.locator('.re-comments-sidebar')).toBeVisible()
  const closeBtn = page.locator('.re-comments-sidebar .re-sidebar-close')
  await expect(closeBtn).toBeVisible()
  await closeBtn.click()
  await expect(page.locator('.re-comments-sidebar')).toHaveCount(0)
})

test('suggestions sidebar has close button', async ({ page }) => {
  await page.goto('/')
  await focusEditor(page)
  await page.locator('.menubar-trigger:has-text("View")').click()
  await page.locator('.menu-item:has-text("Suggestions panel")').click()

  await expect(page.locator('.re-suggestions-sidebar')).toBeVisible()
  const closeBtn = page.locator('.re-suggestions-sidebar .re-sidebar-close')
  await expect(closeBtn).toBeVisible()
  await closeBtn.click()
  await expect(page.locator('.re-suggestions-sidebar')).toHaveCount(0)
})
