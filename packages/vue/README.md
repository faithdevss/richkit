# @richkitjs/vue

Vue 3 bindings for [@richkitjs/core](https://www.npmjs.com/package/@richkitjs/core).

## Install

```sh
npm install @richkitjs/vue @richkitjs/core @richkitjs/starter-kit
```

## Usage

```vue
<script setup lang="ts">
import { useEditor, EditorContent } from '@richkitjs/vue'
import { StarterKit } from '@richkitjs/starter-kit'

const editor = useEditor({
  extensions: [...StarterKit],
  content: '<p>Hello world</p>',
})
</script>

<template>
  <button :disabled="!editor" @click="editor?.commands.toggleBold()">Bold</button>
  <EditorContent :editor="editor" />
</template>
```

`useEditor` returns a shallow ref that re-triggers on every document and selection change, so computed state like active marks stays reactive.

To share the editor with deeply nested components, use `provideEditor(editor)` in the parent and `useEditorContext()` in descendants.

## Docs

See the [repository](https://github.com/faithdevss/rich_editor#readme) for full documentation.
