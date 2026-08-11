import type { MarkSpec } from 'prosemirror-model'
import { Extension, type ExtensionConfig, type ExtensionContext } from './extension'

export interface MarkConfig<
  O extends Record<string, unknown> = Record<string, unknown>,
> extends ExtensionConfig<O> {
  inclusive?: boolean
  spanning?: boolean
  excludes?: string
  group?: string
  attrs?: MarkSpec['attrs']
  addMarkSpec?: (ctx: ExtensionContext<O>) => Partial<MarkSpec>
  parseHTML?: (ctx: ExtensionContext<O>) => MarkSpec['parseDOM']
  renderHTML?: MarkSpec['toDOM']
}

export class Mark<
  O extends Record<string, unknown> = Record<string, unknown>,
> extends Extension<O> {
  override readonly type = 'mark' as const
  declare readonly config: MarkConfig<O>

  constructor(config: MarkConfig<O>) {
    super(config)
  }

  static override create<O extends Record<string, unknown> = Record<string, unknown>>(
    config: MarkConfig<O>,
  ): Mark<O> {
    return new Mark<O>(config)
  }
}
