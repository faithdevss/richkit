import { Node, type Command } from '@richkit/core'
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list'

function liCommand(
  factory: typeof splitListItem,
): Command {
  return ({ state, dispatch, view }) => {
    const type = state.schema.nodes['listItem']
    if (!type) return false
    return factory(type)(state, dispatch ?? undefined, view ?? undefined)
  }
}

export const ListItem = Node.create({
  name: 'listItem',
  content: 'paragraph block*',
  defining: true,
  parseHTML: () => [{ tag: 'li:not([data-type="task-item"])' }],
  renderHTML: () => ['li', 0],
  addCommands: () => ({
    splitListItem: () => liCommand(splitListItem),
    sinkListItem: () => liCommand(sinkListItem),
    liftListItem: () => liCommand(liftListItem),
  }),
  addKeyboardShortcuts: () => ({
    Enter: liCommand(splitListItem),
    Tab: liCommand(sinkListItem),
    'Shift-Tab': liCommand(liftListItem),
  }),
})
