---
'@richkitjs/extension-markdown-shortcuts': minor
'@richkitjs/extension-paste-handler': minor
'@richkitjs/extension-hard-break': minor
'@richkitjs/extension-bookmark': minor
'@richkitjs/extension-callout': minor
'@richkitjs/extension-mention': minor
'@richkitjs/extension-toggle': minor
'@richkitjs/extension-media': minor
'@richkitjs/extension-task-list': minor
'@richkitjs/extension-code-block': minor
'@richkitjs/extension-image': minor
'@richkitjs/extension-table': minor
'@richkitjs/extension-link': minor
'@richkitjs/starter-kit': minor
'@richkitjs/react': minor
---

Close the gap against the documented Notion-style feature set.

New nodes, all in `StarterKit`: callout (tip/info/warning/important/success),
collapsible toggle, hard break, self-hosted video/audio/file, bookmark cards,
and inline `@` mentions with a `MentionMenu` component.

Fixes and additions to what was already there:

- the slash menu's Heading 1/2/3 items all inserted an H1 — the level was
  passed positionally where the command expects `{ level }`
- slash search falls back to fuzzy matching, and remembers recent commands
- `- [ ]` starts a to-do list and `---` a divider
- to-do items render a real checkbox instead of a styled attribute
- `Tab`/`Shift-Tab` walk table cells
- `Mod-K` opens the host app's link dialog via `Link.onEditLink`
- pasted Markdown becomes blocks and a pasted URL becomes a link
- images take alignment, a caption, and alt text from a node-view toolbar
- code blocks show line numbers
- the block menu's "Turn Into" submenu no longer tears down mid-click
