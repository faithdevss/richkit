# rich-editor

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
- **BubbleMenu + Toolbar** — Floating UI–positioned selection menu, default toolbar in `@rich-editor/react`

## Install

```bash
pnpm add @rich-editor/core @rich-editor/react @rich-editor/starter-kit
```

## Usage

### Headless

```ts
import { Editor } from '@rich-editor/core'
import { StarterKit } from '@rich-editor/starter-kit'

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
import { useEditor, EditorContent, BubbleMenu, DefaultToolbar } from '@rich-editor/react'
import { StarterKit } from '@rich-editor/starter-kit'

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
import { createAutosave } from '@rich-editor/core'

createAutosave(editor, {
  debounceMs: 500,
  onSave: (html) => api.save(html),
})
```

## Packages

| Package | Purpose |
|---------|---------|
| `@rich-editor/core` | Headless editor, extension API, schema builder, commands chain, HTML I/O, autosave |
| `@rich-editor/react` | `useEditor`, `EditorContent`, `BubbleMenu`, `Toolbar`, `DefaultToolbar`, `EditorProvider` |
| `@rich-editor/starter-kit` | Bundled array of 20 default extensions |
| `@rich-editor/html` | Standalone HTML parse/serialize utilities |
| `@rich-editor/extension-paragraph` | Paragraph node |
| `@rich-editor/extension-heading` | H1–H6 with `setHeading(level)` + Mod-Alt-1..6 |
| `@rich-editor/extension-blockquote` | Blockquote wrap |
| `@rich-editor/extension-code-block` | Fenced code block |
| `@rich-editor/extension-bullet-list` | UL via `prosemirror-schema-list` |
| `@rich-editor/extension-ordered-list` | OL via `prosemirror-schema-list` |
| `@rich-editor/extension-task-list` | Checkbox list |
| `@rich-editor/extension-list-item` | LI with Enter/Tab/Shift-Tab |
| `@rich-editor/extension-table` | `prosemirror-tables` wrapper (TableKit) |
| `@rich-editor/extension-image` | Image NodeView with corner resize |
| `@rich-editor/extension-bold` | Bold mark + Mod-B |
| `@rich-editor/extension-italic` | Italic mark + Mod-I |
| `@rich-editor/extension-underline` | Underline mark + Mod-U |
| `@rich-editor/extension-strike` | Strike mark + Mod-Shift-S |
| `@rich-editor/extension-code` | Inline code mark + Mod-E |
| `@rich-editor/extension-link` | Link mark + URL autolink input rule |
| `@rich-editor/extension-history` | Undo/redo (Mod-Z, Mod-Shift-Z) |
| `@rich-editor/extension-placeholder` | Empty-doc placeholder decoration |
| `@rich-editor/extension-markdown-shortcuts` | Markdown input rules |

## Monorepo

```
rich_editor/
├── packages/
│   ├── core/                          # @rich-editor/core
│   ├── react/                         # @rich-editor/react
│   ├── starter-kit/                   # @rich-editor/starter-kit
│   ├── html/                          # @rich-editor/html
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
pnpm --filter @rich-editor/core docs       # typedoc → packages/core/docs/
pnpm --filter e2e exec playwright test     # E2E suite
```

### Stack

| Layer | Choice |
|-------|--------|
| Language | TypeScript strict |
| Pkg mgr / orchestrator | pnpm 10 + Turborepo |
| Editor core | ProseMirror (state, view, model, transform, commands, history, keymap, schema-list, tables, inputrules, dropcursor, gapcursor) |
| UI binding | React 18 |
| Bundler | tsup (ESM + CJS + d.ts) |
| Unit tests | Vitest + jsdom |
| E2E | Playwright (chromium) |
| Bubble menu | `@floating-ui/dom` |
| Versioning | Changesets |
| Lint/format | ESLint flat + Prettier |

## Tests

- **Unit** — 16/16 in `packages/core/__tests__/` (schema, commands, autosave, html, lists)
- **E2E** — 6/6 in `tests/e2e/specs/smoke.spec.ts` (load+type, Mod+B, `## ` heading, `- ` bullet, toolbar bold, `` `code` `` inline)
- **Verification** — `pnpm turbo run typecheck build lint test` → 76/76 tasks green

## Roadmap

**Phase 1 (v0.1.0)** — complete.

**Phase 2 (editor completeness)** — complete:
- Bidirectional Markdown (`@rich-editor/markdown`: prosemirror-markdown serializer + markdown-it parser, GFM tables & task lists)
- DOCX import (`@rich-editor/docx` via mammoth) alongside existing export
- PDF export / print via hidden iframe (`printEditor` in `@rich-editor/react`)
- Subscript / superscript marks (Mod-, / Mod-.)
- Slash-command menu (`@rich-editor/extension-slash-commands` + `SlashMenu`)
- Live word count (`@rich-editor/extension-word-count` + playground status bar)
- Outline / table-of-contents sidebar (`OutlineSidebar`)
- Embed node — YouTube/Vimeo/video/generic iframe, XSS-allowlisted (`@rich-editor/extension-embed`)
- Word / Google Docs paste cleanup + Mod-Shift-V plain paste (`@rich-editor/extension-paste-handler`)
- Source-code modal HTML | Markdown tabs

**Phase 3+**: collaboration (Yjs), AI assistant, page-based layout, Vue/Angular/Svelte bindings, mobile UI, SSR renderer, ODT, footnotes, revision history.

## License

MIT
