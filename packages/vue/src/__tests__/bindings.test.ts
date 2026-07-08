import { Node, type Editor } from '@rich-editor/core'
import { describe, expect, it } from 'vitest'
import { createApp, h, nextTick, type ShallowRef } from 'vue'
import { EditorContent, useEditor } from '../index'

const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'p' }],
  renderHTML: () => ['p', 0],
})

function mountApp() {
  const host = document.createElement('div')
  document.body.appendChild(host)
  let editorRef: ShallowRef<Editor | null> | null = null
  const app = createApp({
    setup() {
      const editor = useEditor({ extensions: [Paragraph], content: '<p>hello</p>' })
      editorRef = editor
      return () => h(EditorContent, { editor: editor.value })
    },
  })
  app.mount(host)
  return { app, host, editorRef: editorRef! as ShallowRef<Editor | null> }
}

describe('vue bindings', () => {
  it('creates editor and mounts its DOM into EditorContent', async () => {
    const { app, host, editorRef } = mountApp()
    await nextTick()
    await nextTick()

    const editor = editorRef.value
    expect(editor).toBeTruthy()
    expect(host.contains(editor!.view.dom)).toBe(true)
    expect(editor!.getHTML()).toContain('hello')

    app.unmount()
    expect(editorRef.value).toBeNull()
    host.remove()
  })

  it('re-triggers the ref on document updates', async () => {
    const { app, host, editorRef } = mountApp()
    await nextTick()
    await nextTick()

    let notified = false
    const stop = (await import('vue')).watch(
      editorRef,
      () => {
        notified = true
      },
      { deep: false },
    )

    const editor = editorRef.value!
    const tr = editor.state.tr.insertText('!', editor.state.doc.content.size - 1)
    editor.view.dispatch(tr)
    await nextTick()

    expect(notified).toBe(true)
    expect(editor.getHTML()).toContain('hello!')

    stop()
    app.unmount()
    host.remove()
  })
})
