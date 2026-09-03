import { test, expect, type Page } from '@playwright/test'
import { MOD } from './_helpers'

/**
 * Feature coverage for the Notion-style editor demo, written against
 * docs/features.notion.md. Each `test.describe` mirrors a section of that
 * document so a failure names the feature that is missing rather than the
 * selector that moved.
 */

const ROUTE = '/docs/usecases/notion-blocks'
const ED = '.demo-notion .editor .ProseMirror'

/**
 * Loads the demo on a clean slate. `keepRecent` is for the one test that
 * checks the slash menu remembers commands across a reload.
 */
async function open(page: Page, { keepRecent = false } = {}) {
  await page.goto(ROUTE, { waitUntil: 'domcontentloaded' })
  await page.evaluate((keep) => {
    try {
      localStorage.removeItem('richkit:notion-draft')
      if (!keep) localStorage.removeItem('richkit:slash-recent')
    } catch {
      // storage can be unavailable; the demo falls back to its seed content
    }
  }, keepRecent)
  await page.reload({ waitUntil: 'domcontentloaded' })
  const editor = page.locator(ED)
  await editor.waitFor()
  await editor.click()
  await page.keyboard.press(`${MOD}+a`)
  await page.keyboard.press('Delete')
  return editor
}

function html(page: Page): Promise<string> {
  return page.locator(ED).innerHTML()
}

/** Type "/" plus a query and wait for the menu to settle. */
async function slash(page: Page, query = '') {
  await page.keyboard.type(`/${query}`)
  await expect(page.locator('.slash-menu')).toBeVisible()
}

async function runSlash(page: Page, label: string) {
  await slash(page)
  await page.locator('.slash-menu-item', { hasText: label }).first().click()
}

/** Select the whole first block so the bubble menu opens. */
async function selectAll(page: Page) {
  await page.keyboard.press(`${MOD}+a`)
  await expect(page.locator('.notion-bubble')).toBeVisible()
}

/** Hover a block and open the gutter handle's action menu. */
async function openBlockMenu(page: Page, index = 0) {
  await page.locator(`${ED} > *`).nth(index).hover()
  const grip = page.locator('.rk-block-grip')
  await expect(grip).toBeVisible()
  await grip.click()
  await expect(page.locator('.rk-block-menu')).toBeVisible()
}

// ---------------------------------------------------------------- Core editing

test.describe('core editing', () => {
  test('types rich text into a paragraph', async ({ page }) => {
    const ed = await open(page)
    await page.keyboard.type('hello world')
    expect(await ed.innerText()).toContain('hello world')
  })

  test('heading levels 1-3', async ({ page }) => {
    for (const [label, tag] of [
      ['Heading 1', 'h1'],
      ['Heading 2', 'h2'],
      ['Heading 3', 'h3'],
    ] as const) {
      await open(page)
      await runSlash(page, label)
      await page.keyboard.type('title')
      expect(await html(page)).toContain(`<${tag}`)
    }
  })

  test('bold, italic, underline, strikethrough via shortcuts', async ({ page }) => {
    await open(page)
    await page.keyboard.type('styled')
    await page.keyboard.press(`${MOD}+a`)
    for (const key of ['b', 'i', 'u']) await page.keyboard.press(`${MOD}+${key}`)
    const out = await html(page)
    expect(out).toMatch(/<strong|<b>/)
    expect(out).toMatch(/<em|<i>/)
    expect(out).toMatch(/<u>|text-decoration/)
  })

  test('strikethrough via the bubble menu', async ({ page }) => {
    await open(page)
    await page.keyboard.type('struck')
    await selectAll(page)
    await page.locator('.notion-bubble [title="Strikethrough"]').click()
    expect(await html(page)).toMatch(/<s>|<del|line-through/)
  })

  test('inline code', async ({ page }) => {
    await open(page)
    await page.keyboard.type('snippet')
    await selectAll(page)
    await page.locator('.notion-bubble [title="Inline code"]').click()
    expect(await html(page)).toContain('<code')
  })

  test('text colour', async ({ page }) => {
    await open(page)
    await page.keyboard.type('coloured')
    await selectAll(page)
    await page.locator('.notion-bubble [title="Text color"]').click()
    await page.locator('.tb-color-panel .tb-swatch').first().click()
    expect(await html(page)).toMatch(/color:/)
  })

  test('text highlight', async ({ page }) => {
    await open(page)
    await page.keyboard.type('marked')
    await selectAll(page)
    await page.locator('.notion-bubble [title="Highlight"]').click()
    await page.locator('.tb-color-panel .tb-swatch').first().click()
    expect(await html(page)).toMatch(/<mark|background/)
  })

  test('hyperlinks', async ({ page }) => {
    await open(page)
    await page.keyboard.type('link me')
    await selectAll(page)
    await page.locator('.notion-bubble [title="Link"]').click()
    await page
      .locator('.rk-prompt-input, .modal input, input[placeholder*="example" i]')
      .first()
      .fill('https://example.com')
    await page.locator('button:has-text("Apply")').click()
    expect(await html(page)).toContain('href="https://example.com"')
  })

  test('block quotes', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Quote')
    await page.keyboard.type('quoted')
    expect(await html(page)).toContain('<blockquote')
  })

  test('horizontal divider', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Divider')
    expect(await html(page)).toContain('<hr')
  })

  test('bulleted list', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Bullet List')
    await page.keyboard.type('one')
    expect(await html(page)).toContain('<ul')
  })

  test('numbered list', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Numbered List')
    await page.keyboard.type('one')
    expect(await html(page)).toContain('<ol')
  })

  test('to-do list with a working checkbox', async ({ page }) => {
    await open(page)
    await runSlash(page, 'To-do List')
    await page.keyboard.type('task one')
    await expect(
      page.locator(`${ED} li[data-type="task-item"] input[type="checkbox"]`),
    ).toHaveCount(1)
    await page.locator(`${ED} input[type="checkbox"]`).first().click()
    await expect(page.locator(`${ED} li[data-checked="true"]`)).toHaveCount(1)
  })

  test('nested lists via Tab', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Bullet List')
    await page.keyboard.type('parent')
    await page.keyboard.press('Enter')
    await page.keyboard.press('Tab')
    await page.keyboard.type('child')
    expect(await html(page)).toMatch(/<ul[\s\S]*<ul/)
  })

  test('text alignment', async ({ page }) => {
    await open(page)
    await page.keyboard.type('centre me')
    await selectAll(page)
    await page.locator('.notion-bubble [title="More formatting"]').click()
    await page.locator('.notion-bubble [title="Align centre"]').click()
    expect(await html(page)).toMatch(/text-align:\s*center/)
  })

  test('undo and redo', async ({ page }) => {
    const ed = await open(page)
    await page.keyboard.type('first')
    await page.keyboard.press(`${MOD}+z`)
    expect(await ed.innerText()).not.toContain('first')
    await page.keyboard.press(`${MOD}+Shift+z`)
    expect(await ed.innerText()).toContain('first')
  })
})

// --------------------------------------------------------------- Block editing

test.describe('block editing', () => {
  test('Enter starts a new block', async ({ page }) => {
    await open(page)
    await page.keyboard.type('one')
    await page.keyboard.press('Enter')
    await page.keyboard.type('two')
    expect(await page.locator(`${ED} > p`).count()).toBe(2)
  })

  test('block handle appears on hover', async ({ page }) => {
    await open(page)
    await page.keyboard.type('hover me')
    await page.locator(`${ED} > *`).first().hover()
    await expect(page.locator('.rk-block-handle')).toBeVisible()
  })

  /** Press the gutter grip and drag it onto the lower half of another block. */
  async function dragBlockOnto(page: Page, from: number, to: number) {
    await page.locator(`${ED} > *`).nth(from).hover()
    const grip = page.locator('.rk-block-grip')
    await expect(grip).toBeVisible()
    const handle = await grip.boundingBox()
    const target = await page.locator(`${ED} > *`).nth(to).boundingBox()
    if (!handle || !target) throw new Error('drag handle or target block missing')
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
    await page.mouse.down()
    // a short first move starts the drag before the long travel to the target
    await page.mouse.move(handle.x + handle.width / 2 + 8, handle.y + 8, { steps: 4 })
    // re-measure once the drag is under way: picking a block up can shift the
    // layout, and dropping on a stale rectangle lands on the wrong block
    const landing = (await page.locator(`${ED} > *`).nth(to).boundingBox()) ?? target
    await page.mouse.move(landing.x + landing.width / 2, landing.y + landing.height * 0.75, {
      steps: 15,
    })
    return landing
  }

  test('drag and drop reorders blocks', async ({ page }) => {
    const ed = await open(page)
    await page.keyboard.type('alpha')
    await page.keyboard.press('Enter')
    await page.keyboard.type('bravo')
    await dragBlockOnto(page, 0, 1)
    await page.mouse.up()
    await expect
      .poll(async () => {
        const text = await ed.innerText()
        return text.indexOf('bravo') < text.indexOf('alpha')
      })
      .toBe(true)
  })

  test('a drag shows where the block will land', async ({ page }) => {
    await open(page)
    await page.keyboard.type('alpha')
    await page.keyboard.press('Enter')
    await page.keyboard.type('bravo')
    await dragBlockOnto(page, 0, 1)
    await expect(page.locator(`${ED} .rk-drop-indicator`)).toHaveCount(1)
    await page.mouse.up()
  })

  test('clicking the grip opens the block menu instead of dragging', async ({ page }) => {
    await open(page)
    await page.keyboard.type('menu me')
    await page.locator(`${ED} > *`).first().hover()
    await page.locator('.rk-block-grip').click()
    await expect(page.locator('.rk-block-menu')).toBeVisible()
  })

  test('duplicate a block', async ({ page }) => {
    const ed = await open(page)
    await page.keyboard.type('twice')
    await openBlockMenu(page)
    await page.locator('.rk-block-menu-item', { hasText: 'Duplicate' }).click()
    expect((await ed.innerText()).match(/twice/g)?.length).toBe(2)
  })

  test('delete a block', async ({ page }) => {
    const ed = await open(page)
    await page.keyboard.type('gone')
    await page.keyboard.press('Enter')
    await page.keyboard.type('kept')
    await openBlockMenu(page)
    await page.locator('.rk-block-menu-item', { hasText: 'Delete' }).click()
    expect(await ed.innerText()).not.toContain('gone')
  })

  test('copy a block to the clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await open(page)
    await page.keyboard.type('copy me')
    await openBlockMenu(page)
    await page.locator('.rk-block-menu-item', { hasText: 'Copy to clipboard' }).click()
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain('copy me')
  })

  test('turn one block type into another', async ({ page }) => {
    await open(page)
    await page.keyboard.type('promote me')
    await openBlockMenu(page)
    await page.locator('.rk-block-menu-item', { hasText: 'Turn Into' }).click()
    await page.locator('.rk-block-submenu .rk-block-menu-item', { hasText: 'Heading 1' }).click()
    expect(await html(page)).toContain('<h1')
  })

  test('copy a link to a specific block', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await open(page)
    await page.keyboard.type('anchor me')
    await openBlockMenu(page)
    await page.locator('.rk-block-menu-item', { hasText: 'Copy anchor link' }).click()
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#')
  })

  test('multi-block selection applies formatting to every block', async ({ page }) => {
    await open(page)
    await page.keyboard.type('one')
    await page.keyboard.press('Enter')
    await page.keyboard.type('two')
    await page.keyboard.press(`${MOD}+a`)
    await page.keyboard.press(`${MOD}+b`)
    const out = await html(page)
    expect(out.match(/<strong|<b>/g)?.length).toBeGreaterThanOrEqual(2)
  })
})

// -------------------------------------------------------------- Slash commands

test.describe('slash commands', () => {
  test('typing "/" opens the command menu', async ({ page }) => {
    await open(page)
    await slash(page)
    expect(await page.locator('.slash-menu-item').count()).toBeGreaterThan(5)
  })

  test('searches blocks by name', async ({ page }) => {
    await open(page)
    await slash(page, 'quote')
    const labels = await page.locator('.slash-menu-item').allInnerTexts()
    expect(labels.join(' ')).toContain('Quote')
  })

  test('fuzzy command search', async ({ page }) => {
    await open(page)
    await slash(page, 'bllt')
    const labels = await page.locator('.slash-menu-item').allInnerTexts()
    expect(labels.join(' ')).toContain('Bullet List')
  })

  test('keyboard navigation selects an item', async ({ page }) => {
    await open(page)
    await slash(page)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    expect(await page.locator('.slash-menu').count()).toBe(0)
  })

  test('categories group the commands', async ({ page }) => {
    await open(page)
    await slash(page)
    const groups = await page.locator('.slash-menu-group-label, .slash-menu-group').allInnerTexts()
    expect(groups.join(' ')).toMatch(/Style/)
  })

  test('recently used commands surface first', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Quote')
    await open(page, { keepRecent: true })
    await slash(page)
    const groups = await page.locator('.slash-menu-group-label, .slash-menu-group').allInnerTexts()
    expect(groups.join(' ')).toMatch(/Recent/i)
  })

  test('Escape closes the menu', async ({ page }) => {
    await open(page)
    await slash(page)
    await page.keyboard.press('Escape')
    await expect(page.locator('.slash-menu')).toHaveCount(0)
  })

  test.describe('available commands', () => {
    const commands = [
      'Text',
      'Heading 1',
      'Bullet List',
      'Numbered List',
      'To-do List',
      'Quote',
      'Callout',
      'Code Block',
      'Table',
      'Image',
      'Video',
      'Audio',
      'File',
      'Divider',
      'Toggle',
      'Bookmark',
      'Embed',
    ]
    for (const label of commands) {
      test(`offers "${label}"`, async ({ page }) => {
        await open(page)
        await slash(page)
        const labels = await page.locator('.slash-menu-item').allInnerTexts()
        expect(labels.join('\n')).toContain(label)
      })
    }
  })
})

// ----------------------------------------------------------- Markdown shortcuts

test.describe('markdown shortcuts', () => {
  const cases: [string, string, RegExp][] = [
    ['# ', 'heading', /<h1/],
    ['## ', 'heading', /<h2/],
    ['- ', 'bullet', /<ul/],
    ['1. ', 'numbered', /<ol/],
    ['- [ ] ', 'todo', /data-type="task-item"/],
    ['> ', 'quote', /<blockquote/],
    ['--- ', 'divider', /<hr/],
    ['```', 'code', /<pre/],
  ]
  for (const [prefix, name, expected] of cases) {
    test(`"${prefix.trim()}" starts a ${name}`, async ({ page }) => {
      await open(page)
      await page.keyboard.type(`${prefix}text`)
      expect(await html(page)).toMatch(expected)
    })
  }

  const marks: [string, RegExp][] = [
    ['**bold** ', /<strong|<b>/],
    ['*italic* ', /<em|<i>/],
    ['`code` ', /<code/],
  ]
  for (const [input, expected] of marks) {
    test(`"${input.trim()}" applies its mark`, async ({ page }) => {
      await open(page)
      await page.keyboard.type(input)
      expect(await html(page)).toMatch(expected)
    })
  }
})

// ------------------------------------------------------ Floating format toolbar

test.describe('floating formatting toolbar', () => {
  test('appears when text is selected', async ({ page }) => {
    await open(page)
    await page.keyboard.type('select me')
    await selectAll(page)
  })

  const buttons = [
    'Bold',
    'Italic',
    'Underline',
    'Strikethrough',
    'Inline code',
    'Link',
    'Comment',
    'Clear formatting',
  ]
  for (const title of buttons) {
    test(`offers "${title}"`, async ({ page }) => {
      await open(page)
      await page.keyboard.type('select me')
      await selectAll(page)
      const bubble = page.locator('.notion-bubble')
      if (await bubble.locator(`[title="${title}"]`).count()) return
      await bubble.locator('[title="More formatting"]').click()
      await expect(bubble.locator(`[title="${title}"]`)).toBeVisible()
    })
  }

  test('offers text colour and highlight', async ({ page }) => {
    await open(page)
    await page.keyboard.type('select me')
    await selectAll(page)
    const bubble = page.locator('.notion-bubble')
    expect(await bubble.locator('[title="Text color"]').count()).toBe(1)
    expect(await bubble.locator('[title="Highlight"]').count()).toBe(1)
  })
})

// --------------------------------------------------------- Keyboard shortcuts

test.describe('keyboard shortcuts', () => {
  test('Shift+Enter inserts a line break', async ({ page }) => {
    await open(page)
    await page.keyboard.type('one')
    await page.keyboard.press('Shift+Enter')
    await page.keyboard.type('two')
    expect(await html(page)).toContain('<br')
  })

  test('Backspace merges into the previous block', async ({ page }) => {
    await open(page)
    await page.keyboard.type('one')
    await page.keyboard.press('Enter')
    await page.keyboard.type('two')
    for (let i = 0; i < 4; i++) await page.keyboard.press('Backspace')
    expect(await page.locator(`${ED} > p`).count()).toBe(1)
  })

  test(`${MOD}+K adds a link`, async ({ page }) => {
    await open(page)
    await page.keyboard.type('link me')
    await page.keyboard.press(`${MOD}+a`)
    await page.keyboard.press(`${MOD}+k`)
    await expect(
      page.locator('.rk-prompt-input, .modal input, input[placeholder*="example" i]').first(),
    ).toBeVisible()
  })

  test('arrow keys move between blocks', async ({ page }) => {
    await open(page)
    await page.keyboard.type('one')
    await page.keyboard.press('Enter')
    await page.keyboard.type('two')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.type('X')
    expect(await page.locator(`${ED} > p`).first().innerText()).toContain('X')
  })
})

// ------------------------------------------------------------- Toggle blocks

test.describe('toggle blocks', () => {
  test('inserts a collapsible toggle', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Toggle')
    await expect(page.locator(`${ED} .rk-toggle`)).toHaveCount(1)
  })

  test('collapses and expands', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Toggle')
    await page.locator(`${ED} .rk-toggle-twisty`).first().click()
    await expect(page.locator(`${ED} .rk-toggle[data-open="false"]`)).toHaveCount(1)
  })

  test('holds any block inside', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Toggle')
    await page.keyboard.type('summary')
    await page.locator(`${ED} .rk-toggle-body p`).first().click()
    await runSlash(page, 'Bullet List')
    await expect(page.locator(`${ED} .rk-toggle-body ul`)).toHaveCount(1)
  })
})

// ------------------------------------------------------------ Callout blocks

test.describe('callout blocks', () => {
  test('inserts a callout', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Callout')
    expect(await html(page)).toMatch(/callout/)
  })

  test('offers the documented variants', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Callout')
    await page.locator(`${ED} .rk-callout-icon`).first().click()
    const menu = page.locator('.rk-callout-menu')
    const text = (await menu.allInnerTexts()).join(' ').toLowerCase()
    for (const kind of ['tip', 'info', 'warning', 'important', 'success']) {
      expect(text).toContain(kind)
    }
  })
})

// --------------------------------------------------------------- Code blocks

test.describe('code blocks', () => {
  test('highlights syntax', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Code Block')
    await page.keyboard.type('const a = 1')
    expect(await html(page)).toMatch(/class="[^"]*(tok|hljs|cm-)/)
  })

  test('selects a language', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Code Block')
    await page.locator(`${ED} pre`).first().hover()
    await expect(page.locator(`${ED} .code-block-lang`).first()).toBeVisible()
  })

  test('copies the code', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Code Block')
    await page.keyboard.type('const a = 1')
    await page.locator(`${ED} pre`).first().hover()
    await expect(page.locator(`${ED} .code-block-copy`).first()).toBeVisible()
  })

  test('shows line numbers', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Code Block')
    await page.keyboard.type('const a = 1')
    await expect(page.locator(`${ED} .code-block-line-number`).first()).toBeVisible()
  })
})

// ------------------------------------------------------------------- Tables

test.describe('tables', () => {
  test('creates a table', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Table')
    expect(await html(page)).toContain('<table')
  })

  test('has a header row', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Table')
    expect(await html(page)).toContain('<th')
  })

  test('adds a row from the cell menu', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Table')
    const before = await page.locator(`${ED} tr`).count()
    await page.locator(`${ED} td, ${ED} th`).first().click({ button: 'right' })
    await page.locator('.richkit-table-ctx-item', { hasText: 'Add row below' }).first().click()
    expect(await page.locator(`${ED} tr`).count()).toBe(before + 1)
  })

  test('Tab moves between cells', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Table')
    await page.locator(`${ED} th, ${ED} td`).first().click()
    await page.keyboard.type('a')
    await page.keyboard.press('Tab')
    await page.keyboard.type('b')
    const cells = await page.locator(`${ED} th, ${ED} td`).allInnerTexts()
    expect(cells[0]).toContain('a')
    expect(cells[1]).toContain('b')
  })

  test('columns are resizable', async ({ page }) => {
    await open(page)
    await runSlash(page, 'Table')
    expect(
      await page.locator(`${ED} .column-resize-handle, ${ED} colgroup col`).count(),
    ).toBeGreaterThan(0)
  })
})

// -------------------------------------------------------------------- Media

test.describe('media', () => {
  test('inserts an image', async ({ page }) => {
    await open(page)
    await slash(page)
    await page.locator('.slash-menu-item', { hasText: 'Image' }).first().click()
    await page
      .locator('.rk-prompt-input, .modal input, input[placeholder*="http" i]')
      .first()
      .fill('https://placehold.co/200x100.png')
    await page.locator('button:has-text("Insert")').click()
    expect(await html(page)).toContain('<img')
  })

  test('an inserted image can be resized, aligned and captioned', async ({ page }) => {
    await open(page)
    await slash(page)
    await page.locator('.slash-menu-item', { hasText: 'Image' }).first().click()
    await page
      .locator('.rk-prompt-input, .modal input, input[placeholder*="http" i]')
      .first()
      .fill('https://placehold.co/200x100.png')
    await page.locator('button:has-text("Insert")').click()
    await page.locator(`${ED} img`).click()
    const bar = page.locator(`${ED} .richkit-image-toolbar`)
    await expect(bar).toBeVisible()
    const text = (await bar.innerText()).toLowerCase()
    expect(text).toMatch(/caption/)
    expect(text).toMatch(/align/)
    await expect(page.locator(`${ED} .richkit-image-resize`)).toHaveCount(1)
  })

  test('offers video, audio and file blocks', async ({ page }) => {
    await open(page)
    await slash(page)
    const labels = (await page.locator('.slash-menu-item').allInnerTexts()).join('\n')
    for (const label of ['Video', 'Audio', 'File']) expect(labels).toContain(label)
  })

  for (const [label, kind] of [
    ['Video', 'video'],
    ['Audio', 'audio'],
    ['File', 'file'],
  ] as const) {
    test(`inserts a ${kind} block`, async ({ page }) => {
      await open(page)
      await slash(page)
      await page.locator('.slash-menu-item', { hasText: label }).first().click()
      await page
        .locator('.rk-prompt-input, .modal input, input[placeholder*="http" i]')
        .first()
        .fill(
          `https://example.com/clip.${kind === 'file' ? 'pdf' : kind === 'video' ? 'mp4' : 'mp3'}`,
        )
      await page.locator('button:has-text("Insert")').click()
      await expect(page.locator(`${ED} [data-media="${kind}"]`)).toHaveCount(1)
    })
  }
})

// -------------------------------------------------------------- Smart paste

test.describe('smart paste', () => {
  async function paste(page: Page, type: string, data: string) {
    await page.evaluate(
      ([t, d]) => {
        const dt = new DataTransfer()
        dt.setData(t as string, d as string)
        const el = document.querySelector('.demo-notion .editor .ProseMirror') as HTMLElement | null
        el?.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true }))
      },
      [type, data],
    )
  }

  test('pastes rich text', async ({ page }) => {
    await open(page)
    await paste(page, 'text/html', '<p><strong>bold</strong> text</p>')
    expect(await html(page)).toMatch(/<strong|<b>/)
  })

  test('pastes markdown as blocks', async ({ page }) => {
    await open(page)
    await paste(page, 'text/plain', '# Heading\n\n- one\n- two')
    const out = await html(page)
    expect(out).toContain('<h1')
    expect(out).toContain('<ul')
  })

  test('pastes plain text', async ({ page }) => {
    await open(page)
    await paste(page, 'text/plain', 'just words')
    expect(await page.locator(ED).innerText()).toContain('just words')
  })

  test('detects a pasted URL and links it', async ({ page }) => {
    await open(page)
    await paste(page, 'text/plain', 'https://example.com')
    expect(await html(page)).toContain('href="https://example.com"')
  })

  test('pastes a table', async ({ page }) => {
    await open(page)
    await paste(page, 'text/html', '<table><tr><td>a</td><td>b</td></tr></table>')
    expect(await html(page)).toContain('<table')
  })
})

// ------------------------------------------------------- Links and bookmarks

test.describe('links and bookmarks', () => {
  test('edits and removes a link', async ({ page }) => {
    await open(page)
    await page.keyboard.type('link me')
    await selectAll(page)
    await page.locator('.notion-bubble [title="Link"]').click()
    await page
      .locator('.rk-prompt-input, .modal input, input[placeholder*="example" i]')
      .first()
      .fill('https://example.com')
    await page.locator('button:has-text("Apply")').click()
    await selectAll(page)
    await page.locator('.notion-bubble [title="Link"]').click()
    await page
      .locator('.rk-prompt-input, .modal input, input[placeholder*="example" i]')
      .first()
      .fill('')
    await page.locator('button:has-text("Apply")').click()
    expect(await html(page)).not.toContain('<a ')
  })

  test('inserts a bookmark block with a rich preview', async ({ page }) => {
    await open(page)
    await slash(page)
    await page.locator('.slash-menu-item', { hasText: 'Bookmark' }).first().click()
    await page
      .locator('.rk-prompt-input, .modal input, input[placeholder*="http" i]')
      .first()
      .fill('https://example.com/post')
    await page.locator('button:has-text("Insert")').click()
    await expect(page.locator(`${ED} a.rk-bookmark`)).toHaveCount(1)
  })
})

// ----------------------------------------------------------------- Mentions

test.describe('mentions', () => {
  test('"@" opens the mention suggestion list', async ({ page }) => {
    await open(page)
    await page.keyboard.type('@')
    await expect(page.locator('.rk-mention-menu')).toBeVisible()
  })

  test('inserts a clickable mention', async ({ page }) => {
    await open(page)
    await page.keyboard.type('@')
    await page.locator('.rk-mention-item').first().click()
    await expect(page.locator(`${ED} span[data-mention]`)).toHaveCount(1)
  })
})

// ------------------------------------------------------------- Round-trip

test.describe('HTML round-trip', () => {
  // Autosave stores getHTML() and reloads it, so every block has to survive a
  // serialize/parse cycle unchanged — a lossy node would quietly eat content.
  const cases: [string, string][] = [
    ['bookmark', "call('insertBookmark', 'https://example.com/post')"],
    ['callout', "call('toggleCallout', { kind: 'warning' })"],
    ['toggle', "call('insertToggle')"],
    ['media', "call('insertMedia', { kind: 'audio', src: 'https://example.com/a.mp3' })"],
    ['mention', "call('insertMention', { id: 'ada', label: 'Ada Lovelace' })"],
    [
      'image with a caption',
      "call('insertImage', { src: 'https://example.com/y.png', alt: 'a cat', caption: 'Fig 1', align: 'center' })",
    ],
  ]
  for (const [name, chain] of cases) {
    test(`${name} survives serialize and parse`, async ({ page }) => {
      await open(page)
      const { before, after } = await page.evaluate((expr) => {
        const editor = (window as unknown as { __ed: Record<string, unknown> }).__ed
        const run = new Function('e', `e.setContent('<p></p>'); e.chain().${expr}.run()`)
        run(editor)
        const get = editor['getHTML'] as () => string
        const set = editor['setContent'] as (html: string) => void
        const html = get.call(editor)
        set.call(editor, html)
        return { before: html, after: get.call(editor) }
      }, chain)
      expect(before).toBe(after)
      expect(before).not.toBe('<p></p>')
    })
  }
})

// -------------------------------------------------------- Productivity/UX

test.describe('productivity', () => {
  test('word and character counts are available', async ({ page }) => {
    await open(page)
    await page.keyboard.type('one two three')
    const status = page.locator('.demo-notion .notion-status')
    await expect(status).toContainText('3 words')
    await expect(status).toContainText('characters')
    await expect(status).toContainText('min read')
  })

  test('find and replace is reachable', async ({ page }) => {
    await open(page)
    await page.keyboard.press(`${MOD}+f`)
    await expect(page.locator('.re-modal')).toBeVisible()
  })

  test('dark mode toggles', async ({ page }) => {
    await open(page)
    const frame = page.locator('.demo-notion')
    const before = await frame.getAttribute('data-theme')
    // the docs site's sticky header overlaps the demo bar, so a real click
    // would land on the header instead of the theme button
    await page.locator('.notion-bar-right .tb-btn[title*="Switch" i]').dispatchEvent('mousedown')
    expect(await frame.getAttribute('data-theme')).not.toBe(before)
  })

  test('content survives a reload (auto-save)', async ({ page }) => {
    const ed = await open(page)
    await page.keyboard.type('persist me')
    await page.waitForTimeout(600)
    await page.reload()
    await ed.waitFor()
    expect(await ed.innerText()).toContain('persist me')
  })
})
