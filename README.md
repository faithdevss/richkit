# richkit

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
- **BubbleMenu + Toolbar** — Floating UI–positioned selection menu, default toolbar in `@richkit/react`

## Install

```bash
pnpm add @richkit/core @richkit/react @richkit/starter-kit
```

## Usage

### Headless

```ts
import { Editor } from '@richkit/core'
import { StarterKit } from '@richkit/starter-kit'

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
import { useEditor, EditorContent, BubbleMenu, DefaultToolbar } from '@richkit/react'
import { StarterKit } from '@richkit/starter-kit'

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
import { createAutosave } from '@richkit/core'

createAutosave(editor, {
  debounceMs: 500,
  onSave: (html) => api.save(html),
})
```

## Packages

| Package                                 | Purpose                                                                                   |
| --------------------------------------- | ----------------------------------------------------------------------------------------- |
| `@richkit/core`                         | Headless editor, extension API, schema builder, commands chain, HTML I/O, autosave        |
| `@richkit/react`                        | `useEditor`, `EditorContent`, `BubbleMenu`, `Toolbar`, `DefaultToolbar`, `EditorProvider` |
| `@richkit/starter-kit`                  | Bundled array of 20 default extensions                                                    |
| `@richkit/html`                         | Standalone HTML parse/serialize utilities                                                 |
| `@richkit/extension-paragraph`          | Paragraph node                                                                            |
| `@richkit/extension-heading`            | H1–H6 with `setHeading(level)` + Mod-Alt-1..6                                             |
| `@richkit/extension-blockquote`         | Blockquote wrap                                                                           |
| `@richkit/extension-code-block`         | Fenced code block                                                                         |
| `@richkit/extension-bullet-list`        | UL via `prosemirror-schema-list`                                                          |
| `@richkit/extension-ordered-list`       | OL via `prosemirror-schema-list`                                                          |
| `@richkit/extension-task-list`          | Checkbox list                                                                             |
| `@richkit/extension-list-item`          | LI with Enter/Tab/Shift-Tab                                                               |
| `@richkit/extension-table`              | `prosemirror-tables` wrapper (TableKit)                                                   |
| `@richkit/extension-image`              | Image NodeView with corner resize                                                         |
| `@richkit/extension-bold`               | Bold mark + Mod-B                                                                         |
| `@richkit/extension-italic`             | Italic mark + Mod-I                                                                       |
| `@richkit/extension-underline`          | Underline mark + Mod-U                                                                    |
| `@richkit/extension-strike`             | Strike mark + Mod-Shift-S                                                                 |
| `@richkit/extension-code`               | Inline code mark + Mod-E                                                                  |
| `@richkit/extension-link`               | Link mark + URL autolink input rule                                                       |
| `@richkit/extension-history`            | Undo/redo (Mod-Z, Mod-Shift-Z)                                                            |
| `@richkit/extension-placeholder`        | Empty-doc placeholder decoration                                                          |
| `@richkit/extension-markdown-shortcuts` | Markdown input rules                                                                      |

## Monorepo

```
rich_editor/
├── packages/
│   ├── core/                          # @richkit/core
│   ├── react/                         # @richkit/react
│   ├── starter-kit/                   # @richkit/starter-kit
│   ├── html/                          # @richkit/html
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
pnpm --filter @richkit/core docs       # typedoc → packages/core/docs/
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

- Bidirectional Markdown (`@richkit/markdown`: prosemirror-markdown serializer + markdown-it parser, GFM tables & task lists)
- DOCX import (`@richkit/docx` via mammoth) alongside existing export
- PDF export / print via hidden iframe (`printEditor` in `@richkit/react`)
- Subscript / superscript marks (Mod-, / Mod-.)
- Slash-command menu (`@richkit/extension-slash-commands` + `SlashMenu`)
- Live word count (`@richkit/extension-word-count` + playground status bar)
- Outline / table-of-contents sidebar (`OutlineSidebar`)
- Embed node — YouTube/Vimeo/video/generic iframe, XSS-allowlisted (`@richkit/extension-embed`)
- Word / Google Docs paste cleanup + Mod-Shift-V plain paste (`@richkit/extension-paste-handler`)
- Source-code modal HTML | Markdown tabs

**Phase 3+**: collaboration (Yjs), AI assistant, page-based layout, Vue/Angular/Svelte bindings, mobile UI, SSR renderer, ODT, footnotes, revision history.

## License

MIT
