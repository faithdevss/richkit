# Editors feedback — hands-on pass (2026-09-22)

Used every ready-made editor in the playground lab (`apps/playground/editors.html`) the way an app
would: controlled `value`/`onChange`, parent reset, ref handle, `disabled`/`readOnly`, `theme`,
placeholder, keyboard shortcuts, paste, and each editor's headline feature. Driven with Playwright
(Chromium), screenshots reviewed by hand. Vue package not covered.

**What worked well:** no console errors or warnings in any editor. Pasted XSS (`onerror`,
`javascript:` hrefs, `<script>`, `<iframe>`) was stripped everywhere. Native `<form name>` and
react-hook-form (required, focus-on-error, `reset`) behave like an input. Undo works everywhere.
Mentions (pick, Shift+Enter, Enter sends, blank Enter ignored) is solid. DOCX export produces a
valid file and imports back. Agent drafts parse Markdown and undo in one step. Markdown/HTML
source panes sync both ways and respect `readOnly`.

## High

| # | Editor | Problem | Repro |
| - | ------ | ------- | ----- |
| 1 | Minimal, Notion | `readOnly` **and** `disabled` don't block the bubble menu. Its Bold/Italic/Link still edit the doc and fire `onChange`. | Tick readOnly → select "Hello" → click Bold in the bubble → value becomes `<strong>Hello</strong>`. Root cause: `packages/react/src/BubbleMenu.tsx` shows regardless of `editor.isEditable`, and toolbar commands don't check it. (Simple, Docx and Agent block the click.) |
| 2 | Agent | Agent writes into the doc when `readOnly` or `disabled`. | readOnly → ✦ FAB → prompt → ⌘Enter → a section gets appended. |
| 3 | Comments, TrackChanges, Agent | Dark theme is broken. The page surface stays white while text turns near-white, so content is invisible. | `theme="dark"` → the page is a white card with an unreadable "Reset" in it. Docx's white paper is fine because its text stays dark. |
| 4 | Question | Dark theme: the Points input has light text (`rgb(236,236,238)`) on a white background, so the number is invisible. | `theme="dark"`. |
| 5 | Notion | AI output is inserted as literal Markdown in one paragraph (`## Drafted section\n\n**drafted** …`). Real LLMs return Markdown, so every AI result looks broken. AgentEditor parses the same stream correctly. | `/` → Continue Writing. |

## Medium

| # | Editor | Problem | Repro |
| - | ------ | ------- | ----- |
| 6 | Comments | A parent reset (`value` change) leaves the old thread in the sidebar as an orphan: `(no text)` / "Please rephrase". | Add a comment → Parent reset. |
| 7 | Comments | The comment composer still opens under `disabled`/`readOnly`. That's arguably fine for readOnly (a reviewer mode), but not for disabled. | disabled → "+ Add comment". |
| 8 | Comments | Author label mismatch: the composer says "You · adding comment", but the saved comment shows `author="Tester"`. | Add a comment. |
| 9 | TrackChanges | Formatting isn't tracked. Bold is applied directly, and Markdown input rules (`## `) turn a line into a heading without a suggestion. Only text inserts and deletes are tracked. | Select text → ⌘B → no suggestion appears. |
| 10 | Link (all) | `example.org` is saved as `href="example.org"`, a relative link. It should become `https://example.org`. No ⌘K shortcut either. | Minimal → select → bubble Link → type `example.org` → Enter. |
| 11 | Agent | Clicking the empty page area appends `<p></p>` and fires `onChange`, so a form goes dirty from one click. The other editors don't. | Click under the content. |
| 12 | Markdown | Pressing Enter inside a table cell makes the whole table fall back to raw `<table>…</table>` HTML in the Markdown value, with no warning. | Click cell "2" → Enter → type. |
| 13 | Question | `$x$` inside stored stem HTML isn't rendered as math. Typing `$y^2$` works through the input rule, but HTML loaded from a DB stays raw text. The lab fixture `Q0` itself shows the raw `$`. Either parse `$…$` on load or document that the format is `<span data-math>`. | Open Question. |

## Low / polish

- **HtmlEditor** toolbar has no ordered-list or link button, even though the sample content has both.
- **DocxEditor**: Import/Export .docx, the headline feature, sit inside the `⋯` overflow even at 1280px, and the block-type control shows only an "H" icon. On a DOCX roundtrip the blockquote comes back as `<p>`.
- **List output normalization**: `<li>First</li>` becomes `<li><p>First</p></li>` on the first keystroke, so value-equality dirty checks against the original HTML go dirty in untouched regions.
- **Markdown** drops the input's trailing `\n` and rewrites `| - |` as `| --- |`. Same dirty-check issue.
- **Paste**: `<span style="background:url(...)">` becomes `<mark style="background-color: initial">`, a junk highlight.
- **Mentions** (chat composer): pasted `<img>` is kept, and `## ` turns into `<h2>`, which are odd for chat. Enter while the `@` popup has no match inserts a new paragraph instead of submitting or doing nothing.
- **CommentBox**: the limit is soft. Typing or pasting past it is allowed ("20 over") and only Reply is disabled. Fine if that's intended; worth stating in the docs.
- **Question**: Points accepts negative values, and an empty field becomes `0` silently.
- **Placeholder** still shows in empty `readOnly` editors, inviting input that can't happen.
- **TrackChanges**: the "Tracking ON" button label shows state, not the action it performs. It stays clickable in readOnly.
- **Lab**: not responsive. The 170px nav leaves about 130px for the editor at 390px width, so mobile behavior couldn't be judged. Worth a collapsible nav.

## Suggested order

1 → 2 → 3/4 → 5 (user-visible and cheap), then 6, 9, 10, 11.
