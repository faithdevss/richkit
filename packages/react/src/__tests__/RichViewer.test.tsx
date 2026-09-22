import { Mark, Node } from '@richkitjs/core'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { RichViewer } from '../RichViewer'

const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'p' }],
  renderHTML: () => ['p', 0],
})
const Bold = Mark.create({
  name: 'bold',
  parseHTML: () => [{ tag: 'strong' }],
  renderHTML: () => ['strong', 0],
})
const extensions = [Paragraph, Bold]

let root: Root | null = null

afterEach(() => {
  if (root) act(() => root!.unmount())
  root = null
  document.body.innerHTML = ''
})

async function mount(element: React.ReactElement) {
  ;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true
  const container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  await act(async () => root!.render(element))
  return container
}

describe('RichViewer', () => {
  it('renders HTML through the schema, dropping what it does not define', async () => {
    const el = await mount(
      <RichViewer
        extensions={extensions}
        className="editor"
        content={'<p onclick="alert(1)">hi <strong>there</strong><script>alert(1)</script></p>'}
      />,
    )
    const viewer = el.firstElementChild!
    expect(viewer.className).toBe('richkit-viewer editor')
    expect(viewer.innerHTML).toBe('<p>hi <strong>there</strong></p>')
  })

  it('renders a JSON document', async () => {
    const content = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'from json' }] }],
    }
    const el = await mount(<RichViewer extensions={extensions} content={content} />)
    expect(el.firstElementChild!.innerHTML).toBe('<p>from json</p>')
  })

  it('renders to a string on the server when given a document', () => {
    const out = renderToString(
      <RichViewer extensions={extensions} document={document} content="<p>ssr</p>" />,
    )
    expect(out).toBe('<div class="richkit-viewer"><p>ssr</p></div>')
  })
})
