import { Node, type Command } from '@richkit/core'

export const HorizontalRule = Node.create({
  name: 'horizontalRule',
  group: 'block',
  atom: true,
  selectable: true,
  parseHTML: () => [{ tag: 'hr' }],
  renderHTML: () => ['hr'],
  addCommands: () => ({
    insertHorizontalRule: (): Command =>
      ({ state, tr, dispatch }) => {
        const type = state.schema.nodes['horizontalRule']
        if (!type) return false
        if (dispatch) dispatch(tr.replaceSelectionWith(type.create()).scrollIntoView())
        return true
      },
  }),
})
