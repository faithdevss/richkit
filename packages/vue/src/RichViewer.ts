import type { AnyExtension } from '@richkitjs/core'
import { renderHtml, type RenderContent, type RenderHtmlOptions } from '@richkitjs/html'
import { computed, defineComponent, h, type PropType } from 'vue'

/**
 * Read-only display of editor content. No editor is mounted: the content is
 * run through the schema once, with unsafe tags, attributes and URLs removed,
 * and the resulting markup is rendered as-is. Give it the editor's class
 * (`class="editor"` with `@richkitjs/editors/style.css`) to match styles.
 */
export const RichViewer = defineComponent({
  name: 'RichViewer',
  props: {
    /** What `getHTML()` or `getJSON()` produced, or any HTML to show safely. */
    content: {
      type: [String, Object] as PropType<RenderContent>,
      default: '',
    },
    /** The extensions the content was written with. Pass this or `schema`. */
    extensions: {
      type: Array as PropType<readonly AnyExtension[]>,
      default: undefined,
    },
    /** A schema you already have, such as `editor.schema`. */
    schema: {
      type: Object as PropType<RenderHtmlOptions['schema']>,
      default: undefined,
    },
    /** A DOM `document` for server rendering (jsdom, linkedom, happy-dom). */
    document: {
      type: Object as PropType<Document>,
      default: undefined,
    },
  },
  setup(props) {
    const html = computed(() =>
      renderHtml(props.content, {
        extensions: props.extensions,
        schema: props.schema,
        document: props.document,
      }),
    )
    return () => h('div', { class: 'richkit-viewer', innerHTML: html.value })
  },
})
