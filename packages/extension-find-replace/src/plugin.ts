import type { Node as PMNode } from 'prosemirror-model'
import { Plugin, PluginKey, type EditorState, type Transaction } from 'prosemirror-state'
import { Decoration, DecorationSet, type EditorView } from 'prosemirror-view'

export interface Match {
  from: number
  to: number
}

export interface FindReplaceState {
  query: string
  regex: boolean
  caseSensitive: boolean
  matches: Match[]
  current: number
  decorations: DecorationSet
}

export interface FindReplaceMeta {
  query?: string
  regex?: boolean
  caseSensitive?: boolean
  setCurrent?: number
  reset?: true
}

export const findReplaceKey = new PluginKey<FindReplaceState>('findReplace')

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildRegex(query: string, regex: boolean, caseSensitive: boolean): RegExp | null {
  if (!query) return null
  const pattern = regex ? query : escapeRegex(query)
  const flags = caseSensitive ? 'g' : 'gi'
  try {
    return new RegExp(pattern, flags)
  } catch {
    return null
  }
}

export function findMatches(
  doc: PMNode,
  query: string,
  regex: boolean,
  caseSensitive: boolean,
): Match[] {
  const re = buildRegex(query, regex, caseSensitive)
  if (!re) return []
  const matches: Match[] = []
  doc.descendants((node, pos) => {
    if (!node.isText) return true
    const text = node.text ?? ''
    re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) {
        re.lastIndex++
        continue
      }
      matches.push({ from: pos + m.index, to: pos + m.index + m[0].length })
    }
    return true
  })
  return matches
}

function rebuild(
  doc: PMNode,
  query: string,
  regex: boolean,
  caseSensitive: boolean,
  preferIndex = 0,
): FindReplaceState {
  const matches = findMatches(doc, query, regex, caseSensitive)
  const current = matches.length === 0 ? -1 : Math.min(Math.max(preferIndex, 0), matches.length - 1)
  const decos: Decoration[] = []
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]
    if (!m) continue
    const cls = i === current ? 'find-match find-match-current' : 'find-match'
    decos.push(Decoration.inline(m.from, m.to, { class: cls }))
  }
  return {
    query,
    regex,
    caseSensitive,
    matches,
    current,
    decorations: DecorationSet.create(doc, decos),
  }
}

export function findReplacePlugin(): Plugin<FindReplaceState> {
  return new Plugin<FindReplaceState>({
    key: findReplaceKey,
    state: {
      init: () => ({
        query: '',
        regex: false,
        caseSensitive: false,
        matches: [],
        current: -1,
        decorations: DecorationSet.empty,
      }),
      apply(tr, prev) {
        const meta = tr.getMeta(findReplaceKey) as FindReplaceMeta | undefined
        if (meta?.reset) {
          return {
            query: '',
            regex: false,
            caseSensitive: false,
            matches: [],
            current: -1,
            decorations: DecorationSet.empty,
          }
        }
        if (
          meta &&
          (meta.query !== undefined || meta.regex !== undefined || meta.caseSensitive !== undefined)
        ) {
          const query = meta.query ?? prev.query
          const regex = meta.regex ?? prev.regex
          const caseSensitive = meta.caseSensitive ?? prev.caseSensitive
          return rebuild(tr.doc, query, regex, caseSensitive, 0)
        }
        if (meta?.setCurrent !== undefined && prev.matches.length) {
          const len = prev.matches.length
          const next = ((meta.setCurrent % len) + len) % len
          const decos: Decoration[] = []
          for (let i = 0; i < prev.matches.length; i++) {
            const m = prev.matches[i]
            if (!m) continue
            const cls = i === next ? 'find-match find-match-current' : 'find-match'
            decos.push(Decoration.inline(m.from, m.to, { class: cls }))
          }
          return {
            ...prev,
            current: next,
            decorations: DecorationSet.create(tr.doc, decos),
          }
        }
        if (tr.docChanged && prev.query) {
          return rebuild(tr.doc, prev.query, prev.regex, prev.caseSensitive, prev.current)
        }
        if (tr.docChanged) {
          return { ...prev, decorations: prev.decorations.map(tr.mapping, tr.doc) }
        }
        return prev
      },
    },
    props: {
      decorations(state) {
        return findReplaceKey.getState(state)?.decorations ?? null
      },
    },
  })
}

export function setQuery(
  view: EditorView,
  query: string,
  regex = false,
  caseSensitive = false,
): void {
  const tr = view.state.tr.setMeta(findReplaceKey, { query, regex, caseSensitive })
  view.dispatch(tr)
}

export function clearFind(view: EditorView): void {
  view.dispatch(view.state.tr.setMeta(findReplaceKey, { reset: true }))
}

export function gotoNext(view: EditorView): void {
  const s = findReplaceKey.getState(view.state)
  if (!s || !s.matches.length) return
  view.dispatch(view.state.tr.setMeta(findReplaceKey, { setCurrent: s.current + 1 }))
  scrollIntoView(view)
}

export function gotoPrev(view: EditorView): void {
  const s = findReplaceKey.getState(view.state)
  if (!s || !s.matches.length) return
  view.dispatch(view.state.tr.setMeta(findReplaceKey, { setCurrent: s.current - 1 }))
  scrollIntoView(view)
}

function scrollIntoView(view: EditorView): void {
  const s = findReplaceKey.getState(view.state)
  if (!s || s.current < 0) return
  const m = s.matches[s.current]
  if (!m) return
  try {
    const dom = view.domAtPos(m.from)
    const el = dom.node.nodeType === 1 ? (dom.node as HTMLElement) : dom.node.parentElement
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  } catch {
    // ignore
  }
}

export function replaceCurrent(view: EditorView, replacement: string): boolean {
  const s = findReplaceKey.getState(view.state)
  if (!s || s.current < 0) return false
  const m = s.matches[s.current]
  if (!m) return false
  const tr = view.state.tr.insertText(replacement, m.from, m.to)
  view.dispatch(tr)
  return true
}

export function replaceAll(view: EditorView, replacement: string): number {
  const s = findReplaceKey.getState(view.state)
  if (!s || !s.matches.length) return 0
  let tr: Transaction = view.state.tr
  const reversed = [...s.matches].sort((a, b) => b.from - a.from)
  for (const m of reversed) {
    tr = tr.insertText(replacement, m.from, m.to)
  }
  view.dispatch(tr)
  return s.matches.length
}

export function getFindState(state: EditorState): FindReplaceState | undefined {
  return findReplaceKey.getState(state)
}
