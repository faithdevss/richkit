# @richkitjs/ai-anthropic

## 0.1.0

### Minor Changes

- 6a56d74: Add `@richkitjs/ai-anthropic` — Anthropic (Claude) transport for `@richkitjs/extension-ai`.

  Streams the Messages API SSE response into the editor. Zero runtime dependencies: proxy
  through your own endpoint (recommended) or pass an end-user-supplied key with
  `dangerouslyBrowserApiKey`. Defaults to `claude-sonnet-5` with thinking off for
  immediate streaming; surfaces refusals, stream errors, and non-2xx bodies as thrown
  errors that `extension-ai` reports in its plugin state.

### Patch Changes

- Updated dependencies [dd70dd2]
  - @richkitjs/extension-ai@0.1.0
