# Roadmap — remaining work vs features.md

State as of 2026-07-02 (commit `aac8b77`): Phase 1 (MVP) + Phase 2 (editor completeness) done.
Verified green: 133 turbo tasks, 126 integration tests, 202/206 e2e (4 table-col-resize failures caused by uncommitted `packages/extension-table/src/resize-plugin.ts` WIP).

## Phase 2 leftovers (small, do first next session)

- [ ] Finish or revert `resize-plugin.ts` WIP — 4 e2e tests red until then (`pnpm --filter e2e exec playwright test specs/table-col-resize.spec.ts`)
- [ ] Twitch embed provider (`packages/extension-embed/src/providers.ts` — needs `parent=` hostname param, decide strategy)
- [ ] `packages/markdown/README.md` documenting lossy conversions (textStyle dropped, highlight color dropped, table col/rowspan flattened, embed/pageBreak as raw-HTML blocks)
- [ ] mammoth styleMap tuning for DOCX import (footnotes, comments, more Word styles) in `packages/docx/src/import.ts`

## Phase 3 — Collaboration (features.md §10) — biggest differentiator

**Packages:** `extension-collaboration` (Yjs binding), `extension-collaboration-cursor` (remote cursors/presence), optional `collab-server` (Node ws server for dev/demo).

1. **Yjs core**: `y-prosemirror` (`ySyncPlugin`) wired via `addProseMirrorPlugins`. Deps: `yjs`, `y-prosemirror`, `y-protocols`.
2. **Undo rework**: collaborative docs must use `yUndoPlugin` — StarterKit needs a flag to swap `extension-history` out (both register Mod-Z; conflict if both active).
3. **Cursors/presence**: `yCursorPlugin` + awareness; render name/color badges; presence list React component.
4. **Transport**: `y-websocket` provider + minimal `apps/collab-server` (or `y-webrtc` for serverless demo). Offline-first comes free from Yjs (add `y-indexeddb`).
5. **Mentions (@user)**: reuse slash-commands plugin pattern (`packages/extension-slash-commands/src/plugin.ts` — same state machine with `@` trigger + `mention` inline node).
6. **Versioning/snapshots**: Yjs snapshots API; `VersionHistorySidebar` following `Comments/CommentSidebar.tsx` layout; restore = apply snapshot.
7. Existing `extension-comments` / `extension-track-changes` store thread state in plugin state — must migrate to Y.Map so comments sync between clients.

**Tests:** two-editor integration tests (two Editor instances, shared Y.Doc, assert convergence); e2e with two pages against dev collab server.

**Risk:** history swap and comments migration touch existing behavior — plan a compat flag.

## Phase 4 — AI (features.md §11)

**Packages:** `ai` (provider-agnostic client), `extension-ai` (editor commands), react `AiMenu`/`AiChat` components.

1. Provider adapters: Anthropic first (`claude-sonnet-5` default), OpenAI-compatible second. Streaming via SSE/fetch; BYO-proxy option (never ship keys client-side; document server proxy pattern).
2. Selection actions: rewrite / summarize / expand / translate / fix grammar / tone — command `runAiAction(action, opts)`: take selection text (or doc), stream replacement into a decoration preview, accept/reject like track-changes (reuse `extension-track-changes` marks for AI suggestions).
3. BubbleMenu "AI" button + slash items (`/ai rewrite` etc. — extend `defaultSlashItems`).
4. Smart autocomplete: debounce idle, ghost-text decoration, Tab accepts.
5. Schema-aware editing: expose doc JSON + schema summary to prompt; apply model output through `markdownToDoc`/`htmlToDoc` (already exist) — never raw HTML injection.

**Tests:** mock provider (deterministic stream) for integration + e2e; no live API in CI.

## Phase 5 — Page-based editing (features.md §2) — hardest, keep last of the big three

1. `extension-pages`: page decoration approach (visual page boxes + break positions computed from rendered height) — NOT true doc splitting first pass.
2. A4/Letter/Legal presets, margins, zoom.
3. Header/footer + page numbers at print time first (extend `packages/react/src/print.ts` CSS `@page` margin boxes), editable headers later.
4. Smart pagination (avoid orphan headings) = follow-up.

## Phase 6 — Document structures + media polish

- Footnotes (`extension-footnotes`: inline ref node + doc-end list, renumber on update)
- Multi-column layout (`extension-columns`: wrapper node + CSS columns)
- Drag-handle block reordering (plugin + handle decoration; ProseMirror `dropPoint`)
- Image: caption (figure/figcaption nodeView extension), crop (canvas modal), upload pipeline (`uploadImage(file) => Promise<url>` option + drop/paste handler)
- Excel paste normalization (extend `extension-paste-handler/src/clean.ts`)
- ODT import/export (low priority — evaluate `odt.js` landscape first, may cut)

## Phase 7 — Frameworks + DX (features.md §19–20)

- `@rich-editor/vue` binding first (mirror react package: useEditor composable, EditorContent, menus), then Svelte
- SSR/static renderer: `@rich-editor/static-renderer` — JSON → HTML string without DOM (core `DOMSerializer` needs jsdom shim or manual walk; manual walk preferred for zero deps)
- Plugin generator CLI (`create-rich-editor-extension` scaffolding from the extension-highlight template)
- Typedoc site + live playground deploy

## Phase 8 — Hardening (features.md §15–18)

- XSS sanitize pass on `setContent`/paste (allowlist already exists for embeds; add DOMPurify option in core html pipeline)
- WCAG audit: toolbar keyboard nav (roving tabindex), aria-labels sweep, a11y help dialog, high-contrast styles
- Mobile: responsive toolbar collapse, touch handles for image/table resize, virtual-keyboard viewport fixes
- Perf: lazy-load heavy extensions (code highlight, docx, markdown via dynamic import), 100k-word doc benchmark in CI

## Suggested order

1. Phase 2 leftovers (½ session)
2. Phase 3 collaboration (2–3 sessions; Yjs core + cursors first session, comments migration + versioning second)
3. Phase 4 AI (1–2 sessions)
4. Phase 6 items piecemeal between big phases
5. Phase 5 pages (dedicated session, high risk)
6. Phases 7–8 ongoing

## Conventions (keep following)

- New extension = copy `packages/extension-highlight` boilerplate (package.json/tsconfig/tsup), name-swap only
- Plugin state exposed via exported getter (`getFindState` pattern), never editor.storage
- React reactive-on-plugin-state components subscribe to `editor.on('transaction')` (fires on meta-only dispatches; `update` only on docChanged)
- Register in `packages/starter-kit/src/index.ts` + its package.json; tests in `tests/integration/src` + `tests/e2e/specs`
- Verify: `pnpm turbo run build typecheck lint test --filter='!e2e'` then `pnpm --filter e2e exec playwright test` — never run e2e twice concurrently (port 5173 collision hangs both)
