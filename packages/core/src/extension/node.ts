import type { NodeSpec } from 'prosemirror-model'
import { Extension, type ExtensionConfig, type ExtensionContext } from './extension'

export interface NodeConfig<O extends Record<string, unknown> = Record<string, unknown>>
  extends ExtensionConfig<O> {
  group?: string
  content?: string
  marks?: string
  inline?: boolean
  atom?: boolean
  selectable?: boolean
  draggable?: boolean
  defining?: boolean
  isolating?: boolean
  code?: boolean
  whitespace?: 'pre' | 'normal'
  attrs?: NodeSpec['attrs']
  addNodeSpec?: (ctx: ExtensionContext<O>) => Partial<NodeSpec>
  parseHTML?: (ctx: ExtensionContext<O>) => NodeSpec['parseDOM']
  renderHTML?: NodeSpec['toDOM']
}

export class Node<O extends Record<string, unknown> = Record<string, unknown>> extends Extension<O> {
  override readonly type = 'node' as const
  declare readonly config: NodeConfig<O>

  constructor(config: NodeConfig<O>) {
    super(config)
  }

  static override create<O extends Record<string, unknown> = Record<string, unknown>>(
    config: NodeConfig<O>,
  ): Node<O> {
    return new Node<O>(config)
  }
}
