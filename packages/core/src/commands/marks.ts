import { toggleMark as pmToggleMark } from 'prosemirror-commands'
import type { Attrs, MarkType } from 'prosemirror-model'
import type { EditorState, Transaction } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'
import type { Command } from './chain'

type PMCommand = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
  view?: EditorView,
) => boolean

export function fromPM(pmCmd: PMCommand): Command {
  return ({ state, dispatch, view }) =>
    pmCmd(state, dispatch ?? undefined, view ?? undefined)
}

export function toggleMark(name: string, attrs?: Attrs | null): Command {
  return ({ state, dispatch, view }) => {
    const mark: MarkType | undefined = state.schema.marks[name]
    if (!mark) return false
    return pmToggleMark(mark, attrs)(state, dispatch ?? undefined, view ?? undefined)
  }
}

export function setMark(name: string, attrs?: Attrs | null): Command {
  return ({ state, dispatch }) => {
    const mark = state.schema.marks[name]
    if (!mark) return false
    const { from, to, empty } = state.selection
    if (dispatch) {
      const tr = state.tr
      if (empty) {
        tr.addStoredMark(mark.create(attrs ?? null))
      } else {
        tr.addMark(from, to, mark.create(attrs ?? null))
      }
      dispatch(tr)
    }
    return true
  }
}

export function unsetMark(name: string): Command {
  return ({ state, dispatch }) => {
    const mark = state.schema.marks[name]
    if (!mark) return false
    const { from, to, empty } = state.selection
    if (dispatch) {
      const tr = state.tr
      if (empty) {
        tr.removeStoredMark(mark)
      } else {
        tr.removeMark(from, to, mark)
      }
      dispatch(tr)
    }
    return true
  }
}
