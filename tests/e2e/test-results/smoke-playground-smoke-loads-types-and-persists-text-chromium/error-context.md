# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> playground smoke >> loads, types, and persists text
- Location: specs/smoke.spec.ts:15:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.editor .ProseMirror')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:import-analysis] Failed to resolve import \"@rich-editor/extension-slash-commands\" from \"src/App.tsx\". Does the file exist?"
  - generic [ref=e5]: /Users/saimumislam/Desktop/faithdevs/rich_editor/apps/playground/src/App.tsx:12:37
  - generic [ref=e6]: "27 | useEditor 28 | } from \"@rich-editor/react\"; 29 | import { buildDefaultCommands } from \"@rich-editor/extension-slash-commands\"; | ^ 30 | import { StarterKit } from \"@rich-editor/starter-kit\"; 31 | import { useCallback, useEffect, useMemo, useState } from \"react\";"
  - generic [ref=e7]: at TransformPluginContext._formatError (file:///Users/saimumislam/Desktop/faithdevs/rich_editor/node_modules/.pnpm/vite@5.4.21_@types+node@22.19.19/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49258:41) at TransformPluginContext.error (file:///Users/saimumislam/Desktop/faithdevs/rich_editor/node_modules/.pnpm/vite@5.4.21_@types+node@22.19.19/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49253:16) at normalizeUrl (file:///Users/saimumislam/Desktop/faithdevs/rich_editor/node_modules/.pnpm/vite@5.4.21_@types+node@22.19.19/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64307:23) at process.processTicksAndRejections (node:internal/process/task_queues:105:5) at async file:///Users/saimumislam/Desktop/faithdevs/rich_editor/node_modules/.pnpm/vite@5.4.21_@types+node@22.19.19/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64439:39 at async Promise.all (index 4) at async TransformPluginContext.transform (file:///Users/saimumislam/Desktop/faithdevs/rich_editor/node_modules/.pnpm/vite@5.4.21_@types+node@22.19.19/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64366:7) at async PluginContainer.transform (file:///Users/saimumislam/Desktop/faithdevs/rich_editor/node_modules/.pnpm/vite@5.4.21_@types+node@22.19.19/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49099:18) at async loadAndTransform (file:///Users/saimumislam/Desktop/faithdevs/rich_editor/node_modules/.pnpm/vite@5.4.21_@types+node@22.19.19/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:51978:27) at async viteTransformMiddleware (file:///Users/saimumislam/Desktop/faithdevs/rich_editor/node_modules/.pnpm/vite@5.4.21_@types+node@22.19.19/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:62106:24
  - generic [ref=e8]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e9]: server.hmr.overlay
    - text: to
    - code [ref=e10]: "false"
    - text: in
    - code [ref=e11]: vite.config.ts
    - text: .
```

# Test source

```ts
  1  | import { expect, test, type Page } from '@playwright/test'
  2  | import * as os from 'node:os'
  3  | 
  4  | const MOD = os.platform() === 'darwin' ? 'Meta' : 'Control'
  5  | 
  6  | async function clearAndFocus(page: Page) {
  7  |   const editor = page.locator('.editor .ProseMirror')
> 8  |   await editor.click()
     |                ^ Error: locator.click: Test timeout of 30000ms exceeded.
  9  |   await page.keyboard.press(`${MOD}+a`)
  10 |   await page.keyboard.press('Delete')
  11 |   return editor
  12 | }
  13 | 
  14 | test.describe('playground smoke', () => {
  15 |   test('loads, types, and persists text', async ({ page }) => {
  16 |     await page.goto('/')
  17 |     const editor = await clearAndFocus(page)
  18 |     await page.keyboard.type('hello e2e')
  19 |     await expect(editor).toContainText('hello e2e')
  20 |     await expect(page.locator('.output pre')).toContainText('hello e2e')
  21 |   })
  22 | 
  23 |   test('Mod+B toggles bold', async ({ page }) => {
  24 |     await page.goto('/')
  25 |     await clearAndFocus(page)
  26 |     await page.keyboard.press(`${MOD}+b`)
  27 |     await page.keyboard.type('bolded')
  28 |     await expect(page.locator('.editor strong').first()).toHaveText('bolded')
  29 |   })
  30 | 
  31 |   test('markdown shortcut ## promotes to heading', async ({ page }) => {
  32 |     await page.goto('/')
  33 |     await clearAndFocus(page)
  34 |     await page.keyboard.type('## ')
  35 |     await page.keyboard.type('Heading from markdown')
  36 |     await expect(page.locator('.editor h2').first()).toHaveText('Heading from markdown')
  37 |   })
  38 | 
  39 |   test('markdown shortcut - starts bullet list', async ({ page }) => {
  40 |     await page.goto('/')
  41 |     await clearAndFocus(page)
  42 |     await page.keyboard.type('- ')
  43 |     await page.keyboard.type('first')
  44 |     await page.keyboard.press('Enter')
  45 |     await page.keyboard.type('second')
  46 |     const items = page.locator('.editor ul li')
  47 |     await expect(items).toHaveCount(2)
  48 |   })
  49 | 
  50 |   test('toolbar bold button toggles mark', async ({ page }) => {
  51 |     await page.goto('/')
  52 |     await clearAndFocus(page)
  53 |     await page.locator('.toolbar .tb-btn[title^="Bold"]').first().click()
  54 |     await page.keyboard.type('via-toolbar')
  55 |     await expect(page.locator('.editor strong').first()).toHaveText('via-toolbar')
  56 |   })
  57 | 
  58 |   test('inline code shortcut wraps text', async ({ page }) => {
  59 |     await page.goto('/')
  60 |     await clearAndFocus(page)
  61 |     await page.keyboard.type('`snippet` ')
  62 |     await expect(page.locator('.editor code').first()).toHaveText('snippet')
  63 |   })
  64 | })
  65 | 
```