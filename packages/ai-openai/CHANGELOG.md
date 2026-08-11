# @richkitjs/ai-openai

## 0.1.0

### Minor Changes

- dd70dd2: Add `@richkitjs/extension-ai` and `@richkitjs/ai-openai`.

  `extension-ai` is the vendor-neutral seam: `aiPrompt` / `aiCancel` / `aiRetry` / `aiAccept` /
  `aiReject` commands stream a transport's text into the document, routed through
  `@richkitjs/extension-track-changes` when installed so every AI edit lands as an accept- or
  reject-able suggestion and the replaced text stays recoverable.

  `ai-openai` is the OpenAI transport — chat-completions SSE over `fetch`, no runtime
  dependencies. Proxy through your own endpoint (recommended) or pass an end-user-supplied key
  with `dangerouslyBrowserApiKey`.

### Patch Changes

- Updated dependencies [dd70dd2]
  - @richkitjs/extension-ai@0.1.0
