import { baseKeymap } from 'prosemirror-commands'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'
import { inputRules, type InputRule } from 'prosemirror-inputrules'
import { keymap } from 'prosemirror-keymap'
import { Schema, type Attrs, type Node as PMNode } from 'prosemirror-model'
import { EditorState, Plugin, type Transaction } from 'prosemirror-state'
import { EditorView, type NodeViewConstructor } from 'prosemirror-view'
import { CommandChain, type Command } from './commands/chain'
import { clearFormatting, selectAll } from './commands/util'
import { EventEmitter } from './events'
import type { AnyExtension } from './extension/extension'
import { buildSchema } from './schema/builder'
import { docToHtml, htmlToDoc } from './html'

export interface EditorEvents {
  create: { editor: Editor }
  transaction: { editor: Editor; transaction: Transaction }
  update: { editor: Editor; transaction: Transaction }
  selectionUpdate: { editor: Editor }
  focus: { editor: Editor; event: FocusEvent }
  blur: { editor: Editor; event: FocusEvent }
  destroy: void
}

export interface EditorOptions {
  element?: HTMLElement
  extensions: AnyExtension[]
  content?: string | PMNode | Record<string, unknown>
  editable?: boolean
  autofocus?: boolean
  onCreate?: (props: EditorEvents['create']) => void
  onUpdate?: (props: EditorEvents['update']) => void
  onSelectionUpdate?: (props: EditorEvents['selectionUpdate']) => void
  onFocus?: (props: EditorEvents['focus']) => void
  onBlur?: (props: EditorEvents['blur']) => void
  onDestroy?: () => void
}

export class Editor {
  readonly extensions: AnyExtension[]
  readonly schema: Schema
  view!: EditorView
  private readonly emitter = new EventEmitter<EditorEvents>()
  private readonly commandMap: Record<string, (...args: unknown[]) => Command> = {}
  private destroyed = false

  constructor(options: EditorOptions) {
    this.extensions = options.extensions
    this.schema = buildSchema(this.extensions, this)
    this.registerEventHandlers(options)
    this.collectCommands()
    this.mount(options)
    this.emitter.emit('create', { editor: this })
  }

  private registerEventHandlers(o: EditorOptions): void {
    if (o.onCreate) this.emitter.on('create', o.onCreate)
    if (o.onUpdate) this.emitter.on('update', o.onUpdate)
    if (o.onSelectionUpdate) this.emitter.on('selectionUpdate', o.onSelectionUpdate)
    if (o.onFocus) this.emitter.on('focus', o.onFocus)
    if (o.onBlur) this.emitter.on('blur', o.onBlur)
    if (o.onDestroy) this.emitter.on('destroy', o.onDestroy)
  }

  private collectCommands(): void {
    this.commandMap['selectAll'] = () => selectAll()
    this.commandMap['clearFormatting'] = () => clearFormatting()
    for (const ext of this.extensions) {
      const ctx = { name: ext.name, options: ext.options, editor: this }
      const cmds = ext.config.addCommands?.(ctx)
      if (!cmds) continue
      for (const [name, factory] of Object.entries(cmds)) {
        this.commandMap[name] = factory
      }
    }
  }

  private buildPlugins(): Plugin[] {
    const plugins: Plugin[] = []
    const rules: InputRule[] = []
    const shortcuts: Record<string, Command[]> = {}

    for (const ext of this.extensions) {
      const ctx = { name: ext.name, options: ext.options, editor: this }
      plugins.push(...(ext.config.addProseMirrorPlugins?.(ctx) ?? []))
      rules.push(...(ext.config.addInputRules?.(ctx) ?? []))
      for (const [key, cmd] of Object.entries(ext.config.addKeyboardShortcuts?.(ctx) ?? {})) {
        ;(shortcuts[key] ??= []).push(cmd)
      }
    }

    if (rules.length) plugins.push(inputRules({ rules }))
    if (Object.keys(shortcuts).length) {
      plugins.push(keymap(this.adaptShortcuts(shortcuts)))
    }
    plugins.push(keymap(baseKeymap))
    plugins.push(dropCursor())
    plugins.push(gapCursor())
    return plugins
  }

  private adaptShortcuts(
    shortcuts: Record<string, Command[]>,
  ): Record<string, (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean> {
    const out: Record<
      string,
      (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean
    > = {}
    for (const [key, cmds] of Object.entries(shortcuts)) {
      // later extensions take precedence; fall through until one handles the key
      const ordered = [...cmds].reverse()
      out[key] = (state, dispatch) =>
        ordered.some((cmd) =>
          cmd({ state, tr: state.tr, view: this.view ?? null, dispatch: dispatch ?? null }),
        )
    }
    return out
  }

  private parseInitialDoc(content: EditorOptions['content']): PMNode {
    if (!content) return this.schema.topNodeType.createAndFill()!
    if (typeof content === 'string') return htmlToDoc(content, this.schema)
    if (content instanceof Object && 'type' in content && typeof content.type !== 'string') {
      return content as unknown as PMNode
    }
    return this.schema.nodeFromJSON(content)
  }

  private buildNodeViews(): Record<string, NodeViewConstructor> {
    const out: Record<string, NodeViewConstructor> = {}
    for (const ext of this.extensions) {
      const ctx = { name: ext.name, options: ext.options, editor: this }
      Object.assign(out, ext.config.addNodeViews?.(ctx) ?? {})
    }
    return out
  }

  private mount(options: EditorOptions): void {
    const doc = this.parseInitialDoc(options.content)
    const state = EditorState.create({
      doc,
      schema: this.schema,
      plugins: this.buildPlugins(),
    })

    this.view = new EditorView(options.element ?? null, {
      state,
      editable: () => options.editable !== false,
      nodeViews: this.buildNodeViews(),
      dispatchTransaction: (tr) => this.handleTransaction(tr),
      handleDOMEvents: {
        focus: (_view, event) => {
          this.emitter.emit('focus', { editor: this, event: event as FocusEvent })
          return false
        },
        blur: (_view, event) => {
          this.emitter.emit('blur', { editor: this, event: event as FocusEvent })
          return false
        },
      },
    })

    if (options.autofocus) this.view.focus()
  }

  private handleTransaction(tr: Transaction): void {
    const next = this.view.state.apply(tr)
    this.view.updateState(next)
    this.emitter.emit('transaction', { editor: this, transaction: tr })
    if (tr.docChanged) this.emitter.emit('update', { editor: this, transaction: tr })
    if (tr.selectionSet) this.emitter.emit('selectionUpdate', { editor: this })
  }

  get state(): EditorState {
    return this.view.state
  }

  get isEditable(): boolean {
    return this.view.editable
  }

  get isDestroyed(): boolean {
    return this.destroyed
  }

  on<K extends keyof EditorEvents>(
    event: K,
    handler: (payload: EditorEvents[K]) => void,
  ): () => void {
    return this.emitter.on(event, handler)
  }

  chain(): CommandChainBuilder {
    return new CommandChainBuilder(this)
  }

  command(name: string, ...args: unknown[]): boolean {
    const factory = this.commandMap[name]
    if (!factory) return false
    const cmd = factory(...args)
    return cmd({
      state: this.view.state,
      tr: this.view.state.tr,
      view: this.view,
      dispatch: this.view.dispatch.bind(this.view),
    })
  }

  get commands(): Record<string, (...args: unknown[]) => boolean> {
    const out: Record<string, (...args: unknown[]) => boolean> = {}
    for (const name of Object.keys(this.commandMap)) {
      out[name] = (...args: unknown[]) => this.command(name, ...args)
    }
    return out
  }

  isActive(name: string, attrs?: Attrs | null): boolean {
    const state = this.view.state
    const markType = state.schema.marks[name]
    if (markType) {
      const { from, to, empty, $from } = state.selection
      if (empty) {
        const marks = state.storedMarks ?? $from.marks()
        const found = marks.find((m) => m.type === markType)
        if (!found) return false
        if (!attrs) return true
        return Object.entries(attrs).every(([k, v]) => found.attrs[k] === v)
      }
      return state.doc.rangeHasMark(from, to, markType)
    }
    const nodeType = state.schema.nodes[name]
    if (nodeType) {
      const { $from } = state.selection
      for (let depth = $from.depth; depth >= 0; depth--) {
        const node = $from.node(depth)
        if (node.type !== nodeType) continue
        if (!attrs) return true
        return Object.entries(attrs).every(([k, v]) => node.attrs[k] === v)
      }
    }
    return false
  }

  getJSON(): Record<string, unknown> {
    return this.view.state.doc.toJSON() as Record<string, unknown>
  }

  getHTML(): string {
    return docToHtml(this.view.state.doc, this.schema)
  }

  getText(): string {
    return this.view.state.doc.textContent
  }

  setContent(content: string | PMNode | Record<string, unknown>): void {
    const doc = this.parseInitialDoc(content)
    const tr = this.view.state.tr.replaceWith(0, this.view.state.doc.content.size, doc.content)
    this.view.dispatch(tr)
  }

  focus(): void {
    this.view.focus()
  }

  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    this.view.destroy()
    this.emitter.emit('destroy', undefined as never)
    this.emitter.clear()
  }

  /** @internal */
  _commandFactory(name: string): ((...args: unknown[]) => Command) | undefined {
    return this.commandMap[name]
  }
}

export class CommandChainBuilder {
  private readonly chain: CommandChain

  constructor(private readonly editor: Editor) {
    this.chain = new CommandChain(editor.view)
  }

  call(name: string, ...args: unknown[]): this {
    const factory = this.editor._commandFactory(name)
    if (factory) this.chain.add(factory(...args))
    return this
  }

  focus(): this {
    this.chain.add(({ view }) => {
      view?.focus()
      return true
    })
    return this
  }

  run(): boolean {
    return this.chain.run()
  }
}
