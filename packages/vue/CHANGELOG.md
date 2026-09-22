# @richkitjs/vue

## 0.2.0

### Minor Changes

- 80bce48: HTML sanitizing and a read-only viewer.

  - `sanitizeHtml()` and `renderHtml()` in `@richkitjs/html` clean untrusted HTML, or render a `getJSON()` document, through the schema without mounting an editor.
  - `RichViewer` component for React and Vue displays stored content read-only.
  - `isSafeUrl`, `safeUrl` and `getSchema` exported from core. `htmlToDoc` and `docToHtml` take an optional `document` for server rendering.
  - Security: link, image, bookmark, media, mention and embed extensions now reject `javascript:`, `vbscript:`, `data:text/html` and other script-capable URLs on parse, on render and in their insert commands.
  - Security: `htmlToDoc` now parses inside an inert document, so `<img onerror>` in content no longer runs while it is being parsed.

### Patch Changes

- Updated dependencies [80bce48]
- Updated dependencies [80bce48]
  - @richkitjs/core@0.3.0
  - @richkitjs/html@0.2.0

## 0.1.1

### Patch Changes

- Updated dependencies [e100235]
- Updated dependencies [bd4933d]
- Updated dependencies [45334ad]
  - @richkitjs/core@0.2.0

## 0.1.0

### Minor Changes

- 534bdf5: Initial public release: headless ProseMirror core, 36 extensions, starter kit, markdown/HTML/DOCX converters, React and Vue 3 bindings.

### Patch Changes

- Updated dependencies [534bdf5]
  - @richkitjs/core@0.1.0
