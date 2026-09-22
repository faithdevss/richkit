import type { Editor } from '@richkitjs/core'
import { act, createRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import type { EditorHandle } from '../field'
import { MinimalEditor } from '../MinimalEditor'

let root: Root | null = null
let container: HTMLDivElement | null = null

function mount(element: React.ReactElement) {
  ;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  return act(async () => {
    root!.render(element)
  })
}

afterEach(() => {
  if (root) act(() => root!.unmount())
  container?.remove()
  root = null
  container = null
})

const typeAtEnd = (editor: Editor, text: string) =>
  act(async () => {
    const { tr, doc } = editor.state
    editor.view.dispatch(tr.insertText(text, doc.content.size - 1))
  })

describe('ready-made editors as form inputs', () => {
  it('works controlled, with a hidden input for native forms and a ref handle', async () => {
    let editor: Editor | null = null
    let value = ''
    const ref = createRef<EditorHandle>()

    function Form() {
      const [html, setHtml] = useState('<p>hello</p>')
      value = html
      return (
        <form>
          <MinimalEditor
            ref={ref}
            name="body"
            value={html}
            onChange={setHtml}
            onEditorReady={(e) => (editor = e)}
          />
        </form>
      )
    }

    await mount(<Form />)
    await typeAtEnd(editor!, '!')
    expect(value).toBe('<p>hello!</p>')

    const form = container!.querySelector('form')!
    expect(new FormData(form).get('body')).toBe('<p>hello!</p>')

    expect(ref.current!.getValue()).toBe('<p>hello!</p>')
    expect(typeof ref.current!.focus).toBe('function')

    // clear() is a user-visible edit: the parent's state follows it
    await act(async () => ref.current!.clear())
    expect(value).toBe('')
  })

  it('emits the format asked for', async () => {
    let editor: Editor | null = null
    let out: unknown

    await mount(
      <MinimalEditor
        format="text"
        defaultValue="plain"
        onChange={(v) => (out = v)}
        onEditorReady={(e) => (editor = e)}
      />,
    )
    await typeAtEnd(editor!, ' text')
    expect(out).toBe('plain text')
  })
})
