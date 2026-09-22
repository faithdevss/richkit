import { Schema, type MarkSpec, type NodeSpec } from 'prosemirror-model'
import type { AnyExtension } from '../extension/extension'
import type { MarkConfig } from '../extension/mark'
import type { NodeConfig } from '../extension/node'
import type { Editor } from '../editor'

const DEFAULT_TOP_NODE: NodeSpec = {
  content: 'block+',
}

const DEFAULT_TEXT_NODE: NodeSpec = {
  group: 'inline',
}

export function buildSchema(extensions: AnyExtension[], editor: Editor): Schema {
  const nodes: Record<string, NodeSpec> = {
    doc: DEFAULT_TOP_NODE,
    text: DEFAULT_TEXT_NODE,
  }
  const marks: Record<string, MarkSpec> = {}

  for (const ext of extensions) {
    const ctx = { name: ext.name, options: ext.options, editor }

    if (ext.type === 'node') {
      const cfg = ext.config as NodeConfig
      const spec: NodeSpec = {
        ...(cfg.group !== undefined ? { group: cfg.group } : {}),
        ...(cfg.content !== undefined ? { content: cfg.content } : {}),
        ...(cfg.marks !== undefined ? { marks: cfg.marks } : {}),
        ...(cfg.inline !== undefined ? { inline: cfg.inline } : {}),
        ...(cfg.atom !== undefined ? { atom: cfg.atom } : {}),
        ...(cfg.selectable !== undefined ? { selectable: cfg.selectable } : {}),
        ...(cfg.draggable !== undefined ? { draggable: cfg.draggable } : {}),
        ...(cfg.defining !== undefined ? { defining: cfg.defining } : {}),
        ...(cfg.isolating !== undefined ? { isolating: cfg.isolating } : {}),
        ...(cfg.code !== undefined ? { code: cfg.code } : {}),
        ...(cfg.whitespace !== undefined ? { whitespace: cfg.whitespace } : {}),
        ...(cfg.attrs !== undefined ? { attrs: cfg.attrs } : {}),
        ...(cfg.parseHTML ? { parseDOM: cfg.parseHTML(ctx) } : {}),
        ...(cfg.renderHTML ? { toDOM: cfg.renderHTML } : {}),
        ...(cfg.addNodeSpec?.(ctx) ?? {}),
      }
      nodes[ext.name] = spec
    } else if (ext.type === 'mark') {
      const cfg = ext.config as MarkConfig
      const spec: MarkSpec = {
        ...(cfg.inclusive !== undefined ? { inclusive: cfg.inclusive } : {}),
        ...(cfg.spanning !== undefined ? { spanning: cfg.spanning } : {}),
        ...(cfg.excludes !== undefined ? { excludes: cfg.excludes } : {}),
        ...(cfg.group !== undefined ? { group: cfg.group } : {}),
        ...(cfg.attrs !== undefined ? { attrs: cfg.attrs } : {}),
        ...(cfg.parseHTML ? { parseDOM: cfg.parseHTML(ctx) } : {}),
        ...(cfg.renderHTML ? { toDOM: cfg.renderHTML } : {}),
        ...(cfg.addMarkSpec?.(ctx) ?? {}),
      }
      marks[ext.name] = spec
    }
  }

  return new Schema({ nodes, marks })
}

const schemaCache = new WeakMap<readonly AnyExtension[], Schema>()

/**
 * The schema a set of extensions defines, without mounting an editor. Handy
 * for reading, rendering or sanitizing stored content on its own. The result
 * is cached per array, so pass the same array each time.
 */
export function getSchema(extensions: readonly AnyExtension[]): Schema {
  let schema = schemaCache.get(extensions)
  if (!schema) {
    // Schema specs only read `name` and `options` from their context; nothing
    // reaches for the editor until plugins and commands are built.
    schema = buildSchema([...extensions], undefined as unknown as Editor)
    schemaCache.set(extensions, schema)
  }
  return schema
}
