import { expect, test, type Page } from '@playwright/test'
import { focusEditor } from './_helpers'

async function insertTable(page: Page, rows = 2, cols = 3) {
  await page.locator('.toolbar .tb-btn[title="Insert table"]').first().click()
  const panel = page.locator('.tb-table-menu')
  await expect(panel).toBeVisible()
  const idx = (rows - 1) * 10 + (cols - 1)
  await panel.locator('.tb-table-grid .tb-cell').nth(idx).click()
  await page.waitForSelector('.editor table')
  // sticky toolbar occludes the table's top rows at default scroll; posAtCoords
  // then resolves to the wrong element and the resize plugin never engages
  await page.evaluate(() => {
    document.querySelector('.editor table')?.scrollIntoView({ block: 'center' })
  })
  await page.waitForTimeout(50)
}

async function dragColumnBoundary(page: Page, columnIndex: number, dx: number) {
  await page.evaluate(
    ({ columnIndex, dx }) => {
      const table = document.querySelector('.editor table') as HTMLTableElement | null
      if (!table) throw new Error('no table')
      const firstRowCells = Array.from(table.rows[0]!.cells)
      const cell = firstRowCells[columnIndex]
      if (!cell) throw new Error('no cell at ' + columnIndex)
      const r = cell.getBoundingClientRect()
      const startX = r.right - 1
      const startY = r.top + r.height / 2

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

      fire('mousemove', startX, startY, cell)
      fire('mousemove', startX, startY)
      fire('mousedown', startX, startY, cell)
      const steps = 12
      for (let i = 1; i <= steps; i++) {
        fire('mousemove', startX + (dx * i) / steps, startY)
      }
      fire('mouseup', startX + dx, startY)
    },
    { columnIndex, dx },
  )
  await page.waitForTimeout(120)
}

async function colWidth(page: Page, columnIndex: number): Promise<number> {
  return page.evaluate((columnIndex) => {
    const table = document.querySelector('.editor table') as HTMLTableElement | null
    if (!table) return 0
    const row = table.rows[0]
    if (!row) return 0
    const cell = row.cells[columnIndex]
    if (!cell) return 0
    return Math.round(cell.getBoundingClientRect().width)
  }, columnIndex)
}

async function tableWidth(page: Page): Promise<number> {
  return page.evaluate(() => {
    const t = document.querySelector('.editor table') as HTMLTableElement | null
    return t ? Math.round(t.getBoundingClientRect().width) : 0
  })
}

test.describe('table column resize (horizontal)', () => {
  test('hovering near column boundary adds resize-cursor class', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 3)
    await page.waitForTimeout(100)

    await page.evaluate(() => {
      const cell = document.querySelector('.editor table tr td, .editor table tr th') as HTMLElement
      const r = cell.getBoundingClientRect()
      cell.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: r.right - 1,
          clientY: r.top + r.height / 2,
          view: window,
        }),
      )
    })
    await page.waitForTimeout(50)
    const hasCls = await page.evaluate(() => {
      return document.querySelector('.editor .ProseMirror')?.classList.contains('resize-cursor') ?? false
    })
    expect(hasCls).toBe(true)
  })

  test('drag first column boundary right increases column 0 width', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 3)
    await page.waitForTimeout(100)

    const before = await colWidth(page, 0)
    await dragColumnBoundary(page, 0, 80)
    const after = await colWidth(page, 0)
    expect(after).toBeGreaterThan(before + 40)
  })

  test('drag first column boundary right keeps column 1 unchanged', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 3)
    await page.waitForTimeout(100)

    const beforeC1 = await colWidth(page, 1)
    await dragColumnBoundary(page, 0, 60)
    const afterC1 = await colWidth(page, 1)
    expect(Math.abs(afterC1 - beforeC1)).toBeLessThan(8)
  })

  test('drag first column boundary left shrinks column 0', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 3)
    await page.waitForTimeout(100)

    const before = await colWidth(page, 0)
    await dragColumnBoundary(page, 0, -40)
    const after = await colWidth(page, 0)
    expect(after).toBeLessThan(before - 20)
  })

  test('drag last column boundary right grows table width', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 3)
    await page.waitForTimeout(100)

    const before = await tableWidth(page)
    await dragColumnBoundary(page, 2, 60)
    const after = await tableWidth(page)
    expect(after).toBeGreaterThan(before + 30)
  })

  test('column width cannot shrink below minimum', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 3)
    await page.waitForTimeout(100)

    await dragColumnBoundary(page, 0, -500)
    const after = await colWidth(page, 0)
    expect(after).toBeGreaterThanOrEqual(20)
  })

  test('huge last-column drag stays contained by tableWrapper scroll', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 3)
    await page.waitForTimeout(100)

    const editorWidthBefore = await page.evaluate(
      () => (document.querySelector('.editor .ProseMirror') as HTMLElement).clientWidth,
    )

    await dragColumnBoundary(page, 2, 5000)

    const editorWidthAfter = await page.evaluate(
      () => (document.querySelector('.editor .ProseMirror') as HTMLElement).clientWidth,
    )
    const wrapperOverflow = await page.evaluate(() => {
      const w = document.querySelector('.editor .tableWrapper') as HTMLElement | null
      if (!w) return null
      return getComputedStyle(w).overflowX
    })

    expect(editorWidthAfter).toBe(editorWidthBefore)
    expect(wrapperOverflow).toBe('auto')
  })

  test('column resize persists across DOM updates', async ({ page }) => {
    await page.goto('/')
    await focusEditor(page)
    await insertTable(page, 2, 3)
    await page.waitForTimeout(100)

    await dragColumnBoundary(page, 0, 70)
    const widthA = await colWidth(page, 0)

    const cell = page.locator('.editor table').first().locator('td, th').nth(1)
    await cell.click()
    await page.keyboard.type('typed text')
    await page.waitForTimeout(80)

    const widthB = await colWidth(page, 0)
    expect(Math.abs(widthB - widthA)).toBeLessThan(8)
  })
})
