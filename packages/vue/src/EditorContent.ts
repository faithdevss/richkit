import type { Editor } from '@richkit/core'
import { defineComponent, h, ref, watch, type PropType } from 'vue'

export const EditorContent = defineComponent({
  name: 'EditorContent',
  props: {
    editor: {
      type: Object as PropType<Editor | null>,
      default: null,
    },
  },
  setup(props, { attrs }) {
    const root = ref<HTMLDivElement | null>(null)

    watch(
      [root, () => props.editor],
      ([container, editor], _prev, onCleanup) => {
        if (!container || !editor) return
        container.appendChild(editor.view.dom)
        onCleanup(() => {
          if (editor.view.dom.parentNode === container) {
            container.removeChild(editor.view.dom)
          }
        })
      },
      { immediate: true, flush: 'post' },
    )

    return () => h('div', { ...attrs, ref: root })
  },
})
