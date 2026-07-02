import { Plugin, PluginKey, type EditorState } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

export interface SlashRange {
  from: number
  to: number
}

export interface SlashState {
  active: boolean
  query: string
  range: SlashRange | null
  index: number
  itemCount: number
  /** suppressed after Escape until the current "/" run is left */
  suppressed: boolean
}

export interface SlashMeta {
  type: 'move' | 'close' | 'setCount'
  dir?: 1 | -1
  count?: number
}

const INACTIVE: SlashState = {
  active: false,
  query: '',
  range: null,
  index: 0,
  itemCount: 0,
  suppressed: false,
}

export const slashKey = new PluginKey<SlashState>('slashCommands')

const SLASH_RE = /(?:^|\s)\/([\w-]*)$/

function detect(state: EditorState): { query: string; range: SlashRange } | null {
  const { selection } = state
  if (!selection.empty) return null
  const $from = selection.$from
  const parent = $from.parent
  if (!parent.isTextblock || parent.type.spec.code) return null
  const textBefore = parent.textBetween(0, $from.parentOffset, '\0', '\0')
  const match = SLASH_RE.exec(textBefore)
  if (!match) return null
  const query = match[1] ?? ''
  const from = $from.pos - query.length - 1
  return { query, range: { from, to: $from.pos } }
}

type OnEnter = (view: EditorView) => boolean

export function slashCommandsPlugin(): Plugin<SlashState> {
  let onEnter: OnEnter | null = null

  const plugin: Plugin<SlashState> & {
    registerOnEnter?: (fn: OnEnter | null) => void
  } = new Plugin<SlashState>({
    key: slashKey,
    state: {
      init: () => INACTIVE,
      apply(tr, prev, _old, state) {
        const meta = tr.getMeta(slashKey) as SlashMeta | undefined
        if (meta?.type === 'close') {
          return { ...INACTIVE, suppressed: true }
        }
        const found = detect(state)
        if (!found) return prev.active || prev.suppressed ? INACTIVE : prev
        if (prev.suppressed) {
          // stay suppressed while still inside the same "/" run
          return { ...INACTIVE, suppressed: true }
        }
        let index = prev.active ? prev.index : 0
        let itemCount = prev.itemCount
        if (meta?.type === 'setCount' && meta.count !== undefined) {
          itemCount = meta.count
        }
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
        const s = slashKey.getState(view.state)
        if (!s?.active) return false
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          const dir = event.key === 'ArrowDown' ? 1 : -1
          view.dispatch(view.state.tr.setMeta(slashKey, { type: 'move', dir } satisfies SlashMeta))
          return true
        }
        if (event.key === 'Escape') {
          view.dispatch(view.state.tr.setMeta(slashKey, { type: 'close' } satisfies SlashMeta))
          return true
        }
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
          if (onEnter) return onEnter(view)
          return false
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

export function getSlashState(state: EditorState): SlashState | undefined {
  return slashKey.getState(state)
}

export function setSlashItemCount(view: EditorView, count: number): void {
  const s = slashKey.getState(view.state)
  if (!s?.active || s.itemCount === count) return
  view.dispatch(view.state.tr.setMeta(slashKey, { type: 'setCount', count } satisfies SlashMeta))
}

export function closeSlash(view: EditorView): void {
  const s = slashKey.getState(view.state)
  if (!s?.active) return
  view.dispatch(view.state.tr.setMeta(slashKey, { type: 'close' } satisfies SlashMeta))
}

export function registerSlashEnter(view: EditorView, fn: OnEnter | null): void {
  const plugin = slashKey.get(view.state) as
    | (Plugin<SlashState> & { registerOnEnter?: (fn: OnEnter | null) => void })
    | undefined
  plugin?.registerOnEnter?.(fn)
}
