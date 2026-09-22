# @richkitjs/extension-code-block

## 0.3.1

### Patch Changes

- Updated dependencies [80bce48]
- Updated dependencies [80bce48]
  - @richkitjs/core@0.3.0

## 0.3.0

### Minor Changes

- 08f0dc7: Ship a slim set of syntax-highlighting grammars by default.

  The code block used to register lowlight's `common` set — 37 highlight.js grammars — so
  every editor bundle carried about 165 KB of minified highlighting code whether or not it
  ever showed a code block. It now registers 16 grammars out of the box (bash, css, diff,
  go, java, javascript, json, markdown, php, python, rust, shell, sql, typescript, xml,
  yaml), which roughly halves highlight.js and takes the full starter kit from about 208 KB
  to 184 KB gzipped.

  Other languages are one option away:

  ```ts
  import { common } from 'lowlight'
  import ruby from 'highlight.js/lib/languages/ruby'

  CodeBlock.configure({ languages: common }) // the previous set
  CodeBlock.configure({ languages: { ruby } }) // just what you need
  ```

  Also:

  - Language aliases now highlight, e.g. `language-js` and `language-html`.
  - A block whose language has no registered grammar keeps that language in the picker
    instead of showing a blank selection.
  - New exports: `defaultLanguages`, `createHighlighter`, `highlighterFor`, and the
    `Highlighter` and `LanguageFn` types. `getRegisteredLanguages` and
    `codeBlockHighlightPlugin` take an optional highlighter.

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
