# @richkitjs/editors

## 0.2.0

### Minor Changes

- 3ec0ab4: RichKit is now open-core.

  The core editor, the React and Vue bindings, the starter kit, HTML, Markdown and every basic
  extension stay **MIT** — free for any use.

  `docx`, `extension-track-changes`, `extension-comments`, `extension-ai`, `ai-openai`,
  `ai-anthropic` and the new `editors-pro` become **RichKit Pro**, under the RichKit Pro License Agreement.
  They run without a key on localhost and other development hosts. In production, register the
  key you receive after purchase:

  ```ts
  import { setLicenseKey } from '@richkitjs/license'

  setLicenseKey('YOUR-LICENCE-KEY')
  ```

  The new `@richkitjs/license` package verifies the key offline — no activation call, no
  telemetry. Without a valid key, Pro packages show a small "unlicensed" badge and log one
  warning; they never stop working or block editing. A key keeps working, forever, with every
  release up to its "updates until" date.

  **Breaking — `@richkitjs/starter-kit`:** `StarterKit` no longer includes `Comment` or
  `TrackChangesKit`, and no longer re-exports them. Add them yourself:

  ```ts
  import { Comment } from '@richkitjs/extension-comments'
  import { TrackChangesKit } from '@richkitjs/extension-track-changes'

  useEditor({ extensions: [...StarterKit, Comment, ...TrackChangesKit] })
  ```

  **Breaking — `@richkitjs/editors`:** `SimpleEditor`, `NotionEditor`, `ClassicEditor`, `QuestionEditor`,
  `CommentsEditor`, `TrackChangesEditor`, `DocxEditor` and `AgentEditor` moved to the new
  `@richkitjs/editors-pro`. `@richkitjs/editors` keeps the free editors (Minimal, HTML,
  Markdown, Mentions, Comment box, Find & replace), is MIT, and now exports its field helpers
  (`useEditorField`, `FieldValue`, `useTheme`, `withPlaceholder`, `cx`) for building your own.
  Both packages share `@richkitjs/editors/style.css`.

  `AgentEditor` gains a `complete` prop that takes the same streaming transport as
  `@richkitjs/extension-ai` (e.g. `anthropicComplete({ endpoint: '/api/ai' })`). Drafted sections
  stream into the document as Markdown-rendered content, land as one undo step, and can be
  stopped mid-stream.

- 45334ad: New `@richkitjs/editors`: the showcase editors — Notion, Simple, Minimal, Classic
  (form field), Question, Markdown, HTML, DOCX, Comments, Track changes, Mentions,
  Comment box, Find & replace, Agent — as installable components. Each one is a
  form input: `value`/`defaultValue`/`onChange` in HTML (or `format="markdown" |
"text" | "json"`), `name` for native forms, `onBlur`, `disabled`, `readOnly`,
  and a ref with `focus()`, so `{...field}` from react-hook-form spreads straight
  on. Styles ship as `@richkitjs/editors/style.css`.

  `@richkitjs/react` adds `useControlledEditor` — `useEditor` with the same
  input contract — plus `getEditorValue`/`toEditorContent`. `useEditor` now
  re-renders on every transaction, not only on `update`/`selectionUpdate`, and
  `Toolbar` goes inert while its editor is read-only.

  `@richkitjs/core` adds `setContent(content, { emitUpdate, addToHistory })`,
  `setEditable()` and `isEmpty`.

### Patch Changes

- f013bfd: Add undo and redo buttons to `DocxEditor`. Fix the image toolbar showing permanently (its
  `display: flex` overrode the `hidden` attribute) and overflowing narrow frames, and stop the
  Notion editor stacking two left gutters on phones.
- Updated dependencies [e100235]
- Updated dependencies [bd4933d]
- Updated dependencies [f79165d]
- Updated dependencies [a8e0ea2]
- Updated dependencies [3ec0ab4]
- Updated dependencies [45334ad]
- Updated dependencies [4a2efdf]
  - @richkitjs/core@0.2.0
  - @richkitjs/markdown@0.1.1
  - @richkitjs/extension-math@0.1.0
  - @richkitjs/starter-kit@0.3.0
  - @richkitjs/react@0.3.0
  - @richkitjs/extension-find-replace@0.1.1
  - @richkitjs/extension-mention@0.2.1
  - @richkitjs/extension-placeholder@0.1.1
  - @richkitjs/extension-word-count@0.1.1
