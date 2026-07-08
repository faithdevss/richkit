# @rich-editor/vue

Vue 3 bindings for [@rich-editor/core](https://www.npmjs.com/package/@rich-editor/core).

## Install

```sh
npm install @rich-editor/vue @rich-editor/core @rich-editor/starter-kit
```

## Usage

```vue
<script setup lang="ts">
import { useEditor, EditorContent } from '@rich-editor/vue'
import { StarterKit } from '@rich-editor/starter-kit'

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
