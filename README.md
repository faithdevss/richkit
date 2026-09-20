# richkit

[![npm](https://img.shields.io/npm/v/@richkitjs/core)](https://www.npmjs.com/package/@richkitjs/core)
[![downloads](https://img.shields.io/npm/dm/@richkitjs/core)](https://www.npmjs.com/package/@richkitjs/core)
[![license](https://img.shields.io/npm/l/@richkitjs/core)](./LICENSE)
[![GitHub](https://img.shields.io/badge/github-faithdevss%2Frichkit-blue)](https://github.com/faithdevss/richkit)

[Docs](https://faithdevss.github.io/richkit/) · [npm org](https://www.npmjs.com/org/richkitjs) · [Changelog](https://github.com/faithdevss/richkit/releases)

Headless, extensible WYSIWYG rich text editor. ProseMirror core, React binding, 20 extensions. Phase 1 MVP — v0.1.0.

## Features

- **Inline marks** — bold, italic, underline, strike, inline code
- **Blocks** — paragraph, heading (H1–H6), blockquote, code block
- **Lists** — bullet, ordered, task (checkbox), nested with Tab/Shift-Tab
- **Tables** — insert/delete rows & cols, column resize (via `prosemirror-tables`)
- **Images** — NodeView with pointer-event corner resize
- **Links** — link mark + URL autolink input rule
- **History** — undo/redo via `prosemirror-history`
- **Placeholder** — empty-doc hint via decoration
- **Markdown shortcuts** — `# ` … `###### `, `> `, `- `, `1. `, ` ``` `, `**bold**`, `*italic*`, `~~strike~~`, `` `code` ``, URL autolink
- **HTML import/export** — `DOMParser`/`DOMSerializer` round-trip
- **JSON** — `getJSON()` / `setContent(json)`
- **Autosave** — debounced `onSave` callback on `update`
- **Keyboard** — Mod-B/I/U/Shift-S/E marks, Mod-Alt-1..6 headings, Mod-Shift-7/8/9 lists, Enter splits list item
- **BubbleMenu + Toolbar** — Floating UI–positioned selection menu, default toolbar in `@richkitjs/react`

## Bundle size

JavaScript shipped for a full editor — tables, images, task lists, code highlighting and
markdown — minified and gzipped:

| Editor                                                         | Gzipped    |
| -------------------------------------------------------------- | ---------- |
| **RichKit** — `@richkitjs/core` + `starter-kit`, 41 extensions | **184 KB** |
| Tiptap 3.31 — core + StarterKit + matching extensions          | 222 KB     |
| CKEditor 5 v48.5 — classic editor + 25 plugins                 | 250 KB     |
| TinyMCE 8.9 — core, theme, model, icons + 7 plugins            | 455 KB     |

Smaller setups:

| Import                                                               | Gzipped |
| -------------------------------------------------------------------- | ------- |
| `@richkitjs/core` alone                                              | 64 KB   |
| `@richkitjs/react` + `starter-kit` (no toolbar)                      | 187 KB  |
| `@richkitjs/react` + `starter-kit` + `DefaultToolbar` + `BubbleMenu` | 199 KB  |

Measured September 2026 with esbuild (`--bundle --minify`, production mode) and `gzip -9`.
Only the named imports are bundled, so unused exports are tree-shaken. React, React DOM and
all CSS are excluded. The Tiptap row adds table, image, task list, lowlight code block,
highlight, text align, text style, mention, details and markdown to StarterKit, which on its
own is 117 KB.

Word import/export (`@richkitjs/docx`) is not in these numbers. It pulls in `docx` and
`mammoth`, so import it only where you use it — or load it with `await import()`.

Code blocks register 16 highlight.js grammars by default. Add more with
`CodeBlock.configure({ languages })` — see
[`@richkitjs/extension-code-block`](./packages/extension-code-block/README.md).

## Install

Published to the public npm registry under the [`@richkitjs`](https://www.npmjs.com/org/richkitjs) scope — no extra registry config needed.

```bash
pnpm add @richkitjs/core @richkitjs/react @richkitjs/starter-kit
```

```bash
npm install @richkitjs/core @richkitjs/react @richkitjs/starter-kit
```

```bash
yarn add @richkitjs/core @richkitjs/react @richkitjs/starter-kit
```

## Usage

### Headless

```ts
import { Editor } from '@richkitjs/core'
import { StarterKit } from '@richkitjs/starter-kit'

const editor = new Editor({
  element: document.querySelector('#editor')!,
  extensions: StarterKit,
  content: '<p>Hello</p>',
  onUpdate: ({ editor }) => console.log(editor.getHTML()),
})

editor.chain().call('toggleBold').focus().run()
editor.getHTML()
editor.getJSON()
editor.destroy()
```

### React

```tsx
import { useEditor, EditorContent, BubbleMenu, DefaultToolbar } from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'

function App() {
  const editor = useEditor({ extensions: StarterKit, content: '<p>Hello</p>' })
  if (!editor) return null
  return (
    <>
      <DefaultToolbar editor={editor} />
      <BubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </>
  )
}
```

### Autosave

```ts
import { createAutosave } from '@richkitjs/core'

createAutosave(editor, {
  debounceMs: 500,
  onSave: (html) => api.save(html),
})
```

## Packages

| Package                                                                                                            | Purpose                                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| [`@richkitjs/core`](https://www.npmjs.com/package/@richkitjs/core)                                                 | Headless editor, extension API, schema builder, commands chain, HTML I/O, autosave        |
| [`@richkitjs/react`](https://www.npmjs.com/package/@richkitjs/react)                                               | `useEditor`, `EditorContent`, `BubbleMenu`, `Toolbar`, `DefaultToolbar`, `EditorProvider` |
| [`@richkitjs/starter-kit`](https://www.npmjs.com/package/@richkitjs/starter-kit)                                   | Bundled array of 20 default extensions                                                    |
| [`@richkitjs/html`](https://www.npmjs.com/package/@richkitjs/html)                                                 | Standalone HTML parse/serialize utilities                                                 |
| [`@richkitjs/extension-paragraph`](https://www.npmjs.com/package/@richkitjs/extension-paragraph)                   | Paragraph node                                                                            |
| [`@richkitjs/extension-heading`](https://www.npmjs.com/package/@richkitjs/extension-heading)                       | H1–H6 with `setHeading(level)` + Mod-Alt-1..6                                             |
| [`@richkitjs/extension-blockquote`](https://www.npmjs.com/package/@richkitjs/extension-blockquote)                 | Blockquote wrap                                                                           |
| [`@richkitjs/extension-code-block`](https://www.npmjs.com/package/@richkitjs/extension-code-block)                 | Fenced code block                                                                         |
| [`@richkitjs/extension-bullet-list`](https://www.npmjs.com/package/@richkitjs/extension-bullet-list)               | UL via `prosemirror-schema-list`                                                          |
| [`@richkitjs/extension-ordered-list`](https://www.npmjs.com/package/@richkitjs/extension-ordered-list)             | OL via `prosemirror-schema-list`                                                          |
| [`@richkitjs/extension-task-list`](https://www.npmjs.com/package/@richkitjs/extension-task-list)                   | Checkbox list                                                                             |
| [`@richkitjs/extension-list-item`](https://www.npmjs.com/package/@richkitjs/extension-list-item)                   | LI with Enter/Tab/Shift-Tab                                                               |
| [`@richkitjs/extension-table`](https://www.npmjs.com/package/@richkitjs/extension-table)                           | `prosemirror-tables` wrapper (TableKit)                                                   |
| [`@richkitjs/extension-image`](https://www.npmjs.com/package/@richkitjs/extension-image)                           | Image NodeView with corner resize                                                         |
| [`@richkitjs/extension-bold`](https://www.npmjs.com/package/@richkitjs/extension-bold)                             | Bold mark + Mod-B                                                                         |
| [`@richkitjs/extension-italic`](https://www.npmjs.com/package/@richkitjs/extension-italic)                         | Italic mark + Mod-I                                                                       |
| [`@richkitjs/extension-underline`](https://www.npmjs.com/package/@richkitjs/extension-underline)                   | Underline mark + Mod-U                                                                    |
| [`@richkitjs/extension-strike`](https://www.npmjs.com/package/@richkitjs/extension-strike)                         | Strike mark + Mod-Shift-S                                                                 |
| [`@richkitjs/extension-code`](https://www.npmjs.com/package/@richkitjs/extension-code)                             | Inline code mark + Mod-E                                                                  |
| [`@richkitjs/extension-link`](https://www.npmjs.com/package/@richkitjs/extension-link)                             | Link mark + URL autolink input rule                                                       |
| [`@richkitjs/extension-history`](https://www.npmjs.com/package/@richkitjs/extension-history)                       | Undo/redo (Mod-Z, Mod-Shift-Z)                                                            |
| [`@richkitjs/extension-placeholder`](https://www.npmjs.com/package/@richkitjs/extension-placeholder)               | Empty-doc placeholder decoration                                                          |
| [`@richkitjs/extension-markdown-shortcuts`](https://www.npmjs.com/package/@richkitjs/extension-markdown-shortcuts) | Markdown input rules                                                                      |

## Monorepo

```
richkit/
├── packages/
│   ├── core/                          # @richkitjs/core
│   ├── react/                         # @richkitjs/react
│   ├── starter-kit/                   # @richkitjs/starter-kit
│   ├── html/                          # @richkitjs/html
│   └── extension-*/                   # 20 extensions
├── apps/
│   └── playground/                    # Vite + React demo
└── tests/
    └── e2e/                           # Playwright specs
```

## Develop

```bash
pnpm install
pnpm turbo run build typecheck lint test   # all packages
pnpm --filter playground dev               # demo at :5173
pnpm --filter @richkitjs/core docs       # typedoc → packages/core/docs/
pnpm --filter e2e exec playwright test     # E2E suite
```

### Releasing

Changes that ship need a changeset:

```bash
pnpm changeset
```

Publishing to npm is automated from `main`. See [PUBLISHING.md](./PUBLISHING.md).

### Stack

| Layer                  | Choice                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Language               | TypeScript strict                                                                                                              |
| Pkg mgr / orchestrator | pnpm 10 + Turborepo                                                                                                            |
| Editor core            | ProseMirror (state, view, model, transform, commands, history, keymap, schema-list, tables, inputrules, dropcursor, gapcursor) |
| UI binding             | React 18                                                                                                                       |
| Bundler                | tsup (ESM + CJS + d.ts)                                                                                                        |
| Unit tests             | Vitest + jsdom                                                                                                                 |
| E2E                    | Playwright (chromium)                                                                                                          |
| Bubble menu            | `@floating-ui/dom`                                                                                                             |
| Versioning             | Changesets                                                                                                                     |
| Lint/format            | ESLint flat + Prettier                                                                                                         |

## Tests

- **Unit** — 16/16 in `packages/core/__tests__/` (schema, commands, autosave, html, lists)
- **E2E** — 6/6 in `tests/e2e/specs/smoke.spec.ts` (load+type, Mod+B, `## ` heading, `- ` bullet, toolbar bold, `` `code` `` inline)
- **Verification** — `pnpm turbo run typecheck build lint test` → 76/76 tasks green

## Roadmap

**Phase 1 (v0.1.0)** — complete.

**Phase 2 (editor completeness)** — complete:

- Bidirectional Markdown (`@richkitjs/markdown`: prosemirror-markdown serializer + markdown-it parser, GFM tables & task lists)
- DOCX import (`@richkitjs/docx` via mammoth) alongside existing export
- PDF export / print via hidden iframe (`printEditor` in `@richkitjs/react`)
- Subscript / superscript marks (Mod-, / Mod-.)
- Slash-command menu (`@richkitjs/extension-slash-commands` + `SlashMenu`)
- Live word count (`@richkitjs/extension-word-count` + playground status bar)
- Outline / table-of-contents sidebar (`OutlineSidebar`)
- Embed node — YouTube/Vimeo/video/generic iframe, XSS-allowlisted (`@richkitjs/extension-embed`)
- Word / Google Docs paste cleanup + Mod-Shift-V plain paste (`@richkitjs/extension-paste-handler`)
- Source-code modal HTML | Markdown tabs

**Phase 3+**: collaboration (Yjs), AI assistant, page-based layout, Vue/Angular/Svelte bindings, mobile UI, SSR renderer, ODT, footnotes, revision history.

## License

RichKit is open-core.

| Packages                                                                                                                 | License                                     | Cost                                                             |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ---------------------------------------------------------------- |
| Core, React, Vue, starter kit, HTML, Markdown and every basic extension                                                  | [MIT](./LICENSE)                            | Free, for any use                                                |
| **Pro:** `docx`, `extension-track-changes`, `extension-comments`, `extension-ai`, `ai-openai`, `ai-anthropic`, `editors-pro` | [RichKit Pro License](./LICENSE-COMMERCIAL) | [from $99 / year](https://faithdevss.github.io/richkit/pricing) |

Pro packages run without a key on localhost and other development hosts. In
production, call `setLicenseKey()` from `@richkitjs/license` with the key you
receive after purchase. The key is verified offline — no activation, no
telemetry. Without one, a small "unlicensed" badge appears; the editor never
stops working.

Third-party components keep their own licenses — see [NOTICE](./NOTICE).
