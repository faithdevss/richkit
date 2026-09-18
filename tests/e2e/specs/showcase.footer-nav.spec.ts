import { expect, test } from '@playwright/test'

/**
 * The footer sits at the bottom of the page, so every link in it is clicked
 * from a scrolled position. Client-side navigation does not reset scroll on
 * its own, and React Router only acts on a hash inside <ScrollRestoration />,
 * which this app does not use -- so both behaviours are ours to provide.
 */

const ROUTE_LINKS = [
  ['Editor', '/docs/core-concepts'],
  ['Extensions', '/docs/extensions'],
  ['Agent', '/docs/usecases/agent-workflows'],
  ['Notion-like', '/docs/usecases/notion-blocks'],
  ['Introduction', '/docs/introduction'],
  ['Installation', '/docs/installation'],
  ['Core concepts', '/docs/core-concepts'],
  ['Styling', '/docs/styling'],
  ['Comparison', '/docs/comparison'],
] as const

// label -> the row id the link points at, per column
const ANCHOR_LINKS = [
  ['Product', 'Docx', 'pkg-docx'],
  ['Product', 'Markdown', 'pkg-markdown'],
  ['Packages', 'core', 'pkg-core'],
  ['Packages', 'react', 'pkg-react'],
  ['Packages', 'starter-kit', 'pkg-starter-kit'],
  ['Packages', 'docx', 'pkg-docx'],
] as const

/** Click a footer link from the bottom of the page, the way a reader would. */
async function clickInFooter(page: import('@playwright/test').Page, column: string, label: string) {
  const col = page.locator('.foot-col').filter({ hasText: column })
  const link = col.getByRole('link', { name: label, exact: true })
  await link.scrollIntoViewIfNeeded()
  await expect(link).toBeVisible()
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  await link.click()
}

test.describe('footer navigation', () => {
  for (const [label, href] of ROUTE_LINKS) {
    test(`"${label}" opens ${href} at the top of the page`, async ({ page }) => {
      await page.goto('/docs/introduction')
      const col = page
        .locator('.foot-col')
        .filter({ has: page.getByRole('link', { name: label, exact: true }) })
        .first()
      const link = col.getByRole('link', { name: label, exact: true }).first()
      await link.scrollIntoViewIfNeeded()
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
      await link.click()

      await expect(page).toHaveURL(new RegExp(`${href}$`))
      // the destination must render, not just route
      await expect(page.locator('.docs-content')).toBeVisible()
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5)
    })
  }

  for (const [column, label, anchor] of ANCHOR_LINKS) {
    test(`"${label}" under ${column} scrolls to #${anchor}`, async ({ page }) => {
      await page.goto('/docs/introduction')
      await clickInFooter(page, column, label)

      await expect(page).toHaveURL(new RegExp(`/docs/extensions#${anchor}$`))
      const row = page.locator(`#${anchor}`)
      await expect(row).toBeVisible()

      // the row it names must actually be on screen, not just in the URL
      await expect
        .poll(async () => {
          const box = await row.boundingBox()
          const height = page.viewportSize()?.height ?? 0
          return box && box.y >= 0 && box.y < height
        })
        .toBe(true)
    })
  }

  test('a hash with no matching row falls back to the top', async ({ page }) => {
    await page.goto('/docs/introduction')
    await page.evaluate(() => window.scrollTo(0, 800))
    await page.evaluate(() => {
      window.history.pushState({}, '', '/docs/extensions#pkg-does-not-exist')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5)
  })
})
