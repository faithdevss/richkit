import { Node } from '@richkitjs/core'
import { act } from 'react'
import { useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { useEditor } from '../useEditor'

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

describe('useEditor', () => {
  it("calls the current render's onUpdate, not the mount-time closure", async () => {
    const seen: string[] = []
    let editor: ReturnType<typeof useEditor> = null
    let bumpLabel: (v: string) => void = () => {}

    function App() {
      const [label, setLabel] = useState('v1')
      bumpLabel = setLabel
      editor = useEditor({
        extensions: [Paragraph],
        content: '<p>hi</p>',
        onUpdate: ({ editor }) => seen.push(`${label}:${editor.getText()}`),
      })
      return null
    }

    await mount(<App />)
    await act(async () => editor!.setContent('<p>one</p>'))
    expect(seen).toEqual(['v1:one'])

    // A re-render must re-point the handler at the new closure.
    await act(async () => bumpLabel('v2'))
    await act(async () => editor!.setContent('<p>two</p>'))
    expect(seen).toEqual(['v1:one', 'v2:two'])
  })

  it('keeps the same editor instance across re-renders', async () => {
    let editor: ReturnType<typeof useEditor> = null
    let bump: (v: number) => void = () => {}

    function App() {
      const [, setN] = useState(0)
      bump = setN
      editor = useEditor({ extensions: [Paragraph], content: '<p>hi</p>' })
      return null
    }

    await mount(<App />)
    const first = editor
    expect(first).not.toBeNull()

    await act(async () => bump(1))
    expect(editor).toBe(first)
    expect(editor!.isDestroyed).toBe(false)
  })

  it('destroys the editor on unmount', async () => {
    let editor: ReturnType<typeof useEditor> = null

    function App() {
      editor = useEditor({ extensions: [Paragraph], content: '<p>hi</p>' })
      return null
    }

    await mount(<App />)
    const instance = editor!
    act(() => root!.unmount())
    root = null
    expect(instance.isDestroyed).toBe(true)
  })
})
