import { Plugin, PluginKey, type EditorState } from 'prosemirror-state'

export type AIStatus = 'idle' | 'streaming' | 'error'

export interface AIRange {
  from: number
  to: number
}

export interface AIState {
  status: AIStatus
  /** Range the current (or last) run wrote into. Mapped through document changes. */
  range: AIRange | null
  /** Range the run replaced, when started from a non-empty selection. */
  replaced: AIRange | null
  prompt: string
  error: string | null
}

export interface AIMeta {
  status?: AIStatus
  range?: AIRange | null
  replaced?: AIRange | null
  prompt?: string
  error?: string | null
}

const IDLE: AIState = {
  status: 'idle',
  range: null,
  replaced: null,
  prompt: '',
  error: null,
}

export const aiKey = new PluginKey<AIState>('ai')

/**
 * `bias` controls what happens to text inserted exactly at `to`.
 *
 * The written range wants to grow (that is where streaming appends), so it maps
 * with +1. The replaced range must stay pinned to the original text — mapping it
 * with +1 would let it swallow the AI's own output, and then resolving the run
 * would sweep up unrelated suggestions that fall inside the inflated span.
 */
function mapRange(
  range: AIRange | null,
  tr: { mapping: { map: (p: number, b?: number) => number } },
  bias: 1 | -1,
) {
  if (!range) return null
  return { from: tr.mapping.map(range.from, -1), to: tr.mapping.map(range.to, bias) }
}

export function aiPlugin(): Plugin<AIState> {
  return new Plugin<AIState>({
    key: aiKey,
    state: {
      init: () => IDLE,
      apply(tr, prev) {
        const meta = tr.getMeta(aiKey) as AIMeta | undefined

        // Keep tracked ranges pinned to their text as the document changes.
        let range = prev.range
        let replaced = prev.replaced
        if (tr.docChanged) {
          range = mapRange(range, tr, 1)
          replaced = mapRange(replaced, tr, -1)
        }

        if (!meta) {
          if (range === prev.range && replaced === prev.replaced) return prev
          return { ...prev, range, replaced }
        }

        return {
          status: meta.status ?? prev.status,
          // an explicit meta range is already in post-transaction coordinates
          range: meta.range !== undefined ? meta.range : range,
          replaced: meta.replaced !== undefined ? meta.replaced : replaced,
          prompt: meta.prompt ?? prev.prompt,
          error: meta.error !== undefined ? meta.error : prev.error,
        }
      },
    },
  })
}

export function getAIState(state: EditorState): AIState | undefined {
  return aiKey.getState(state)
}

export function isAIStreaming(state: EditorState): boolean {
  return aiKey.getState(state)?.status === 'streaming'
}
