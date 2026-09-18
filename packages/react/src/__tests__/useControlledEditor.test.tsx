import { Node, type Editor } from '@richkitjs/core'
import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { useControlledEditor } from '../useControlledEditor'
import type { ValueFormat } from '../value'

const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'p' }],
  renderHTML: () => ['p', 0],
})

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

// Types into the document the way a keystroke would: a plain transaction.
function type(editor: Editor, text: string) {
  const { tr, doc } = editor.state
  editor.view.dispatch(tr.insertText(text, doc.content.size - 1))
}

describe('useControlledEditor', () => {
  it('emits onChange in the chosen format and keeps the caret on echo', async () => {
    let editor: Editor | null = null
    let value = ''

    function App() {
      const [html, setHtml] = useState('<p>hi</p>')
      value = html
      editor = useControlledEditor({ extensions: [Paragraph], value: html, onChange: setHtml })
      return null
    }

    await mount(<App />)
    let dispatched = 0
    editor!.on('transaction', () => dispatched++)
    await act(async () => type(editor!, '!'))
    expect(value).toBe('<p>hi!</p>')
    // The echo of our own value must not trigger a second (setContent) dispatch.
    expect(dispatched).toBe(1)
  })

  it('applies an outside value silently', async () => {
    let editor: Editor | null = null
    let set: (v: string) => void = () => {}
    const changes: string[] = []

    function App() {
      const [html, setHtml] = useState('<p>a</p>')
      set = setHtml
      editor = useControlledEditor({
        extensions: [Paragraph],
        value: html,
        onChange: (v) => changes.push(v),
      })
      return null
    }

    await mount(<App />)
    await act(async () => set('<p>reset</p>'))
    expect(editor!.getHTML()).toBe('<p>reset</p>')
    expect(changes).toEqual([])
  })

  it('reports an emptied document as an empty string', async () => {
    let editor: Editor | null = null
    const changes: string[] = []

    function App() {
      editor = useControlledEditor({
        extensions: [Paragraph],
        defaultValue: '<p>x</p>',
        onChange: (v) => changes.push(v),
      })
      return null
    }

    await mount(<App />)
    await act(async () => {
      const { tr, doc } = editor!.state
      editor!.view.dispatch(tr.delete(1, doc.content.size - 1))
    })
    expect(changes).toEqual([''])
  })

  it.each<[ValueFormat, unknown]>([
    ['text', 'line one\nline two'],
    ['markdown', 'line one\n\nline two'],
  ])('round-trips %s', async (format, expected) => {
    let out: unknown
    let editor: Editor | null = null

    function App() {
      editor = useControlledEditor({
        extensions: [Paragraph],
        format,
        defaultValue: format === 'text' ? 'line one\nline two' : 'line one\n\nline two',
        onChange: (v) => (out = v),
      })
      return null
    }

    await mount(<App />)
    await act(async () => {
      const { tr } = editor!.state
      editor!.view.dispatch(tr.insertText('!', 1))
    })
    expect(out).toBe(`!${expected as string}`)
  })

  it('toggles editable on disabled without rebuilding', async () => {
    let editor: Editor | null = null
    let setDisabled: (v: boolean) => void = () => {}

    function App() {
      const [disabled, set] = useState(false)
      setDisabled = set
      editor = useControlledEditor({ extensions: [Paragraph], disabled })
      return null
    }

    await mount(<App />)
    const first = editor
    await act(async () => setDisabled(true))
    expect(editor).toBe(first)
    expect(editor!.isEditable).toBe(false)
  })
})
