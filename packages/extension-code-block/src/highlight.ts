import type { Root, ElementContent } from 'hast'
import { createLowlight, type LanguageFn } from 'lowlight'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import diff from 'highlight.js/lib/languages/diff'
import go from 'highlight.js/lib/languages/go'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import php from 'highlight.js/lib/languages/php'
import python from 'highlight.js/lib/languages/python'
import rust from 'highlight.js/lib/languages/rust'
import shell from 'highlight.js/lib/languages/shell'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import { Plugin, PluginKey } from 'prosemirror-state'
import type { Node as PMNode } from 'prosemirror-model'
import { Decoration, DecorationSet } from 'prosemirror-view'

export const codeBlockHighlightKey = new PluginKey('codeBlockHighlight')

export type { LanguageFn }

/**
 * Grammars registered out of the box. Kept to the languages people actually
 * paste into documents, because every grammar ships in the user's bundle.
 * Anything else can be added through `CodeBlock.configure({ languages })`,
 * e.g. `languages: common` or `languages: all` from `lowlight`.
 */
export const defaultLanguages: Record<string, LanguageFn> = {
  bash,
  css,
  diff,
  go,
  java,
  javascript,
  json,
  markdown,
  php,
  python,
  rust,
  shell,
  sql,
  typescript,
  xml,
  yaml,
}

export type Highlighter = ReturnType<typeof createLowlight>

export function createHighlighter(languages: Record<string, LanguageFn> = {}): Highlighter {
  return createLowlight({ ...defaultLanguages, ...languages })
}

const defaultHighlighter = createHighlighter()
const highlighters = new WeakMap<Record<string, LanguageFn>, Highlighter>()

/** One highlighter per `languages` object, so the plugin and node view share it. */
export function highlighterFor(languages?: Record<string, LanguageFn> | null): Highlighter {
  if (!languages || Object.keys(languages).length === 0) return defaultHighlighter
  let highlighter = highlighters.get(languages)
  if (!highlighter) {
    highlighter = createHighlighter(languages)
    highlighters.set(languages, highlighter)
  }
  return highlighter
}

export function getRegisteredLanguages(highlighter: Highlighter = defaultHighlighter): string[] {
  return Array.from(new Set(['plaintext', ...highlighter.listLanguages().sort()]))
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

function getDecorations(
  doc: PMNode,
  nodeTypeName: string,
  highlighter: Highlighter,
): DecorationSet {
  const decorations: Decoration[] = []
  doc.descendants((node, pos) => {
    if (node.type.name !== nodeTypeName) return true
    const lang = (node.attrs.language as string | null) ?? null
    const text = node.textContent
    if (!text) return false

    let tree: Root
    try {
      // registered() also resolves aliases such as `js` and `html`
      if (lang && lang !== 'plaintext' && highlighter.registered(lang)) {
        tree = highlighter.highlight(lang, text)
      } else if (!lang) {
        tree = highlighter.highlightAuto(text)
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

export function codeBlockHighlightPlugin(
  nodeTypeName = 'codeBlock',
  highlighter: Highlighter = defaultHighlighter,
): Plugin {
  return new Plugin({
    key: codeBlockHighlightKey,
    state: {
      init: (_, { doc }) => getDecorations(doc, nodeTypeName, highlighter),
      apply(tr, oldDeco, oldState, newState) {
        const oldType = oldState.selection.$head.parent.type
        const newType = newState.selection.$head.parent.type
        const inCodeBlockChange = oldType.name === nodeTypeName || newType.name === nodeTypeName
        if (!tr.docChanged && !inCodeBlockChange) {
          return oldDeco.map(tr.mapping, tr.doc)
        }
        return getDecorations(tr.doc, nodeTypeName, highlighter)
      },
    },
    props: {
      decorations(state) {
        return codeBlockHighlightKey.getState(state) ?? null
      },
    },
  })
}
