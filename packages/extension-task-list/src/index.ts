import { Node, wrapInList, type Command } from '@rich-editor/core'
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list'

function taskCommand(factory: typeof splitListItem, attrs?: Record<string, unknown>): Command {
  return ({ state, dispatch, view }) => {
    const type = state.schema.nodes['taskItem']
    if (!type) return false
    return factory(type, attrs)(state, dispatch ?? undefined, view ?? undefined)
  }
}

export const TaskList = Node.create({
  name: 'taskList',
  group: 'block list',
  content: 'taskItem+',
  parseHTML: () => [{ tag: 'ul[data-type="task-list"]' }],
  renderHTML: () => ['ul', { 'data-type': 'task-list' }, 0],
  addCommands: () => ({
    toggleTaskList: () => wrapInList('taskList'),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-Shift-9': wrapInList('taskList'),
  }),
})

export const TaskItem = Node.create({
  name: 'taskItem',
  content: 'paragraph block*',
  defining: true,
  attrs: { checked: { default: false } },
  parseHTML: () => [
    {
      tag: 'li[data-type="task-item"]',
      getAttrs: (node) => ({
        checked: (node as HTMLElement).getAttribute('data-checked') === 'true',
      }),
    },
  ],
  renderHTML: (node) => [
    'li',
    { 'data-type': 'task-item', 'data-checked': String(node.attrs.checked) },
    0,
  ],
  addKeyboardShortcuts: () => ({
    // new items start unchecked regardless of the split item's state
    Enter: taskCommand(splitListItem, { checked: false }),
    Tab: taskCommand(sinkListItem),
    'Shift-Tab': taskCommand(liftListItem),
  }),
})
