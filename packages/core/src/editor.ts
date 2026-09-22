import { baseKeymap } from 'prosemirror-commands'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'
import { inputRules, undoInputRule, type InputRule } from 'prosemirror-inputrules'
import { keymap } from 'prosemirror-keymap'
import { Schema, type Attrs, type Node as PMNode } from 'prosemirror-model'
import { EditorState, Plugin, type Transaction } from 'prosemirror-state'
import { EditorView, type NodeViewConstructor } from 'prosemirror-view'
import { CommandChain, type Command } from './commands/chain'
import { clearFormatting, selectAll } from './commands/util'
import { EventEmitter } from './events'
import type { AnyExtension } from './extension/extension'
import { trailingClick } from './plugins/trailing-click'
import { buildSchema } from './schema/builder'
import { docToHtml, htmlToDoc } from './html'

// Transaction meta: a doc change that should not surface as an `update`.
const SILENT = 'richkit:silent'

/**
 * Transaction meta set on every `setContent` — the document being replaced
 * wholesale (a form reset, a loaded record), not edited. Plugins that react
 * to edits, such as track changes, leave these transactions alone.
 */
export const SET_CONTENT_META = 'richkit:setContent'

export interface EditorEvents {
  create: { editor: Editor }
  transaction: { editor: Editor; transaction: Transaction }
  update: { editor: Editor; transaction: Transaction }
  selectionUpdate: { editor: Editor }
  focus: { editor: Editor; event: FocusEvent }
  blur: { editor: Editor; event: FocusEvent }
  destroy: void
}

export interface SetContentOptions {
  /**
   * Fire `update` (and so `onUpdate`) for this change. Turn it off when the
   * content comes from outside — a controlled `value` prop — so syncing it in
   * does not echo straight back out as a change. Defaults to true.
   */
  emitUpdate?: boolean
  /** Record the change on the undo stack. Defaults to true. */
  addToHistory?: boolean
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
  private editable: boolean

  constructor(options: EditorOptions) {
    this.extensions = options.extensions
    this.editable = options.editable !== false
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

    if (rules.length) {
      plugins.push(inputRules({ rules }))
      // Backspace right after a rule fired undoes the rule itself rather than
      // the typing behind it, so `# ` comes back as literal text. It reports
      // false when no rule just ran, leaving every other Backspace binding be.
      plugins.push(keymap({ Backspace: undoInputRule }))
    }
    if (Object.keys(shortcuts).length) {
      plugins.push(keymap(this.adaptShortcuts(shortcuts)))
    }
    plugins.push(keymap(baseKeymap))
    plugins.push(dropCursor())
    plugins.push(gapCursor())
    plugins.push(trailingClick())
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
      editable: () => this.editable,
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
    if (tr.docChanged && !tr.getMeta(SILENT)) {
      this.emitter.emit('update', { editor: this, transaction: tr })
    }
    if (tr.selectionSet) this.emitter.emit('selectionUpdate', { editor: this })
  }

  get state(): EditorState {
    return this.view.state
  }

  get isEditable(): boolean {
    return this.view.editable
  }

  /** Switches the editor between editable and read-only without rebuilding it. */
  setEditable(editable: boolean): void {
    if (editable === this.editable) return
    this.editable = editable
    // Re-reads the editable prop and toggles contenteditable on the DOM.
    this.view.setProps({})
    // An empty transaction, so anything listening — a toolbar that greys out
    // when read-only — re-renders.
    this.view.dispatch(this.view.state.tr.setMeta('richkit:editable', editable))
  }

  /**
   * True when the document holds nothing a reader would see: no text beyond
   * whitespace and no leaf content such as an image, formula or rule. A doc of
   * empty paragraphs still counts as empty — what a required field wants.
   */
  get isEmpty(): boolean {
    let empty = true
    this.view.state.doc.descendants((node) => {
      if (!empty) return false
      if (node.isText) {
        if (node.text!.trim()) empty = false
      } else if (node.isLeaf && node.type.name !== 'hardBreak') {
        empty = false
      }
      return empty
    })
    return empty
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

  setContent(
    content: string | PMNode | Record<string, unknown>,
    options: SetContentOptions = {},
  ): void {
    const doc = this.parseInitialDoc(content)
    const tr = this.view.state.tr.replaceWith(0, this.view.state.doc.content.size, doc.content)
    tr.setMeta(SET_CONTENT_META, true)
    if (options.emitUpdate === false) tr.setMeta(SILENT, true)
    if (options.addToHistory === false) tr.setMeta('addToHistory', false)
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
