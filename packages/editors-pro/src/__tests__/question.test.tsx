import type { Editor } from '@richkitjs/core'
import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { QuestionEditor, type QuestionValue } from '../QuestionEditor'

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

describe('QuestionEditor', () => {
  it('reports the whole question as one value', async () => {
    let stem: Editor | null = null
    let value: QuestionValue | undefined

    function Form() {
      const [q, setQ] = useState<QuestionValue>({
        stem: '<p>2 + 2 = ?</p>',
        options: ['<p>3</p>', '<p>4</p>'],
        correct: 0,
        points: 1,
      })
      value = q
      return <QuestionEditor value={q} onChange={setQ} onEditorReady={(e) => (stem = e)} />
    }

    await mount(<Form />)
    await typeAtEnd(stem!, '!')
    expect(value!.stem).toBe('<p>2 + 2 = ?!</p>')

    const marks = container!.querySelectorAll<HTMLButtonElement>('.question-option-mark')
    expect(marks).toHaveLength(2)
    await act(async () => marks[1]!.click())
    expect(value).toMatchObject({ correct: 1, options: ['<p>3</p>', '<p>4</p>'] })
  })
})
