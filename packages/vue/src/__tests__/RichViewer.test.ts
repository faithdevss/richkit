import { Node } from '@richkitjs/core'
import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { RichViewer } from '../index'

const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'p' }],
  renderHTML: () => ['p', 0],
})

describe('RichViewer', () => {
  it('renders HTML through the schema, dropping what it does not define', () => {
    const host = document.createElement('div')
    const app = createApp({
      render: () =>
        h(RichViewer, {
          class: 'editor',
          extensions: [Paragraph],
          content: '<p onclick="alert(1)">hi<script>alert(1)</script></p>',
        }),
    })
    app.mount(host)
    const viewer = host.firstElementChild!
    expect(viewer.className).toBe('richkit-viewer editor')
    expect(viewer.innerHTML).toBe('<p>hi</p>')
    app.unmount()
  })
})
