import type { Editor } from '@richkitjs/core'
import type { AIComplete, AICompletionRequest } from '@richkitjs/extension-ai'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { AgentEditor } from '../AgentEditor'

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

const $ = <T extends Element>(selector: string) => container!.querySelector<T>(selector)!

async function ask(instruction: string) {
  await act(async () => $<HTMLButtonElement>('.agent-fab').click())
  const input = $<HTMLTextAreaElement>('.agent-dock-input')
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!
    setter.call(input, instruction)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await act(async () => $<HTMLButtonElement>('.agent-dock-run').click())
}

describe('AgentEditor with complete', () => {
  it('streams a Markdown section into the document as one undoable edit', async () => {
    let request: AICompletionRequest | undefined
    const complete: AIComplete = async function* (req) {
      request = req
      yield '```markdown\n## Budget\n\n'
      yield 'Costs are **flat**.\n\n- Year one\n'
      yield '- Year two\n```'
    }
    let editor: Editor | null = null
    const changes: string[] = []

    await mount(
      <AgentEditor
        defaultValue="<p>Intro</p>"
        complete={complete}
        onChange={(v) => changes.push(v)}
        onEditorReady={(e) => (editor = e)}
      />,
    )
    await ask('the budget')

    expect(request!.prompt).toContain('Section to write: the budget')
    expect(request!.documentText).toContain('Intro')
    expect(editor!.getHTML()).toBe(
      '<p>Intro</p><h2>Budget</h2><p>Costs are <strong>flat</strong>.</p>' +
        '<ul><li><p>Year one</p></li><li><p>Year two</p></li></ul>',
    )
    // One onChange for the finished section, and one undo step removes it.
    expect(changes).toHaveLength(1)
    await act(async () => editor!.chain().call('undo').run())
    expect(editor!.getHTML()).toBe('<p>Intro</p>')
    // The dock closes once the section lands.
    expect($('.agent-dock')).toBeNull()
  })

  it('shows the error and leaves the document alone when the stream fails', async () => {
    // Paint every chunk at once, so a half-drawn draft is on the page when it fails.
    const raf = globalThis.requestAnimationFrame
    globalThis.requestAnimationFrame = (cb) => (cb(0), 1)
    let painted = ''
    const complete: AIComplete = async function* () {
      yield '## Half'
      yield ' a section'
      painted = editor!.getHTML()
      throw new Error('Rate limited')
    }
    let editor: Editor | null = null
    await mount(
      <AgentEditor
        defaultValue="<p>Intro</p>"
        complete={complete}
        onEditorReady={(e) => (editor = e)}
      />,
    )
    await ask('anything')

    globalThis.requestAnimationFrame = raf

    expect(painted).toContain('<h2>Half</h2>')
    expect($('.agent-dock-error').textContent).toBe('Rate limited')
    expect(editor!.getHTML()).toBe('<p>Intro</p>')
  })
})
