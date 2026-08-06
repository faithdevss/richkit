---
'@richkit/core': minor
'@richkit/react': minor
'@richkit/starter-kit': minor
'@richkit/html': minor
'@richkit/extension-blockquote': minor
'@richkit/extension-bold': minor
'@richkit/extension-bullet-list': minor
'@richkit/extension-code': minor
'@richkit/extension-code-block': minor
'@richkit/extension-heading': minor
'@richkit/extension-history': minor
'@richkit/extension-image': minor
'@richkit/extension-italic': minor
'@richkit/extension-link': minor
'@richkit/extension-list-item': minor
'@richkit/extension-markdown-shortcuts': minor
'@richkit/extension-ordered-list': minor
'@richkit/extension-paragraph': minor
'@richkit/extension-placeholder': minor
'@richkit/extension-strike': minor
'@richkit/extension-table': minor
'@richkit/extension-task-list': minor
'@richkit/extension-underline': minor
---

Initial v0.1.0 release — Phase 1 MVP.

- Headless ProseMirror-based editor core with extension API
- React binding (`useEditor`, `EditorContent`, `Toolbar`, `BubbleMenu`)
- 20 extensions: paragraph, heading, blockquote, code-block, bullet/ordered/task lists,
  list-item, table (with column-resize), image (with NodeView resize), link (with autolink),
  bold/italic/underline/strike/inline-code marks, history, placeholder, markdown-shortcuts
- StarterKit bundle
- HTML import/export, JSON, autosave with debounce
- Mod-B/I/U/Shift-S/E mark shortcuts, Mod-Alt-1..6 headings, Mod-Shift-7/8/9 lists,
  Tab/Shift-Tab list nest/unnest, Enter splits list items
- Markdown input rules: `# `..`###### `, `> `, `- `, `1. `, ` ``` `, `**bold**`, `*italic*`, `~~strike~~`, `` `code` ``, URL autolink
