import { AllSelection } from 'prosemirror-state'
import type { Command } from './chain'

export function selectAll(): Command {
  return ({ state, tr, dispatch }) => {
    if (dispatch) dispatch(tr.setSelection(new AllSelection(state.doc)).scrollIntoView())
    return true
  }
}

export function clearFormatting(): Command {
  return ({ state, tr, dispatch }) => {
    const { from, to, empty } = state.selection
    if (empty) return false
    if (dispatch) {
      for (const mark of Object.values(state.schema.marks)) {
        tr.removeMark(from, to, mark)
      }
      dispatch(tr)
    }
    return true
  }
}
