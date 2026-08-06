import { Extension } from '@richkit/core'
import { history, redo, undo } from 'prosemirror-history'

export interface HistoryOptions extends Record<string, unknown> {
  depth: number
  newGroupDelay: number
}

export const History = Extension.create<HistoryOptions>({
  name: 'history',
  addOptions: () => ({ depth: 100, newGroupDelay: 500 }),
  addProseMirrorPlugins: (ctx) =>
    [history({ depth: ctx.options.depth, newGroupDelay: ctx.options.newGroupDelay })],
  addCommands: () => ({
    undo:
      () =>
      ({ state, view, dispatch }) =>
        undo(state, dispatch ?? undefined, view ?? undefined),
    redo:
      () =>
      ({ state, view, dispatch }) =>
        redo(state, dispatch ?? undefined, view ?? undefined),
  }),
  addKeyboardShortcuts: () => ({
    'Mod-z': ({ state, view, dispatch }) =>
      undo(state, dispatch ?? undefined, view ?? undefined),
    'Mod-y': ({ state, view, dispatch }) =>
      redo(state, dispatch ?? undefined, view ?? undefined),
    'Mod-Shift-z': ({ state, view, dispatch }) =>
      redo(state, dispatch ?? undefined, view ?? undefined),
  }),
})
