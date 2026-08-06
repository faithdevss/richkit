# @richkit/core

Headless, framework-agnostic rich text editor core built on [ProseMirror](https://prosemirror.net). No UI included — bring your own toolbar, or use the framework bindings.

## Install

```sh
npm install @richkit/core @richkit/starter-kit
```

## Usage

```ts
import { Editor } from '@richkit/core'
import { StarterKit } from '@richkit/starter-kit'

const editor = new Editor({
  extensions: [...StarterKit],
  content: '<p>Hello world</p>',
})

document.querySelector('#app').appendChild(editor.view.dom)
```

## Framework bindings

- React: [@richkit/react](https://www.npmjs.com/package/@richkit/react)
- Vue 3: [@richkit/vue](https://www.npmjs.com/package/@richkit/vue)

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
