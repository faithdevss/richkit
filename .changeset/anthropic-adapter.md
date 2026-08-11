---
'@richkit/ai-anthropic': minor
---

Add `@richkit/ai-anthropic` — Anthropic (Claude) transport for `@richkit/extension-ai`.

Streams the Messages API SSE response into the editor. Zero runtime dependencies: proxy
through your own endpoint (recommended) or pass an end-user-supplied key with
`dangerouslyBrowserApiKey`. Defaults to `claude-sonnet-5` with thinking off for
immediate streaming; surfaces refusals, stream errors, and non-2xx bodies as thrown
errors that `extension-ai` reports in its plugin state.
