---
'@richkitjs/core': patch
---

`configure()` now returns a configured copy instead of changing the extension in place.

Before, `Placeholder.configure({ placeholder: 'Reply…' })` also changed the `Placeholder`
inside `StarterKit`, so every editor on the page picked up the last placeholder configured
anywhere, and `Link.configure(...)` in one editor changed links in all of them. Code that
uses the returned value, which is how `configure` is documented, needs no change.
