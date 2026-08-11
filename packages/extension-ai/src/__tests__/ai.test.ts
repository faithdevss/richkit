import { Editor, Node } from '@richkitjs/core'
import { TrackChangesKit, getSuggestions, getTrackState } from '@richkitjs/extension-track-changes'
import { TextSelection } from 'prosemirror-state'
import { describe, expect, it } from 'vitest'
import { AI, type AIComplete } from '../index'
import { getAIState } from '../plugin'

const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'p' }],
  renderHTML: () => ['p', 0],
})

/** Yields the given chunks, honouring cancellation between each. */
function chunks(parts: string[], onChunk?: () => void): AIComplete {
  return async function* (_req, { signal }) {
    for (const part of parts) {
      if (signal.aborted) return
      onChunk?.()
      yield part
    }
  }
}

/** A transport that rejects on the first read, e.g. a network or auth failure. */
const failing: AIComplete = () => ({
  [Symbol.asyncIterator]: () => ({
    next: () => Promise.reject(new Error('transport exploded')),
  }),
})

function makeEditor(complete: AIComplete, content = '<p>hello</p>', track = true) {
  return new Editor({
    extensions: [Paragraph, ...TrackChangesKit, AI.configure({ complete, track })],
    content,
  })
}

/** Let the streaming loop drain — it advances on microtasks. */
const settle = () => new Promise((r) => setTimeout(r, 0))

function select(editor: Editor, from: number, to: number) {
  editor.view.dispatch(
    editor.state.tr.setSelection(TextSelection.create(editor.state.doc, from, to)),
  )
}

describe('AI extension', () => {
  it('streams a completion in at the cursor', async () => {
    const editor = makeEditor(chunks(['Hello', ' ', 'world']))
    editor.commands.aiPrompt!({ prompt: 'greet' })
    await settle()

    expect(editor.getText()).toContain('Hello world')
    expect(getAIState(editor.state)?.status).toBe('idle')
    editor.destroy()
  })

  it('marks streamed text as an insertion suggestion', async () => {
    const editor = makeEditor(chunks(['added text']))
    editor.commands.aiPrompt!({ prompt: 'write' })
    await settle()

    expect(editor.getHTML()).toContain('data-suggestion="insertion"')
    expect(editor.getHTML()).toContain('data-suggestion-author="AI Assistant"')
    editor.destroy()
  })

  it('rewrite marks the replaced range as a deletion and keeps its text', async () => {
    const editor = makeEditor(chunks(['goodbye']))
    select(editor, 1, 6) // "hello"
    editor.commands.aiPrompt!({ prompt: 'replace it' })
    await settle()

    const html = editor.getHTML()
    expect(html).toContain('data-suggestion="deletion"')
    expect(html).toContain('data-suggestion="insertion"')
    // original text survives until the suggestion is resolved
    expect(editor.getText()).toContain('hello')
    expect(editor.getText()).toContain('goodbye')
    editor.destroy()
  })

  it('aiAccept keeps the new text and drops what it replaced', async () => {
    const editor = makeEditor(chunks(['goodbye']))
    select(editor, 1, 6)
    editor.commands.aiPrompt!({ prompt: 'replace it' })
    await settle()

    editor.commands.aiAccept!()

    const text = editor.getText()
    expect(text).toContain('goodbye')
    expect(text).not.toContain('hello')
    expect(editor.getHTML()).not.toContain('data-suggestion')
    editor.destroy()
  })

  it('aiReject restores the original and removes the new text', async () => {
    const editor = makeEditor(chunks(['goodbye']))
    select(editor, 1, 6)
    editor.commands.aiPrompt!({ prompt: 'replace it' })
    await settle()

    editor.commands.aiReject!()

    const text = editor.getText()
    expect(text).toContain('hello')
    expect(text).not.toContain('goodbye')
    expect(editor.getHTML()).not.toContain('data-suggestion')
    editor.destroy()
  })

  it('aiCancel stops the stream partway', async () => {
    let emitted = 0
    const editor = makeEditor(
      chunks(['one ', 'two ', 'three ', 'four '], () => {
        emitted += 1
        if (emitted === 2) editor.commands.aiCancel!()
      }),
    )
    editor.commands.aiPrompt!({ prompt: 'count' })
    await settle()

    expect(emitted).toBeLessThan(4)
    expect(getAIState(editor.state)?.status).toBe('idle')
    editor.destroy()
  })

  it('surfaces transport failures as error state', async () => {
    const editor = makeEditor(failing)
    editor.commands.aiPrompt!({ prompt: 'boom' })
    await settle()

    const s = getAIState(editor.state)
    expect(s?.status).toBe('error')
    expect(s?.error).toContain('transport exploded')
    editor.destroy()
  })

  it('restores the previous tracking state after a run', async () => {
    const editor = makeEditor(chunks(['text']))
    expect(getTrackState(editor.state)).toMatchObject({ enabled: false, author: 'You' })

    editor.commands.aiPrompt!({ prompt: 'write' })
    await settle()

    // the run turned tracking on as the AI author — it must hand it back
    expect(getTrackState(editor.state)).toMatchObject({ enabled: false, author: 'You' })
    editor.destroy()
  })

  it('leaves tracking on if it was already on, under the original author', async () => {
    const editor = makeEditor(chunks(['text']))
    editor.commands.enableTrackChanges!('Reviewer')
    editor.commands.aiPrompt!({ prompt: 'write' })
    await settle()

    expect(getTrackState(editor.state)).toMatchObject({ enabled: true, author: 'Reviewer' })
    editor.destroy()
  })

  it('keeps the replaced range pinned to the original text', async () => {
    const editor = makeEditor(chunks(['goodbye']))
    select(editor, 1, 6) // "hello"
    editor.commands.aiPrompt!({ prompt: 'replace it' })
    await settle()

    // regression: mapping `to` forward let this swallow the AI's own output,
    // which would make aiAccept resolve unrelated suggestions inside the span
    expect(getAIState(editor.state)?.replaced).toEqual({ from: 1, to: 6 })
    editor.destroy()
  })

  it('resolving a run leaves an unrelated suggestion alone', async () => {
    const editor = makeEditor(chunks(['goodbye']), '<p>hello there world</p>')

    // A human deletion sitting between the replaced text and where the AI will
    // write — i.e. inside the span the buggy mapping used to inflate to.
    // The track plugin only auto-marks insertions, so build the deletion the
    // same way a Delete keypress does: apply the mark directly.
    const delType = editor.state.schema.marks['deletion']!
    editor.view.dispatch(
      editor.state.tr.addMark(
        7,
        12, // "there"
        delType.create({ id: 'human_del', author: 'Human', createdAt: Date.now() }),
      ),
    )
    const humanIds = getSuggestions(editor.state).map((s) => s.id)
    expect(humanIds).toEqual(['human_del'])

    select(editor, 1, 6) // "hello"
    editor.commands.aiPrompt!({ prompt: 'replace it' })
    await settle()
    editor.commands.aiAccept!()

    // the human's suggestion must survive the AI run being accepted
    expect(getSuggestions(editor.state).map((s) => s.id)).toEqual(humanIds)
    editor.destroy()
  })

  it('does nothing without a transport configured', () => {
    const editor = new Editor({
      extensions: [Paragraph, ...TrackChangesKit, AI.configure({ complete: null })],
      content: '<p>hello</p>',
    })
    expect(editor.commands.aiPrompt!({ prompt: 'x' })).toBe(false)
    editor.destroy()
  })

  it('refuses to start a second run while streaming', async () => {
    const editor = makeEditor(chunks(['a', 'b', 'c']))
    editor.commands.aiPrompt!({ prompt: 'first' })
    const second = editor.commands.aiPrompt!({ prompt: 'second' })
    expect(second).toBe(false)
    await settle()
    editor.destroy()
  })

  it('untracked mode inserts plain text and rejects by deleting it', async () => {
    const editor = new Editor({
      extensions: [Paragraph, AI.configure({ complete: chunks(['plain']), track: false })],
      content: '<p>hello</p>',
    })
    editor.commands.aiPrompt!({ prompt: 'write' })
    await settle()

    expect(editor.getText()).toContain('plain')
    expect(editor.getHTML()).not.toContain('data-suggestion')

    editor.commands.aiReject!()
    expect(editor.getText()).not.toContain('plain')
    editor.destroy()
  })
})
