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

  it('hides the points field with showPoints={false}', async () => {
    await mount(<QuestionEditor showPoints={false} />)
    expect(container!.querySelector('.question-points')).toBeNull()
  })

  function Controlled(props: {
    initial: QuestionValue
    onValue: (q: QuestionValue) => void
    extra?: Partial<React.ComponentProps<typeof QuestionEditor>>
  }) {
    const [q, setQ] = useState(props.initial)
    props.onValue(q)
    return <QuestionEditor value={q} onChange={setQ} {...props.extra} />
  }

  const rows = () => container!.querySelectorAll('.question-option')
  const removeButtons = () =>
    container!.querySelectorAll<HTMLButtonElement>('.question-option-remove')
  const addButton = () => container!.querySelector<HTMLButtonElement>('.question-add-option')!

  it('adds and removes options, keeping ids and the correct answer aligned', async () => {
    let value!: QuestionValue
    let next = 0
    await mount(
      <Controlled
        initial={{
          stem: '',
          options: ['<p>a</p>', '<p>b</p>', '<p>c</p>'],
          optionIds: [10, 20, 30],
          correct: 2,
          points: 1,
        }}
        onValue={(q) => (value = q)}
        extra={{ createOptionId: () => `new-${next++}` }}
      />,
    )

    await act(async () => addButton().click())
    expect(value.options).toHaveLength(4)
    expect(value.optionIds).toEqual([10, 20, 30, 'new-0'])

    // removing B shifts C (the correct one) up to index 1 and takes its id along
    await act(async () => removeButtons()[1]!.click())
    expect(value.options).toEqual(['<p>a</p>', '<p>c</p>', ''])
    expect(value.optionIds).toEqual([10, 30, 'new-0'])
    expect(value.correct).toBe(1)
    expect(rows()).toHaveLength(3)

    // removing the correct option leaves none marked rather than guessing
    await act(async () => removeButtons()[1]!.click())
    expect(value.correct).toBe(-1)
    expect(value.optionIds).toEqual([10, 'new-0'])
  })

  it('respects minOptions and maxOptions', async () => {
    let value!: QuestionValue
    await mount(
      <Controlled
        initial={{ stem: '', options: ['<p>a</p>', '<p>b</p>'], correct: 0, points: 1 }}
        onValue={(q) => (value = q)}
        extra={{ minOptions: 2, maxOptions: 3 }}
      />,
    )
    expect([...removeButtons()].every((b) => b.disabled)).toBe(true)
    await act(async () => addButton().click())
    expect(value.options).toHaveLength(3)
    expect(addButton().disabled).toBe(true)
    // no ids in the value and no createOptionId: the value stays id-free
    expect(value.optionIds).toBeUndefined()
  })

  it('shows no add or remove controls when read-only', async () => {
    await mount(<QuestionEditor readOnly />)
    expect(container!.querySelector('.question-add-option')).toBeNull()
    expect(removeButtons()).toHaveLength(0)
  })
})
