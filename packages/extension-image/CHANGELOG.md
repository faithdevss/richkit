# @richkitjs/extension-image

## 0.3.0

### Minor Changes

- 2bd70a8: Unified menu design and new floating components.

  - Every dropdown, context menu and suggestion list now shares one frame, row, label and separator style, driven by new `--rk-menu-pad`, `--rk-item-pad`, `--rk-item-gap` and `--rk-text-xs/sm/md/base` custom properties. Toolbar dropdowns (block type, font family, font size, line height, table) are more compact, and the block type menu drops the "Normal text" label for a paragraph icon.
  - New `MenuList`, `MenuItem`, `MenuLabel` and `MenuSeparator` components with arrow-key navigation; the toolbar menus are built on them. Font menus' rows are now `menuitemradio`.
  - `Popover` opens from the keyboard and moves focus into the panel.
  - New `LinkCard` (URL, edit, copy, unlink under the link at the cursor), `TableToolbar` (row / column / cell menus above the table at the cursor) and `WordCount` (live count with selection and soft-limit support). The Classic, Docx and Notion-like editors include the link card and table toolbar.
  - The image toolbar gains 25% / 50% / 100% width presets and Delete, and shows the current alignment.
  - Fix: centre and right image alignment had no effect in the editor (an inline `display` overrode the stylesheet). A right-aligned image's toolbar now opens leftwards.

## 0.2.2

### Patch Changes

- 80bce48: HTML sanitizing and a read-only viewer.

  - `sanitizeHtml()` and `renderHtml()` in `@richkitjs/html` clean untrusted HTML, or render a `getJSON()` document, through the schema without mounting an editor.
  - `RichViewer` component for React and Vue displays stored content read-only.
  - `isSafeUrl`, `safeUrl` and `getSchema` exported from core. `htmlToDoc` and `docToHtml` take an optional `document` for server rendering.
  - Security: link, image, bookmark, media, mention and embed extensions now reject `javascript:`, `vbscript:`, `data:text/html` and other script-capable URLs on parse, on render and in their insert commands.
  - Security: `htmlToDoc` now parses inside an inert document, so `<img onerror>` in content no longer runs while it is being parsed.

- Updated dependencies [80bce48]
- Updated dependencies [80bce48]
  - @richkitjs/core@0.3.0

## 0.2.1

### Patch Changes

- Updated dependencies [e100235]
- Updated dependencies [bd4933d]
- Updated dependencies [45334ad]
  - @richkitjs/core@0.2.0

## 0.2.0

### Minor Changes

- 83cc996: Close the gap against the documented Notion-style feature set.

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

## 0.1.0

### Minor Changes

- 534bdf5: Initial public release: headless ProseMirror core, 36 extensions, starter kit, markdown/HTML/DOCX converters, React and Vue 3 bindings.

### Patch Changes

- Updated dependencies [534bdf5]
  - @richkitjs/core@0.1.0
