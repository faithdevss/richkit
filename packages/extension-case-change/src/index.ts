import { Extension, type Command } from '@richkit/core'

export type CaseMode = 'upper' | 'lower' | 'title' | 'sentence' | 'toggle'

function transform(text: string, mode: CaseMode): string {
  switch (mode) {
    case 'upper':
      return text.toUpperCase()
    case 'lower':
      return text.toLowerCase()
    case 'title':
      return text.replace(/\b\w/g, (c) => c.toUpperCase())
    case 'sentence':
      return text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_m, p, c) => p + (c as string).toUpperCase())
    case 'toggle':
      return text
        .split('')
        .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
        .join('')
  }
}

function changeCaseCmd(mode: CaseMode): Command {
  return ({ state, tr, dispatch }) => {
    const { from, to } = state.selection
    if (from === to) return false
    let changed = false
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isText || !node.text) return true
      const start = Math.max(pos, from)
      const end = Math.min(pos + node.nodeSize, to)
      if (start >= end) return true
      const slice = node.text.slice(start - pos, end - pos)
      const replaced = transform(slice, mode)
      if (replaced !== slice) {
        tr.insertText(replaced, start, end)
        changed = true
      }
      return true
    })
    if (changed && dispatch) dispatch(tr)
    return changed
  }
}

export const CaseChange = Extension.create({
  name: 'caseChange',
  addCommands: () => ({
    changeCase: (...args: unknown[]): Command => {
      const [mode] = args as [CaseMode]
      return changeCaseCmd(mode)
    },
  }),
})
