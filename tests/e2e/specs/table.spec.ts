import { expect, test, type Locator, type Page } from '@playwright/test'
import * as os from 'node:os'
import { clickToolbar } from './_helpers'

const MOD = os.platform() === 'darwin' ? 'Meta' : 'Control'

async function focusEditor(page: Page) {
  const editor = page.locator('.editor .ProseMirror')
  await editor.click()
  await page.keyboard.press(`${MOD}+a`)
  await page.keyboard.press('Delete')
  return editor
}

async function openTableMenu(page: Page) {
  await clickToolbar(page, 'title="Insert table"')
}

async function insertViaGrid(page: Page, rows: number, cols: number) {
  await openTableMenu(page)
  const panel = page.locator('.tb-table-menu')
  await expect(panel).toBeVisible()
  const grid = panel.locator('.tb-table-grid')
  const cells = grid.locator('.tb-cell')
  const idx = (rows - 1) * 10 + (cols - 1)
  await cells.nth(idx).click()
}

async function insertViaCustom(page: Page, rows: number, cols: number) {
  await openTableMenu(page)
  const panel = page.locator('.tb-table-menu')
  await expect(panel).toBeVisible()
  const inputs = panel.locator('input[type="number"]')
  await inputs.nth(0).fill(String(rows))
  await inputs.nth(1).fill(String(cols))
  await panel.locator('.tb-table-insert').click()
}

async function tableBox(locator: Locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Table has no bounding box')
  return box
}

async function waitForCorner(page: Page) {
  await page.waitForSelector('.richkit-table-corner', { state: 'attached' })
  await page.waitForFunction(() => {
    const c = document.querySelector('.richkit-table-corner') as HTMLElement | null
    if (!c) return false
    const r = c.getBoundingClientRect()
    return r.x > 0 && r.y > 0
  })
}

async function dragElement(page: Page, selector: string, dx: number, dy: number, steps = 12) {
  await page.evaluate(
    ({ selector, dx, dy, steps }) => {
      const target = document.querySelector(selector) as HTMLElement | null
      if (!target) throw new Error('Drag target missing: ' + selector)
      const r = target.getBoundingClientRect()
      const x0 = r.left + r.width / 2
      const y0 = r.top + r.height / 2
      const fire = (type: string, x: number, y: number, on: EventTarget = document) => {
        on.dispatchEvent(
          new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
            buttons: type === 'mouseup' ? 0 : 1,
            button: 0,
            view: window,
          }),
        )
      }
      fire('mousedown', x0, y0, target)
      for (let i = 1; i <= steps; i++) {
        const x = x0 + (dx * i) / steps
        const y = y0 + (dy * i) / steps
        fire('mousemove', x, y)
      }
      fire('mouseup', x0 + dx, y0 + dy)
    },
    { selector, dx, dy, steps },
  )
  await page.waitForTimeout(80)
}

test.describe('table insert', () => {
  test('inserts default 3×3 from toolbar grid', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertViaGrid(page, 3, 3)
    const table = page.locator('.editor table').first()
    await expect(table).toBeVisible()
    const rowCount = await table.locator('tr').count()
    const firstRowCells = await table.locator('tr').first().locator('th, td').count()
    expect(rowCount).toBe(3)
    expect(firstRowCells).toBe(3)
  })

  test('inserts custom 5×4 via inputs', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertViaCustom(page, 5, 4)
    const table = page.locator('.editor table').first()
    await expect(table).toBeVisible()
    expect(await table.locator('tr').count()).toBe(5)
    expect(await table.locator('tr').first().locator('th, td').count()).toBe(4)
  })

  test('first row is header (th cells)', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertViaGrid(page, 2, 3)
    const headers = page.locator('.editor table tr').first().locator('th')
    expect(await headers.count()).toBe(3)
  })

  test('preserves existing paragraph text when inserting after it', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('Existing paragraph')
    await insertViaGrid(page, 2, 2)
    await expect(page.locator('.editor')).toContainText('Existing paragraph')
    await expect(page.locator('.editor table').first()).toBeVisible()
  })
})

test.describe('table corner resize', () => {
  test('corner handle becomes visible after insert', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertViaGrid(page, 3, 3)
    await expect(page.locator('.richkit-table-corner').first()).toBeVisible()
  })

  test('corner drag right enlarges table width', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertViaGrid(page, 2, 3)
    const table = page.locator('.editor table').first()
    const before = await tableBox(table)
    await waitForCorner(page)
    await dragElement(page, '.richkit-table-corner', 120, 0)
    const after = await tableBox(table)
    expect(after.width).toBeGreaterThan(before.width + 40)
  })

  test('corner drag down enlarges row heights', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertViaGrid(page, 2, 2)
    const table = page.locator('.editor table').first()
    const before = await tableBox(table)
    await waitForCorner(page)
    await dragElement(page, '.richkit-table-corner', 0, 120)
    const after = await tableBox(table)
    expect(after.height).toBeGreaterThan(before.height + 40)
  })

  test('corner drag diagonal grows both dimensions', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertViaGrid(page, 2, 2)
    const table = page.locator('.editor table').first()
    const before = await tableBox(table)
    await waitForCorner(page)
    await dragElement(page, '.richkit-table-corner', 100, 100)
    const after = await tableBox(table)
    expect(after.width).toBeGreaterThan(before.width + 20)
    expect(after.height).toBeGreaterThan(before.height + 20)
  })

  test('corner drag clamps to editor width (never exceeds)', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertViaGrid(page, 2, 2)
    const editor = page.locator('.editor .ProseMirror').first()
    const editorBox = await editor.boundingBox()
    if (!editorBox) throw new Error('Editor missing')
    await waitForCorner(page)
    await dragElement(page, '.richkit-table-corner', 3000, 0)
    const table = page.locator('.editor table').first()
    const after = await tableBox(table)
    expect(after.x + after.width).toBeLessThanOrEqual(editorBox.x + editorBox.width + 4)
  })

  test('row handle drag enlarges only that row', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertViaGrid(page, 3, 2)
    await waitForCorner(page)
    const rows = page.locator('.editor table tr')
    const firstBefore = await rows.nth(0).boundingBox()
    const secondBefore = await rows.nth(1).boundingBox()
    if (!firstBefore || !secondBefore) throw new Error('Rows missing')
    await dragElement(page, '.richkit-table-row-handle:nth-of-type(1)', 0, 60).catch(async () => {
      await dragElement(page, '.richkit-table-row-handle', 0, 60)
    })
    const firstAfter = await rows.nth(0).boundingBox()
    const secondAfter = await rows.nth(1).boundingBox()
    if (!firstAfter || !secondAfter) throw new Error('Rows missing post')
    expect(firstAfter.height).toBeGreaterThan(firstBefore.height + 20)
    expect(Math.abs(secondAfter.height - secondBefore.height)).toBeLessThan(10)
  })

  test('editor stays within viewport even after big drag', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertViaGrid(page, 2, 4)
    await waitForCorner(page)
    await dragElement(page, '.richkit-table-corner', 3000, 200)
    const editorShell = page.locator('.editor-shell').first()
    const shellBox = await editorShell.boundingBox()
    const viewport = page.viewportSize()
    if (!shellBox || !viewport) throw new Error('Missing box')
    expect(shellBox.x + shellBox.width).toBeLessThanOrEqual(viewport.width + 4)
  })

  test('corner drag minimum enforced (cannot shrink below floor)', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertViaGrid(page, 2, 2)
    const table = page.locator('.editor table').first()
    await waitForCorner(page)
    await dragElement(page, '.richkit-table-corner', -9999, -9999)
    const after = await tableBox(table)
    expect(after.width).toBeGreaterThanOrEqual(2 * 40 - 8)
    expect(after.height).toBeGreaterThanOrEqual(2 * 24 - 8)
  })

  test('resize persists across a follow-up transaction', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertViaGrid(page, 2, 2)
    await waitForCorner(page)
    await dragElement(page, '.richkit-table-corner', 80, 60)

    const table = page.locator('.editor table').first()
    const widthBefore = (await tableBox(table)).width

    await page.locator('.editor table th').first().click()
    await page.keyboard.type('A')

    const widthAfter = (await tableBox(table)).width
    expect(Math.abs(widthAfter - widthBefore)).toBeLessThan(8)
  })
})
