# @rich-editor/core

Headless, framework-agnostic rich text editor core built on [ProseMirror](https://prosemirror.net). No UI included — bring your own toolbar, or use the framework bindings.

## Install

```sh
npm install @rich-editor/core @rich-editor/starter-kit
```

## Usage

```ts
import { Editor } from '@rich-editor/core'
import { StarterKit } from '@rich-editor/starter-kit'

const editor = new Editor({
  extensions: [...StarterKit],
  content: '<p>Hello world</p>',
})

document.querySelector('#app').appendChild(editor.view.dom)
```

## Framework bindings

- React: [@rich-editor/react](https://www.npmjs.com/package/@rich-editor/react)
- Vue 3: [@rich-editor/vue](https://www.npmjs.com/package/@rich-editor/vue)

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
