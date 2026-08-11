import { Node, type Command } from '@richkitjs/core'

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,
  parseHTML: () => [
    { tag: 'div[data-page-break]' },
    {
      tag: 'div',
      getAttrs: (node) => {
        const el = node as HTMLElement
        return el.style.pageBreakAfter === 'always' || el.classList.contains('page-break')
          ? {}
          : false
      },
    },
  ],
  renderHTML: () => [
    'div',
    {
      'data-page-break': 'true',
      class: 'page-break',
      style: 'page-break-after: always; break-after: page;',
    },
  ],
  addCommands: () => ({
    insertPageBreak:
      (): Command =>
      ({ state, tr, dispatch }) => {
        const type = state.schema.nodes['pageBreak']
        if (!type) return false
        if (dispatch) dispatch(tr.replaceSelectionWith(type.create()).scrollIntoView())
        return true
      },
  }),
})
