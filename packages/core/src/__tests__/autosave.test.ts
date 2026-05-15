import { describe, expect, it, vi } from 'vitest'
import { Editor } from '../editor'
import { createAutosave } from '../autosave'
import { Node } from '../extension/node'

const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'p' }],
  renderHTML: () => ['p', 0],
})

describe('autosave', () => {
  it('debounces onSave calls', async () => {
    vi.useFakeTimers()
    const onSave = vi.fn()
    const editor = new Editor({ extensions: [Paragraph], content: '<p>hi</p>' })
    const dispose = createAutosave(editor, { onSave, debounceMs: 100 })

    editor.view.dispatch(editor.state.tr.insertText('a'))
    editor.view.dispatch(editor.state.tr.insertText('b'))
    editor.view.dispatch(editor.state.tr.insertText('c'))

    expect(onSave).not.toHaveBeenCalled()
    vi.advanceTimersByTime(150)
    expect(onSave).toHaveBeenCalledTimes(1)

    dispose()
    editor.destroy()
    vi.useRealTimers()
  })
})
