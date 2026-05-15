import { Node, wrapInList } from '@rich-editor/core'

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
})
