import type { Root, ElementContent } from 'hast'
import { common, createLowlight } from 'lowlight'
import { Plugin, PluginKey } from 'prosemirror-state'
import type { Node as PMNode } from 'prosemirror-model'
import { Decoration, DecorationSet } from 'prosemirror-view'

export const codeBlockHighlightKey = new PluginKey('codeBlockHighlight')

const lowlight = createLowlight(common)

export function getRegisteredLanguages(): string[] {
  return Array.from(new Set(['plaintext', ...lowlight.listLanguages().sort()]))
}

interface FlatToken {
  text: string
  classes: string[]
}

function flattenHast(node: Root | ElementContent, classes: string[] = []): FlatToken[] {
  if (node.type === 'text') {
    return [{ text: node.value, classes }]
  }
  if (node.type === 'element' || node.type === 'root') {
    const elClasses =
      node.type === 'element' && Array.isArray(node.properties?.className)
        ? (node.properties.className as string[])
        : []
    const combined = elClasses.length ? [...classes, ...elClasses] : classes
    const children = (node.children ?? []) as ElementContent[]
    return children.flatMap((c) => flattenHast(c, combined))
  }
  return []
}

function getDecorations(doc: PMNode, nodeTypeName: string): DecorationSet {
  const decorations: Decoration[] = []
  const knownLangs = new Set(lowlight.listLanguages())
  doc.descendants((node, pos) => {
    if (node.type.name !== nodeTypeName) return true
    const lang = (node.attrs.language as string | null) ?? null
    const text = node.textContent
    if (!text) return false

    let tree: Root
    try {
      if (lang && lang !== 'plaintext' && knownLangs.has(lang)) {
        tree = lowlight.highlight(lang, text)
      } else if (!lang) {
        tree = lowlight.highlightAuto(text)
      } else {
        return false
      }
    } catch {
      return false
    }

    const tokens = flattenHast(tree)
    let from = pos + 1
    for (const tok of tokens) {
      const to = from + tok.text.length
      if (tok.classes.length) {
        decorations.push(Decoration.inline(from, to, { class: tok.classes.join(' ') }))
      }
      from = to
    }
    return false
  })
  return DecorationSet.create(doc, decorations)
}

export function codeBlockHighlightPlugin(nodeTypeName = 'codeBlock'): Plugin {
  return new Plugin({
    key: codeBlockHighlightKey,
    state: {
      init: (_, { doc }) => getDecorations(doc, nodeTypeName),
      apply(tr, oldDeco, oldState, newState) {
        const oldType = oldState.selection.$head.parent.type
        const newType = newState.selection.$head.parent.type
        const inCodeBlockChange = oldType.name === nodeTypeName || newType.name === nodeTypeName
        if (!tr.docChanged && !inCodeBlockChange) {
          return oldDeco.map(tr.mapping, tr.doc)
        }
        return getDecorations(tr.doc, nodeTypeName)
      },
    },
    props: {
      decorations(state) {
        return codeBlockHighlightKey.getState(state) ?? null
      },
    },
  })
}
