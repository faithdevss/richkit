import { Editor, type EditorOptions } from '@richkit/core'
import { onBeforeUnmount, onMounted, shallowRef, triggerRef, type ShallowRef } from 'vue'

/**
 * Creates an Editor instance bound to the component lifecycle.
 * The returned shallow ref is re-triggered on every document or
 * selection change, so templates reading editor state stay in sync.
 */
export function useEditor(options: EditorOptions): ShallowRef<Editor | null> {
  const editor = shallowRef<Editor | null>(null)

  onMounted(() => {
    const instance = new Editor(options)
    const bump = () => triggerRef(editor)
    instance.on('update', bump)
    instance.on('selectionUpdate', bump)
    editor.value = instance
  })

  onBeforeUnmount(() => {
    editor.value?.destroy()
    editor.value = null
  })

  return editor
}
