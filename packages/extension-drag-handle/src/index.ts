import { Extension, type Command } from '@richkitjs/core'
import { dragHandlePlugin } from './plugin'

/** Duplicates the top-level block the selection sits in. */
const duplicateCurrentBlock: Command = ({ state, tr, dispatch }) => {
  const { $from } = state.selection
  if ($from.depth === 0) return false
  const pos = $from.before(1)
  const node = state.doc.nodeAt(pos)
  if (!node) return false
  if (dispatch) dispatch(tr.insert(pos + node.nodeSize, node.copy(node.content)))
  return true
}

export const DragHandle = Extension.create({
  name: 'dragHandle',
  addProseMirrorPlugins: () => [dragHandlePlugin()],
  addCommands: () => ({
    duplicateBlock: () => duplicateCurrentBlock,
  }),
  addKeyboardShortcuts: () => ({
    'Mod-d': duplicateCurrentBlock,
    'Mod-D': duplicateCurrentBlock,
  }),
})

export {
  dragHandleKey,
  dragHandlePlugin,
  getDragHandleState,
  blockAt,
  blockAtCoords,
  blockAnchorId,
  blockHTML,
  blockText,
  selectBlock,
  focusBlock,
  duplicateBlock,
  deleteBlock,
  insertBlockAfter,
  captureBlockDragScroll,
  startBlockDrag,
} from './plugin'
export type { BlockTarget, DragHandleState, DragHandleMeta } from './plugin'
