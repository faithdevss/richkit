import type { Page } from '@playwright/test'
import * as os from 'node:os'

export const MOD = os.platform() === 'darwin' ? 'Meta' : 'Control'

export async function focusEditor(page: Page) {
  await page.evaluate(() => {
    try {
      localStorage.removeItem('richkit:draft')
    } catch {
      // ignore
    }
  })
  await page.reload()
  const editor = page.locator('.editor .ProseMirror')
  await editor.click()
  await page.keyboard.press(`${MOD}+a`)
  await page.keyboard.press('Delete')
  return editor
}

export async function getHtml(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.querySelector('.editor .ProseMirror') as HTMLElement
    return el?.innerHTML ?? ''
  })
}

export async function openMenu(page: Page, label: string) {
  await page.locator(`.menubar-trigger:has-text("${label}")`).first().click()
}

export async function clickMenuItem(page: Page, label: string) {
  await page.locator(`.menu-item:has-text("${label}")`).first().click()
}

export async function clickSubMenu(page: Page, parentLabel: string, label: string) {
  await page.locator(`.menu-item:has-text("${parentLabel}")`).first().hover()
  await page.locator(`.menu-submenu .menu-item:has-text("${label}")`).first().click()
}

/**
 * Click a toolbar button by attribute selector (e.g. `title="Bullet list"`).
 * A narrow window parks the trailing groups in the "more" popover, so fall
 * back to opening those before giving up.
 */
export async function clickToolbar(page: Page, attr: string) {
  const direct = page.locator(`.toolbar .tb-btn[${attr}]`).first()
  if (await direct.isVisible()) {
    await direct.click()
    return
  }
  const more = page.locator('.toolbar .tb-more-btn')
  for (let i = 0; i < (await more.count()); i++) {
    await more.nth(i).click()
    const inPanel = page.locator(`.tb-more-panel .tb-btn[${attr}]`).first()
    if (await inPanel.isVisible()) {
      await inPanel.click()
      return
    }
    await more.nth(i).click()
  }
  throw new Error(`toolbar button not found: ${attr}`)
}
