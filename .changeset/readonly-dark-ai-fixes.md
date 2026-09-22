---
'@richkitjs/react': patch
'@richkitjs/editors': patch
'@richkitjs/editors-pro': patch
'@richkitjs/extension-ai': minor
---

Read-only, dark theme and AI output fixes.

- The bubble menu no longer shows on a read-only or disabled editor. Its buttons used to edit the document anyway (`MinimalEditor`, `NotionEditor`).
- `AgentEditor` hides the agent while `readOnly` or `disabled`, and stops a running draft when either turns on.
- Comments, Track changes and Agent pages follow the dark theme instead of staying white with light text. The question's points field does too.
- `@richkitjs/extension-ai`: a new `parse` option turns the finished output into content, for example from Markdown. `aiPrompt` and `aiRetry` refuse to run on a read-only editor.
- `NotionEditor` AI output lands as headings, lists and formatting instead of raw Markdown.
