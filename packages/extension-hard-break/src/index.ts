import { Node, type Command } from '@richkitjs/core'

const insertBreak: Command = ({ state, tr, dispatch }) => {
  const type = state.schema.nodes['hardBreak']
  if (!type) return false
  if (dispatch) dispatch(tr.replaceSelectionWith(type.create()).scrollIntoView())
  return true
}

/**
 * The soft line break inside a block. `Shift-Enter` is the Notion-style
 * binding; `Mod-Enter` matches what most desktop editors send.
 */
export const HardBreak = Node.create({
  name: 'hardBreak',
  inline: true,
  group: 'inline',
  selectable: false,
  parseHTML: () => [{ tag: 'br' }],
  renderHTML: () => ['br'],
  addCommands: () => ({
    insertHardBreak: (): Command => insertBreak,
  }),
  addKeyboardShortcuts: () => ({
    'Shift-Enter': insertBreak,
    'Mod-Enter': insertBreak,
  }),
})
