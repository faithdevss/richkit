---
'@richkitjs/license': minor
'@richkitjs/docx': minor
'@richkitjs/extension-track-changes': minor
'@richkitjs/extension-comments': minor
'@richkitjs/extension-ai': minor
'@richkitjs/ai-openai': minor
'@richkitjs/ai-anthropic': minor
'@richkitjs/editors-pro': minor
'@richkitjs/editors': minor
'@richkitjs/starter-kit': minor
---

RichKit is now open-core.

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
