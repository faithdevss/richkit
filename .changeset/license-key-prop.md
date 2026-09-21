---
'@richkitjs/license': minor
'@richkitjs/editors-pro': minor
'@richkitjs/docx': minor
'@richkitjs/extension-comments': minor
'@richkitjs/extension-track-changes': minor
'@richkitjs/extension-ai': minor
'@richkitjs/ai-openai': minor
'@richkitjs/ai-anthropic': minor
---

Register a Pro licence key from a prop or an option, not only `setLicenseKey`.

Every Pro editor takes a `licenseKey` prop, and every Pro package that is not a
component takes the same key as an option: `Comment.configure({ licenseKey })`,
the new `trackChangesKit({ licenseKey })`, `AI.configure({ licenseKey })`,
`openaiComplete`/`anthropicComplete`, and the DOCX export and import helpers.

The key stays global to the page, so any one of them registers it for every Pro
package. `setLicenseKey` now ignores an empty value and re-registering the same
key, which makes it safe to call on every render and stops an unset env var in a
preview build from clearing a key something else already registered.
