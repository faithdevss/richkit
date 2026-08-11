# @richkitjs/core

Headless, framework-agnostic rich text editor core built on [ProseMirror](https://prosemirror.net). No UI included — bring your own toolbar, or use the framework bindings.

## Install

```sh
npm install @richkitjs/core @richkitjs/starter-kit
```

## Usage

```ts
import { Editor } from '@richkitjs/core'
import { StarterKit } from '@richkitjs/starter-kit'

const editor = new Editor({
  extensions: [...StarterKit],
  content: '<p>Hello world</p>',
})

document.querySelector('#app').appendChild(editor.view.dom)
```

## Framework bindings

- React: [@richkitjs/react](https://www.npmjs.com/package/@richkitjs/react)
- Vue 3: [@richkitjs/vue](https://www.npmjs.com/package/@richkitjs/vue)

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
