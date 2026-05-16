import type { EditorState } from 'prosemirror-state'
import { Plugin, PluginKey } from 'prosemirror-state'
import { ReplaceAroundStep, ReplaceStep } from 'prosemirror-transform'

export interface TrackState {
  enabled: boolean
  author: string
}

export interface TrackMeta {
  setEnabled?: boolean
  setAuthor?: string
  skip?: boolean
}

export const trackKey = new PluginKey<TrackState>('trackChanges')

export function newId(): string {
  return 's_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function getTrackState(state: EditorState): TrackState | undefined {
  return trackKey.getState(state)
}

export interface SuggestionEntry {
  id: string
  type: 'insertion' | 'deletion'
  author: string
  createdAt: number
  from: number
  to: number
  text: string
}

export function getSuggestions(state: EditorState): SuggestionEntry[] {
  const insType = state.schema.marks['insertion']
  const delType = state.schema.marks['deletion']
  if (!insType && !delType) return []
  const map = new Map<string, SuggestionEntry>()
  state.doc.descendants((node, pos) => {
    if (!node.isText) return true
    for (const m of node.marks) {
      if (m.type !== insType && m.type !== delType) continue
      const id = m.attrs.id as string
      if (!id) continue
      const existing = map.get(id)
      if (existing) {
        existing.to = pos + node.nodeSize
        existing.text += node.text ?? ''
      } else {
        map.set(id, {
          id,
          type: m.type === insType ? 'insertion' : 'deletion',
          author: (m.attrs.author as string) ?? 'Unknown',
          createdAt: (m.attrs.createdAt as number) ?? Date.now(),
          from: pos,
          to: pos + node.nodeSize,
          text: node.text ?? '',
        })
      }
    }
    return true
  })
  return Array.from(map.values()).sort((a, b) => a.from - b.from)
}

export function trackChangesPlugin(): Plugin<TrackState> {
  return new Plugin<TrackState>({
    key: trackKey,
    state: {
      init: () => ({ enabled: false, author: 'You' }),
      apply(tr, prev) {
        const meta = tr.getMeta(trackKey) as TrackMeta | undefined
        if (!meta) return prev
        return {
          enabled: meta.setEnabled ?? prev.enabled,
          author: meta.setAuthor ?? prev.author,
        }
      },
    },
    appendTransaction(transactions, _oldState, newState) {
      const ts = trackKey.getState(newState)
      if (!ts?.enabled) return null
      // skip if all source transactions are our own annotation passes
      const candidate = transactions.find((t) => {
        const m = t.getMeta(trackKey) as TrackMeta | undefined
        return !m?.skip
      })
      if (!candidate) return null

      const insType = newState.schema.marks['insertion']
      if (!insType) return null

      let tr = newState.tr
      let changed = false
      const author = ts.author
      const createdAt = Date.now()
      const seenRanges: { from: number; to: number }[] = []

      for (const oldTr of transactions) {
        const m = oldTr.getMeta(trackKey) as TrackMeta | undefined
        if (m?.skip) continue
        for (let i = 0; i < oldTr.steps.length; i++) {
          const step = oldTr.steps[i]
          if (!step) continue
          if (!(step instanceof ReplaceStep) && !(step instanceof ReplaceAroundStep)) continue
          if (step.slice.size === 0) continue
          const stepMap = step.getMap()
          stepMap.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
            if (newEnd <= newStart) return
            // remap through later transactions
            let from = newStart
            let to = newEnd
            for (let j = transactions.indexOf(oldTr) + 1; j < transactions.length; j++) {
              const laterTr = transactions[j]
              if (!laterTr) continue
              from = laterTr.mapping.map(from, 1)
              to = laterTr.mapping.map(to, -1)
            }
            if (to <= from) return
            seenRanges.push({ from, to })
          })
        }
      }

      for (const r of seenRanges) {
        let reusedId: string | null = null
        let reusedCreated: number | null = null
        if (r.from > 0) {
          const before = newState.doc.nodeAt(r.from - 1)
          if (before?.isText) {
            const ins = before.marks.find(
              (m) =>
                m.type === insType &&
                m.attrs.author === author &&
                Date.now() - (m.attrs.createdAt as number) < 5000,
            )
            if (ins) {
              reusedId = ins.attrs.id as string
              reusedCreated = ins.attrs.createdAt as number
            }
          }
        }
        const useId = reusedId ?? newId()
        const useCreated = reusedCreated ?? createdAt
        tr = tr.addMark(r.from, r.to, insType.create({ id: useId, author, createdAt: useCreated }))
        changed = true
      }

      if (!changed) return null
      tr = tr.setMeta(trackKey, { skip: true })
      tr.setMeta('addToHistory', false)
      return tr
    },
  })
}
