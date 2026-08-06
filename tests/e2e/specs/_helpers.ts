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
