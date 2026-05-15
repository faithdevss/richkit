---
'@rich-editor/core': minor
'@rich-editor/react': minor
'@rich-editor/starter-kit': minor
'@rich-editor/html': minor
'@rich-editor/extension-blockquote': minor
'@rich-editor/extension-bold': minor
'@rich-editor/extension-bullet-list': minor
'@rich-editor/extension-code': minor
'@rich-editor/extension-code-block': minor
'@rich-editor/extension-heading': minor
'@rich-editor/extension-history': minor
'@rich-editor/extension-image': minor
'@rich-editor/extension-italic': minor
'@rich-editor/extension-link': minor
'@rich-editor/extension-list-item': minor
'@rich-editor/extension-markdown-shortcuts': minor
'@rich-editor/extension-ordered-list': minor
'@rich-editor/extension-paragraph': minor
'@rich-editor/extension-placeholder': minor
'@rich-editor/extension-strike': minor
'@rich-editor/extension-table': minor
'@rich-editor/extension-task-list': minor
'@rich-editor/extension-underline': minor
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
