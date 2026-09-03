import { Plugin, PluginKey, type EditorState } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

export interface MentionRange {
  from: number
  to: number
}

export interface MentionState {
  active: boolean
  query: string
  range: MentionRange | null
  index: number
  itemCount: number
  /** suppressed after Escape until the caret leaves the current "@" run */
  suppressed: boolean
}

export interface MentionMeta {
  type: 'move' | 'close' | 'setCount'
  dir?: 1 | -1
  count?: number
}

const INACTIVE: MentionState = {
  active: false,
  query: '',
  range: null,
  index: 0,
  itemCount: 0,
  suppressed: false,
}

export const mentionKey = new PluginKey<MentionState>('mention')

// an email address is not a mention, so "@" has to open a word
const MENTION_RE = /(?:^|\s)@([\w.\- ]{0,40})$/

function detect(state: EditorState): { query: string; range: MentionRange } | null {
  const { selection } = state
  if (!selection.empty) return null
  const $from = selection.$from
  const parent = $from.parent
  if (!parent.isTextblock || parent.type.spec.code) return null
  const textBefore = parent.textBetween(0, $from.parentOffset, '\0', '\0')
  const match = MENTION_RE.exec(textBefore)
  if (!match) return null
  const query = match[1] ?? ''
  return { query, range: { from: $from.pos - query.length - 1, to: $from.pos } }
}

type OnEnter = (view: EditorView) => boolean

export function mentionPlugin(): Plugin<MentionState> {
  let onEnter: OnEnter | null = null

  const plugin: Plugin<MentionState> & {
    registerOnEnter?: (fn: OnEnter | null) => void
  } = new Plugin<MentionState>({
    key: mentionKey,
    state: {
      init: () => INACTIVE,
      apply(tr, prev, _old, state) {
        const meta = tr.getMeta(mentionKey) as MentionMeta | undefined
        if (meta?.type === 'close') return { ...INACTIVE, suppressed: true }
        const found = detect(state)
        if (!found) return prev.active || prev.suppressed ? INACTIVE : prev
        if (prev.suppressed) return { ...INACTIVE, suppressed: true }
        let index = prev.active ? prev.index : 0
        let itemCount = prev.itemCount
        if (meta?.type === 'setCount' && meta.count !== undefined) itemCount = meta.count
        if (found.query !== prev.query) index = 0
        if (meta?.type === 'move' && meta.dir !== undefined && itemCount > 0) {
          index = (index + meta.dir + itemCount) % itemCount
        }
        if (itemCount > 0) index = Math.min(index, itemCount - 1)
        return {
          active: true,
          query: found.query,
          range: found.range,
          index,
          itemCount,
          suppressed: false,
        }
      },
    },
    props: {
      handleKeyDown(view, event) {
        const s = mentionKey.getState(view.state)
        if (!s?.active) return false
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          const dir = event.key === 'ArrowDown' ? 1 : -1
          view.dispatch(
            view.state.tr.setMeta(mentionKey, { type: 'move', dir } satisfies MentionMeta),
          )
          return true
        }
        if (event.key === 'Escape') {
          view.dispatch(view.state.tr.setMeta(mentionKey, { type: 'close' } satisfies MentionMeta))
          return true
        }
        if ((event.key === 'Enter' || event.key === 'Tab') && !event.isComposing) {
          if (onEnter) return onEnter(view)
        }
        return false
      },
    },
  })

  plugin.registerOnEnter = (fn) => {
    onEnter = fn
  }
  return plugin
}

export function getMentionState(state: EditorState): MentionState | undefined {
  return mentionKey.getState(state)
}

export function setMentionItemCount(view: EditorView, count: number): void {
  const s = mentionKey.getState(view.state)
  if (!s?.active || s.itemCount === count) return
  view.dispatch(
    view.state.tr.setMeta(mentionKey, { type: 'setCount', count } satisfies MentionMeta),
  )
}

export function closeMention(view: EditorView): void {
  const s = mentionKey.getState(view.state)
  if (!s?.active) return
  view.dispatch(view.state.tr.setMeta(mentionKey, { type: 'close' } satisfies MentionMeta))
}

export function registerMentionEnter(view: EditorView, fn: OnEnter | null): void {
  const plugin = mentionKey.get(view.state) as
    | (Plugin<MentionState> & { registerOnEnter?: (fn: OnEnter | null) => void })
    | undefined
  plugin?.registerOnEnter?.(fn)
}
