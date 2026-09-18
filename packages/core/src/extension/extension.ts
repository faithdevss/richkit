import type { InputRule } from 'prosemirror-inputrules'
import type { Plugin } from 'prosemirror-state'
import type { NodeViewConstructor } from 'prosemirror-view'
import type { Editor } from '../editor'
import type { Command } from '../commands/chain'

export interface ExtensionContext<O> {
  name: string
  options: O
  editor: Editor
}

export interface ExtensionConfig<O extends Record<string, unknown> = Record<string, unknown>> {
  name: string
  addOptions?: () => O
  addCommands?: (ctx: ExtensionContext<O>) => Record<string, (...args: unknown[]) => Command>
  addKeyboardShortcuts?: (ctx: ExtensionContext<O>) => Record<string, Command>
  addInputRules?: (ctx: ExtensionContext<O>) => InputRule[]
  addProseMirrorPlugins?: (ctx: ExtensionContext<O>) => Plugin[]
  addNodeViews?: (ctx: ExtensionContext<O>) => Record<string, NodeViewConstructor>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyExtension = Extension<any>

export class Extension<O extends Record<string, unknown> = Record<string, unknown>> {
  readonly type: 'extension' | 'node' | 'mark' = 'extension'
  readonly name: string
  readonly config: ExtensionConfig<O>
  options: O

  constructor(config: ExtensionConfig<O>) {
    this.config = config
    this.name = config.name
    this.options = (config.addOptions?.() ?? {}) as O
  }

  static create<O extends Record<string, unknown> = Record<string, unknown>>(
    config: ExtensionConfig<O>,
  ): Extension<O> {
    return new Extension<O>(config)
  }

  // Returns a copy so configuring an extension never changes the shared
  // instance other editors (or StarterKit) already hold.
  configure(options: Partial<O>): this {
    const copy = Object.create(Object.getPrototypeOf(this) as object) as this
    Object.assign(copy, this)
    copy.options = { ...this.options, ...options }
    return copy
  }
}
