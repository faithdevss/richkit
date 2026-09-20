# @richkitjs/markdown

Markdown serialization and parsing for [@richkitjs/core](https://www.npmjs.com/package/@richkitjs/core).

## Install

```sh
npm install @richkitjs/markdown @richkitjs/core
```

## Usage

```ts
import { docToMarkdown, markdownToDoc, setMarkdownContent } from '@richkitjs/markdown'

const md = docToMarkdown(editor.state.doc)
setMarkdownContent(editor, '# Hello\n\nWorld')
```

## Docs

See the [repository](https://github.com/faithdevss/richkit#readme) for full documentation.

## License

[MIT](./LICENSE) — free for any use, commercial or not.

Need DOCX, track changes, comments, AI or the Pro editors (Notion, Classic, Question…)? Those are
[RichKit Pro](https://faithdevss.github.io/richkit/pricing).
