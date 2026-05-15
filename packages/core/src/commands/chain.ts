import type { EditorState, Transaction } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

export interface CommandProps {
  state: EditorState
  tr: Transaction
  view: EditorView | null
  dispatch: ((tr: Transaction) => void) | null
}

export type Command = (props: CommandProps) => boolean

export class CommandChain {
  private readonly steps: Command[] = []

  constructor(private readonly view: EditorView) {}

  add(cmd: Command): this {
    this.steps.push(cmd)
    return this
  }

  run(): boolean {
    let ok = true
    for (const step of this.steps) {
      const state = this.view.state
      const result = step({
        state,
        tr: state.tr,
        view: this.view,
        dispatch: this.view.dispatch.bind(this.view),
      })
      if (!result) {
        ok = false
        break
      }
    }
    return ok
  }
}
