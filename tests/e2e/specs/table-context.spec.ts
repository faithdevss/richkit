import { expect, test, type Page } from '@playwright/test'
import { clickToolbar, focusEditor } from './_helpers'

async function insertTable(page: Page, rows = 2, cols = 2) {
  await clickToolbar(page, 'title="Insert table"')
  const panel = page.locator('.tb-table-menu')
  await expect(panel).toBeVisible()
  const idx = (rows - 1) * 10 + (cols - 1)
  await panel.locator('.tb-table-grid .tb-cell').nth(idx).click()
  await page.waitForSelector('.editor table')
}

async function rightClickFirstCell(page: Page) {
  const cell = page.locator('.editor table').first().locator('td, th').first()
  await cell.click()
  await cell.click({ button: 'right' })
}

test.describe('table context menu', () => {
  test('right-click inside table opens menu', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page)
    await rightClickFirstCell(page)

    const menu = page.locator('.richkit-table-ctx')
    await expect(menu).toBeVisible()
    await expect(menu.locator('button:has-text("Select table")')).toBeVisible()
    await expect(menu.locator('button:has-text("Cut")')).toBeVisible()
    await expect(menu.locator('button:has-text("Copy")')).toBeVisible()
    await expect(menu.locator('button:has-text("Delete table")')).toBeVisible()
  })

  test('Delete table removes the table', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page)
    await expect(page.locator('.editor table')).toHaveCount(1)

    await rightClickFirstCell(page)
    await page.locator('.richkit-table-ctx button:has-text("Delete table")').click()
    await expect(page.locator('.editor table')).toHaveCount(0)
  })

  test('Select table creates NodeSelection on table', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page)
    await rightClickFirstCell(page)
    await page.locator('.richkit-table-ctx button:has-text("Select table")').click()
    await page.waitForTimeout(100)

    const info = await page.evaluate(() => {
      const w = window as unknown as {
        __editor?: {
          state: {
            selection: {
              from: number
              to: number
              empty: boolean
              $anchorCell?: unknown
              $headCell?: unknown
            }
            doc: { nodeAt: (n: number) => unknown }
          }
        }
      }
      const sel = w.__editor?.state.selection
      if (!sel) return null
      return {
        from: sel.from,
        to: sel.to,
        ctor: (sel.constructor as { name: string }).name,
        isCellSel: !!sel.$anchorCell,
        empty: sel.empty,
      }
    })
    expect(info).not.toBeNull()
    expect(info!.isCellSel || info!.ctor.includes('NodeSelection')).toBe(true)
  })

  test('Escape closes menu', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page)
    await rightClickFirstCell(page)
    await expect(page.locator('.richkit-table-ctx')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('.richkit-table-ctx')).toBeHidden()
  })

  test('Add row above adds row', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 2)
    await expect(page.locator('.editor table tr')).toHaveCount(2)

    await rightClickFirstCell(page)
    await page.locator('.richkit-table-ctx button:has-text("Add row above")').click()
    await expect(page.locator('.editor table tr')).toHaveCount(3)
  })

  test('Delete row removes one row', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 3, 2)
    await expect(page.locator('.editor table tr')).toHaveCount(3)

    await rightClickFirstCell(page)
    await page.locator('.richkit-table-ctx button:has-text("Delete row")').click()
    await expect(page.locator('.editor table tr')).toHaveCount(2)
  })

  test('Outside click closes menu', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page)
    await rightClickFirstCell(page)
    await expect(page.locator('.richkit-table-ctx')).toBeVisible()

    await page.mouse.click(10, 10)
    await expect(page.locator('.richkit-table-ctx')).toBeHidden()
  })
})

test.describe('vertical resize sanity', () => {
  test('corner drag down increases table height', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 2)
    await page.waitForSelector('.richkit-table-corner')
    await page.waitForTimeout(150)

    const before = await page.locator('.editor table').first().boundingBox()
    if (!before) throw new Error('no table box')

    await page.evaluate((dy) => {
      const corner = document.querySelector('.richkit-table-corner') as HTMLElement | null
      if (!corner) throw new Error('no corner')
      const r = corner.getBoundingClientRect()
      const x = r.left + r.width / 2
      const y = r.top + r.height / 2
      const fire = (type: string, cx: number, cy: number, on: EventTarget = document) => {
        on.dispatchEvent(
          new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: cx,
            clientY: cy,
            buttons: type === 'mouseup' ? 0 : 1,
            button: 0,
            view: window,
          }),
        )
      }
      fire('mousedown', x, y, corner)
      for (let i = 1; i <= 12; i++) fire('mousemove', x, y + (dy * i) / 12)
      fire('mouseup', x, y + dy)
    }, 150)

    await page.waitForTimeout(150)
    const after = await page.locator('.editor table').first().boundingBox()
    if (!after) throw new Error('no table box after')
    expect(after.height).toBeGreaterThan(before.height + 40)
  })

  test('row handle drag increases that row height only', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 3, 2)
    await page.waitForSelector('.richkit-table-row-handle')
    await page.waitForTimeout(150)

    const rowBefore = await page.locator('.editor table tr').nth(0).boundingBox()
    if (!rowBefore) throw new Error('no row box')

    await page.evaluate((dy) => {
      const handle = document.querySelectorAll('.richkit-table-row-handle')[0] as HTMLElement | null
      if (!handle) throw new Error('no row handle')
      const r = handle.getBoundingClientRect()
      const x = r.left + r.width / 2
      const y = r.top + r.height / 2
      const fire = (type: string, cx: number, cy: number, on: EventTarget = document) => {
        on.dispatchEvent(
          new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: cx,
            clientY: cy,
            buttons: type === 'mouseup' ? 0 : 1,
            button: 0,
            view: window,
          }),
        )
      }
      fire('mousedown', x, y, handle)
      for (let i = 1; i <= 12; i++) fire('mousemove', x, y + (dy * i) / 12)
      fire('mouseup', x, y + dy)
    }, 80)

    await page.waitForTimeout(150)
    const rowAfter = await page.locator('.editor table tr').nth(0).boundingBox()
    if (!rowAfter) throw new Error('no row box after')
    expect(rowAfter.height).toBeGreaterThan(rowBefore.height + 20)
  })
})
