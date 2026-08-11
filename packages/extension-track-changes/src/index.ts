import { Extension, Mark, type Command } from '@richkit/core'
import { TextSelection } from 'prosemirror-state'
import {
  getSuggestions,
  newId,
  trackChangesPlugin,
  trackKey,
} from './plugin'

export const Insertion = Mark.create({
  name: 'insertion',
  attrs: {
    id: { default: null },
    author: { default: '' },
    createdAt: { default: 0 },
  },
  inclusive: false,
  parseHTML: () => [
    {
      tag: 'span[data-suggestion="insertion"]',
      getAttrs: (node) => {
        const el = node as HTMLElement
        return {
          id: el.getAttribute('data-suggestion-id'),
          author: el.getAttribute('data-suggestion-author') ?? '',
          createdAt: parseInt(el.getAttribute('data-suggestion-created') ?? '0', 10),
        }
      },
    },
  ],
  renderHTML: (mark) => [
    'span',
    {
      'data-suggestion': 'insertion',
      'data-suggestion-id': (mark.attrs.id as string) ?? '',
      'data-suggestion-author': (mark.attrs.author as string) ?? '',
      'data-suggestion-created': String((mark.attrs.createdAt as number) ?? 0),
      class: 'suggestion-insertion',
    },
    0,
  ],
})

export const Deletion = Mark.create({
  name: 'deletion',
  attrs: {
    id: { default: null },
    author: { default: '' },
    createdAt: { default: 0 },
  },
  inclusive: false,
  parseHTML: () => [
    {
      tag: 'span[data-suggestion="deletion"]',
      getAttrs: (node) => {
        const el = node as HTMLElement
        return {
          id: el.getAttribute('data-suggestion-id'),
          author: el.getAttribute('data-suggestion-author') ?? '',
          createdAt: parseInt(el.getAttribute('data-suggestion-created') ?? '0', 10),
        }
      },
    },
  ],
  renderHTML: (mark) => [
    'span',
    {
      'data-suggestion': 'deletion',
      'data-suggestion-id': (mark.attrs.id as string) ?? '',
      'data-suggestion-author': (mark.attrs.author as string) ?? '',
      'data-suggestion-created': String((mark.attrs.createdAt as number) ?? 0),
      class: 'suggestion-deletion',
    },
    0,
  ],
})

export const TrackChanges = Extension.create({
  name: 'trackChanges',
  addProseMirrorPlugins: () => [trackChangesPlugin()],
  addCommands: () => ({
    enableTrackChanges:
      (...args: unknown[]): Command => {
        const [author] = args as [string?]
        return ({ state, dispatch }) => {
          const meta = author ? { setEnabled: true, setAuthor: author } : { setEnabled: true }
          if (dispatch) dispatch(state.tr.setMeta(trackKey, meta))
          return true
        }
      },
    disableTrackChanges:
      (): Command =>
      ({ state, dispatch }) => {
        if (dispatch) dispatch(state.tr.setMeta(trackKey, { setEnabled: false }))
        return true
      },
    acceptSuggestion:
      (...args: unknown[]): Command => {
        const [id] = args as [string]
        return ({ state, dispatch }) => {
          if (!id) return false
          const insType = state.schema.marks['insertion']
          const delType = state.schema.marks['deletion']
          if (!insType || !delType) return false
          let tr = state.tr
          const ranges: { from: number; to: number; type: 'insertion' | 'deletion' }[] = []
          state.doc.descendants((node, pos) => {
            if (!node.isText) return true
            const ins = node.marks.find((m) => m.type === insType && m.attrs.id === id)
            const del = node.marks.find((m) => m.type === delType && m.attrs.id === id)
            if (ins) ranges.push({ from: pos, to: pos + node.nodeSize, type: 'insertion' })
            if (del) ranges.push({ from: pos, to: pos + node.nodeSize, type: 'deletion' })
            return true
          })
          if (ranges.length === 0) return false
          // for accept: insertion → keep text, drop mark; deletion → remove text
          // process descending so positions remain valid
          ranges.sort((a, b) => b.from - a.from)
          for (const r of ranges) {
            if (r.type === 'insertion') {
              tr = tr.removeMark(r.from, r.to, insType)
            } else {
              tr = tr.delete(r.from, r.to)
            }
          }
          tr.setMeta(trackKey, { skip: true })
          if (dispatch) dispatch(tr)
          return true
        }
      },
    rejectSuggestion:
      (...args: unknown[]): Command => {
        const [id] = args as [string]
        return ({ state, dispatch }) => {
          if (!id) return false
          const insType = state.schema.marks['insertion']
          const delType = state.schema.marks['deletion']
          if (!insType || !delType) return false
          let tr = state.tr
          const ranges: { from: number; to: number; type: 'insertion' | 'deletion' }[] = []
          state.doc.descendants((node, pos) => {
            if (!node.isText) return true
            const ins = node.marks.find((m) => m.type === insType && m.attrs.id === id)
            const del = node.marks.find((m) => m.type === delType && m.attrs.id === id)
            if (ins) ranges.push({ from: pos, to: pos + node.nodeSize, type: 'insertion' })
            if (del) ranges.push({ from: pos, to: pos + node.nodeSize, type: 'deletion' })
            return true
          })
          if (ranges.length === 0) return false
          // reject: insertion → remove text; deletion → keep text, drop mark
          ranges.sort((a, b) => b.from - a.from)
          for (const r of ranges) {
            if (r.type === 'insertion') {
              tr = tr.delete(r.from, r.to)
            } else {
              tr = tr.removeMark(r.from, r.to, delType)
            }
          }
          tr.setMeta(trackKey, { skip: true })
          if (dispatch) dispatch(tr)
          return true
        }
      },
    acceptAllSuggestions:
      (): Command =>
      ({ state, dispatch }) => {
        const ids = new Set(getSuggestions(state).map((s) => s.id))
        if (ids.size === 0) return false
        const insType = state.schema.marks['insertion']
        const delType = state.schema.marks['deletion']
        if (!insType || !delType) return false
        let tr = state.tr
        // collect ranges first using current doc (positions remain valid descending)
        const all: { from: number; to: number; type: 'insertion' | 'deletion' }[] = []
        state.doc.descendants((node, pos) => {
          if (!node.isText) return true
          if (node.marks.some((m) => m.type === insType)) {
            all.push({ from: pos, to: pos + node.nodeSize, type: 'insertion' })
          } else if (node.marks.some((m) => m.type === delType)) {
            all.push({ from: pos, to: pos + node.nodeSize, type: 'deletion' })
          }
          return true
        })
        all.sort((a, b) => b.from - a.from)
        for (const r of all) {
          if (r.type === 'insertion') tr = tr.removeMark(r.from, r.to, insType)
          else tr = tr.delete(r.from, r.to)
        }
        tr.setMeta(trackKey, { skip: true })
        if (dispatch) dispatch(tr)
        return true
      },
    rejectAllSuggestions:
      (): Command =>
      ({ state, dispatch }) => {
        const insType = state.schema.marks['insertion']
        const delType = state.schema.marks['deletion']
        if (!insType || !delType) return false
        let tr = state.tr
        const all: { from: number; to: number; type: 'insertion' | 'deletion' }[] = []
        state.doc.descendants((node, pos) => {
          if (!node.isText) return true
          if (node.marks.some((m) => m.type === insType)) {
            all.push({ from: pos, to: pos + node.nodeSize, type: 'insertion' })
          } else if (node.marks.some((m) => m.type === delType)) {
            all.push({ from: pos, to: pos + node.nodeSize, type: 'deletion' })
          }
          return true
        })
        if (all.length === 0) return false
        all.sort((a, b) => b.from - a.from)
        for (const r of all) {
          if (r.type === 'insertion') tr = tr.delete(r.from, r.to)
          else tr = tr.removeMark(r.from, r.to, delType)
        }
        tr.setMeta(trackKey, { skip: true })
        if (dispatch) dispatch(tr)
        return true
      },
  }),
  addKeyboardShortcuts: () => ({
    Backspace: ({ state, dispatch }) => {
      const ts = trackKey.getState(state)
      if (!ts?.enabled) return false
      const delType = state.schema.marks['deletion']
      const insType = state.schema.marks['insertion']
      if (!delType || !insType) return false

      const sel = state.selection
      let from = sel.from
      let to = sel.to
      if (sel.empty) {
        if (from <= 1) return true // block backspace at start
        from = sel.from - 1
        to = sel.from
      }
      if (from >= to) return true

      // detect if range entirely inside an insertion mark → actually delete
      let allInsertion = true
      state.doc.nodesBetween(from, to, (node) => {
        if (!node.isText) return true
        if (!node.marks.some((m) => m.type === insType)) allInsertion = false
        return false
      })

      let tr = state.tr
      if (allInsertion) {
        tr = tr.delete(from, to)
        tr.setMeta(trackKey, { skip: true })
      } else {
        // merge w/ adjacent deletion by same author w/in 5s
        let reuseId: string | null = null
        let reuseCreated: number | null = null
        const adjNode = state.doc.nodeAt(to)
        if (adjNode?.isText) {
          const dm = adjNode.marks.find(
            (m) => m.type === delType && m.attrs.author === ts.author && Date.now() - (m.attrs.createdAt as number) < 5000,
          )
          if (dm) {
            reuseId = dm.attrs.id as string
            reuseCreated = dm.attrs.createdAt as number
          }
        }
        const id = reuseId ?? newId()
        const createdAt = reuseCreated ?? Date.now()
        const mark = delType.create({ id, author: ts.author, createdAt })
        tr = tr.addMark(from, to, mark)
        tr = tr.setSelection(TextSelection.create(tr.doc, from))
        tr.setMeta(trackKey, { skip: true })
      }
      if (dispatch) dispatch(tr)
      return true
    },
    Delete: ({ state, dispatch }) => {
      const ts = trackKey.getState(state)
      if (!ts?.enabled) return false
      const delType = state.schema.marks['deletion']
      const insType = state.schema.marks['insertion']
      if (!delType || !insType) return false

      const sel = state.selection
      let from = sel.from
      let to = sel.to
      if (sel.empty) {
        if (to >= state.doc.content.size - 1) return true
        from = sel.from
        to = sel.from + 1
      }
      if (from >= to) return true

      let allInsertion = true
      state.doc.nodesBetween(from, to, (node) => {
        if (!node.isText) return true
        if (!node.marks.some((m) => m.type === insType)) allInsertion = false
        return false
      })

      let tr = state.tr
      if (allInsertion) {
        tr = tr.delete(from, to)
        tr.setMeta(trackKey, { skip: true })
      } else {
        let reuseId: string | null = null
        let reuseCreated: number | null = null
        // from can be 0 on a whole-document selection — nodeAt(-1) throws
        const adjNode = from > 0 ? state.doc.nodeAt(from - 1) : null
        if (adjNode?.isText) {
          const dm = adjNode.marks.find(
            (m) => m.type === delType && m.attrs.author === ts.author && Date.now() - (m.attrs.createdAt as number) < 5000,
          )
          if (dm) {
            reuseId = dm.attrs.id as string
            reuseCreated = dm.attrs.createdAt as number
          }
        }
        const id = reuseId ?? newId()
        const createdAt = reuseCreated ?? Date.now()
        const mark = delType.create({ id, author: ts.author, createdAt })
        tr = tr.addMark(from, to, mark)
        tr = tr.setSelection(TextSelection.create(tr.doc, Math.min(to, tr.doc.content.size)))
        tr.setMeta(trackKey, { skip: true })
      }
      if (dispatch) dispatch(tr)
      return true
    },
  }),
})

export const TrackChangesKit = [Insertion, Deletion, TrackChanges]

export { getSuggestions, getTrackState, trackKey } from './plugin'
export type { SuggestionEntry, TrackState, TrackMeta } from './plugin'
