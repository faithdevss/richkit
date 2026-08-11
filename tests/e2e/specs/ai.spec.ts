import { expect, test, type Page } from '@playwright/test'
import { focusEditor, getHtml, MOD } from './_helpers'

interface AIRequest {
  prompt: string
  selection: string
  documentText: string
}

declare global {
  interface Window {
    /** Test hook the playground reads instead of its local stub transport. */
    __aiComplete?: (req: AIRequest, opts: { signal: AbortSignal }) => AsyncIterable<string>
  }
}

/**
 * Swap in a deterministic transport before the app boots. No network call is
 * made anywhere in this spec — the "nothing phones home" claim on the docs
 * comparison page has to survive the AI feature.
 */
async function installTransport(page: Page, chunks: string[], delayMs = 5) {
  await page.addInitScript(
    ({ chunks, delayMs }) => {
      window.__aiComplete = async function* (_req: AIRequest, { signal }: { signal: AbortSignal }) {
        for (const chunk of chunks) {
          if (signal.aborted) return
          await new Promise((r) => setTimeout(r, delayMs))
          yield chunk
        }
      }
    },
    { chunks, delayMs },
  )
}

async function openPrompt(page: Page) {
  await page.locator('.editor .ProseMirror').click()
  await page.keyboard.press(`${MOD}+k`)
  await expect(page.locator('.ai-prompt')).toBeVisible()
}

test.describe('ai assistant', () => {
  test('Mod+K opens the prompt with presets', async ({ page }) => {
    await installTransport(page, ['x'])
    await page.goto('/')
    await focusEditor(page)
    await openPrompt(page)

    await expect(page.locator('.ai-prompt-preset')).not.toHaveCount(0)
    await expect(page.locator('.ai-prompt-input')).toBeFocused()
  })

  test('streams a completion into the document', async ({ page }) => {
    await installTransport(page, ['Hello', ' ', 'from', ' AI'])
    await page.goto('/')
    await focusEditor(page)
    await openPrompt(page)

    await page.locator('.ai-prompt-input').fill('write a greeting')
    await page.keyboard.press('Enter')

    await expect(page.locator('.editor .ProseMirror')).toContainText('Hello from AI')
  })

  test('streamed text is an attributed suggestion, not a silent edit', async ({ page }) => {
    await installTransport(page, ['generated'])
    await page.goto('/')
    await focusEditor(page)
    await openPrompt(page)

    await page.locator('.ai-prompt-input').fill('write something')
    await page.keyboard.press('Enter')
    await expect(page.locator('.editor .suggestion-insertion')).toHaveCount(1)

    const html = await getHtml(page)
    expect(html).toContain('data-suggestion-author="AI Assistant"')
  })

  test('Accept keeps the text and clears the suggestion marks', async ({ page }) => {
    await installTransport(page, ['kept text'])
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('original')
    await openPrompt(page)

    await page.locator('.ai-prompt-input').fill('add something')
    await page.keyboard.press('Enter')
    await expect(page.locator('.editor .suggestion-insertion')).toHaveCount(1)

    await page.locator('.ai-prompt-accept').click()

    await expect(page.locator('.editor .ProseMirror')).toContainText('kept text')
    await expect(page.locator('.editor .suggestion-insertion')).toHaveCount(0)
  })

  test('Reject removes the generated text', async ({ page }) => {
    await installTransport(page, ['DISCARD ME'])
    await page.goto('/')
    await focusEditor(page)
    await page.keyboard.type('original')
    await openPrompt(page)

    await page.locator('.ai-prompt-input').fill('add something')
    await page.keyboard.press('Enter')
    await expect(page.locator('.editor .suggestion-insertion')).toHaveCount(1)

    await page.locator('.ai-prompt-reject').click()

    await expect(page.locator('.editor .ProseMirror')).not.toContainText('DISCARD ME')
    await expect(page.locator('.editor .ProseMirror')).toContainText('original')
  })

  test('rewriting a selection keeps the original under a deletion mark', async ({ page }) => {
    await installTransport(page, ['replacement'])
    await page.goto('/')
    const editor = await focusEditor(page)
    await page.keyboard.type('replace this sentence')

    // select the whole paragraph, then rewrite it
    await editor.click()
    await page.keyboard.press(`${MOD}+a`)
    await page.keyboard.press(`${MOD}+k`)
    await expect(page.locator('.ai-prompt')).toBeVisible()
    await page.locator('.ai-prompt-input').fill('rewrite it')
    await page.keyboard.press('Enter')

    await expect(page.locator('.editor .suggestion-deletion')).toHaveCount(1)
    await expect(page.locator('.editor .suggestion-insertion')).toHaveCount(1)
    // the original survives until the suggestion is resolved
    await expect(editor).toContainText('replace this sentence')
    await expect(editor).toContainText('replacement')
  })

  test('Stop halts a stream partway', async ({ page }) => {
    await installTransport(page, ['one ', 'two ', 'three ', 'four ', 'five '], 60)
    await page.goto('/')
    await focusEditor(page)
    await openPrompt(page)

    await page.locator('.ai-prompt-input').fill('count')
    await page.keyboard.press('Enter')
    await page.locator('.ai-prompt-stop').click()

    const afterStop = await page.locator('.editor .ProseMirror').innerText()
    await page.waitForTimeout(400)
    expect(await page.locator('.editor .ProseMirror').innerText()).toBe(afterStop)
    expect(afterStop).not.toContain('five')
  })

  test('makes no external network requests', async ({ page }) => {
    const external: string[] = []
    page.on('request', (r) => {
      const url = r.url()
      if (
        !url.startsWith('http://localhost') &&
        !url.startsWith('data:') &&
        !url.startsWith('blob:')
      ) {
        external.push(url)
      }
    })

    await installTransport(page, ['text'])
    await page.goto('/')
    await focusEditor(page)
    await openPrompt(page)
    await page.locator('.ai-prompt-input').fill('write')
    await page.keyboard.press('Enter')
    await expect(page.locator('.editor .suggestion-insertion')).toHaveCount(1)

    expect(external).toEqual([])
  })
})
