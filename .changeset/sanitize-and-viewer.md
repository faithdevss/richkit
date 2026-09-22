---
'@richkitjs/core': minor
'@richkitjs/html': minor
'@richkitjs/react': minor
'@richkitjs/vue': minor
'@richkitjs/extension-link': patch
'@richkitjs/extension-image': patch
'@richkitjs/extension-bookmark': patch
'@richkitjs/extension-media': patch
'@richkitjs/extension-mention': patch
'@richkitjs/extension-embed': patch
'@richkitjs/editors': patch
---

HTML sanitizing and a read-only viewer.

- `sanitizeHtml()` and `renderHtml()` in `@richkitjs/html` clean untrusted HTML, or render a `getJSON()` document, through the schema without mounting an editor.
- `RichViewer` component for React and Vue displays stored content read-only.
- `isSafeUrl`, `safeUrl` and `getSchema` exported from core. `htmlToDoc` and `docToHtml` take an optional `document` for server rendering.
- Security: link, image, bookmark, media, mention and embed extensions now reject `javascript:`, `vbscript:`, `data:text/html` and other script-capable URLs on parse, on render and in their insert commands.
- Security: `htmlToDoc` now parses inside an inert document, so `<img onerror>` in content no longer runs while it is being parsed.
