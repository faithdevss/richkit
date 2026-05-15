import { expect, test, type Page } from '@playwright/test'
import { focusEditor } from './_helpers'

async function insertTable(page: Page, rows = 3, cols = 3) {
  await page.locator('.toolbar .tb-btn[title="Insert table"]').first().click()
  const idx = (rows - 1) * 10 + (cols - 1)
  await page.locator('.tb-table-menu .tb-cell').nth(idx).click()
  await page.waitForSelector('.editor table')
  await page.locator('.editor table th').first().click()
}

test.describe('table edit via Table menu', () => {
  test('add row after', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 2)
    await page.locator('.menubar-trigger:has-text("Table")').click()
    await page.locator('.menu-item:has-text("Add row after")').click()
    await expect(page.locator('.editor table tr')).toHaveCount(3)
  })

  test('add row before', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 2)
    await page.locator('.menubar-trigger:has-text("Table")').click()
    await page.locator('.menu-item:has-text("Add row before")').click()
    await expect(page.locator('.editor table tr')).toHaveCount(3)
  })

  test('add column after', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 2)
    await page.locator('.menubar-trigger:has-text("Table")').click()
    await page.locator('.menu-item:has-text("Add column after")').click()
    const firstRowCells = page.locator('.editor table tr').first().locator('th, td')
    await expect(firstRowCells).toHaveCount(3)
  })

  test('add column before', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 2)
    await page.locator('.menubar-trigger:has-text("Table")').click()
    await page.locator('.menu-item:has-text("Add column before")').click()
    const firstRowCells = page.locator('.editor table tr').first().locator('th, td')
    await expect(firstRowCells).toHaveCount(3)
  })

  test('delete row', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 3, 2)
    await page.locator('.editor table tr').nth(1).locator('td').first().click()
    await page.locator('.menubar-trigger:has-text("Table")').click()
    await page.locator('.menu-item:has-text("Delete row")').click()
    await expect(page.locator('.editor table tr')).toHaveCount(2)
  })

  test('delete column', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 3)
    await page.locator('.editor table th').nth(1).click()
    await page.locator('.menubar-trigger:has-text("Table")').click()
    await page.locator('.menu-item:has-text("Delete column")').click()
    const firstRowCells = page.locator('.editor table tr').first().locator('th, td')
    await expect(firstRowCells).toHaveCount(2)
  })

  test('delete table', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 2)
    await page.locator('.menubar-trigger:has-text("Table")').click()
    await page.locator('.menu-item:has-text("Delete table")').click()
    await expect(page.locator('.editor table')).toHaveCount(0)
  })

  test('toggle header row', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 2)
    const headersBefore = await page.locator('.editor table th').count()
    await page.locator('.menubar-trigger:has-text("Table")').click()
    await page.locator('.menu-item:has-text("Toggle header row")').click()
    const headersAfter = await page.locator('.editor table th').count()
    expect(headersAfter).not.toBe(headersBefore)
  })
})
