# @richkitjs/html

Sanitize, render and convert HTML for [@richkitjs/core](https://www.npmjs.com/package/@richkitjs/core) without mounting an editor.

## Install

```sh
npm install @richkitjs/html @richkitjs/core
```

## Sanitize untrusted HTML

Only what your extensions define survives: `<script>`, `on*` handlers and unknown tags are
dropped, and `javascript:` / `data:text/html` URLs are removed.

```ts
import { sanitizeHtml } from '@richkitjs/html'
import { StarterKit } from '@richkitjs/starter-kit'

const clean = sanitizeHtml(untrusted, { extensions: StarterKit })
```

## Render stored content

```ts
import { renderHtml } from '@richkitjs/html'

renderHtml(post.html, { extensions: StarterKit })
renderHtml(post.json, { extensions: StarterKit }) // editor.getJSON() output
```

On a server, pass a `document` from jsdom, linkedom or happy-dom:
`sanitizeHtml(html, { extensions, document })`.

For a component, use `RichViewer` from `@richkitjs/react` or `@richkitjs/vue`.

## Lower-level helpers

`htmlToDoc`, `docToHtml`, `getSchema`, `isSafeUrl` and `safeUrl` are re-exported from core.

## Docs

See the [repository](https://github.com/faithdevss/richkit#readme) for full documentation.

## License

[MIT](./LICENSE) — free for any use, commercial or not.

Need DOCX, track changes, comments, AI or the Pro editors (Notion, Classic, Question…)? Those are
[RichKit Pro](https://faithdevss.github.io/richkit/pricing).
