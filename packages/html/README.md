# @richkitjs/html

HTML serialization helpers for [@richkitjs/core](https://www.npmjs.com/package/@richkitjs/core). Re-exports `htmlToDoc` and `docToHtml` for standalone use (e.g. server-side rendering of stored documents).

## Install

```sh
npm install @richkitjs/html @richkitjs/core
```

## Usage

```ts
import { htmlToDoc, docToHtml } from '@richkitjs/html'

const html = docToHtml(editor.state.doc)
```

## Docs

See the [repository](https://github.com/faithdevss/richkit#readme) for full documentation.

## License

[MIT](./LICENSE) — free for any use, commercial or not.

Need DOCX, track changes, comments, AI or the Pro editors (Notion, Classic, Question…)? Those are
[RichKit Pro](https://faithdevss.github.io/richkit/pricing).
