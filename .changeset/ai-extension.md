---
'@richkit/extension-ai': minor
'@richkit/ai-openai': minor
---

Add `@richkit/extension-ai` and `@richkit/ai-openai`.

`extension-ai` is the vendor-neutral seam: `aiPrompt` / `aiCancel` / `aiRetry` / `aiAccept` /
`aiReject` commands stream a transport's text into the document, routed through
`@richkit/extension-track-changes` when installed so every AI edit lands as an accept- or
reject-able suggestion and the replaced text stays recoverable.

`ai-openai` is the OpenAI transport — chat-completions SSE over `fetch`, no runtime
dependencies. Proxy through your own endpoint (recommended) or pass an end-user-supplied key
with `dangerouslyBrowserApiKey`.
