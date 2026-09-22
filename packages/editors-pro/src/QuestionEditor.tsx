import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
} from 'react'
import { Node, type AnyExtension, type Editor } from '@richkitjs/core'
import {
  useControlledEditor,
  EditorContent,
  Toolbar,
  Icons,
  AlignMenu,
  BlockTypeMenu,
  BulletListMenu,
  FontSizeMenu,
  HighlightMenu,
  ImageMenu,
  OrderedListMenu,
  TableMenu,
  TextColorMenu,
  ToolbarButton,
  ToolbarGroup,
} from '@richkitjs/react'
import {
  StarterKit,
  Bold,
  Highlight,
  History,
  Italic,
  Paragraph,
  Subscript,
  Superscript,
  TextStyle,
  Underline,
} from '@richkitjs/starter-kit'
import { Placeholder } from '@richkitjs/extension-placeholder'
import { MathBlock, MathInline, renderMath, type MathEditRequest } from '@richkitjs/extension-math'
import { cx, useRequirePro, type ProFieldProps, type Theme } from './field'

/** A multiple-choice question as a form value. Every text is HTML. */
export interface QuestionValue {
  /** The question itself. */
  stem: string
  /** The answer options, in order. Their count sets how many rows render. */
  options: string[]
  /**
   * Stable identity for each option, parallel to `options` — your database
   * row ids, say. When present they move with their option as options are
   * added or removed, and new options get one from `createOptionId`.
   */
  optionIds?: OptionId[]
  /** Index into `options` of the correct answer, or `-1` when none is marked. */
  correct: number
  points: number
}

export type OptionId = string | number

let optionSeq = 0
/** Default id for an option added in the editor. */
function newOptionId(): OptionId {
  const uuid = (globalThis.crypto as Crypto | undefined)?.randomUUID?.()
  return uuid ?? `option-${Date.now().toString(36)}-${(optionSeq++).toString(36)}`
}

export interface QuestionEditorProps extends ProFieldProps {
  value?: QuestionValue
  defaultValue?: QuestionValue
  onChange?: (value: QuestionValue) => void
  onBlur?: () => void
  /** Renders a hidden input with this name holding the value as JSON. */
  name?: string
  disabled?: boolean
  readOnly?: boolean
  /** Shown above the question. Defaults to "Multiple choice · single answer". */
  label?: string
  /** Shown below the options. */
  hint?: string
  /**
   * Renders the points input. Turn it off when the app does not score per
   * question; `points` stays in the value untouched. Defaults to `true`.
   */
  showPoints?: boolean
  /** Fewest options the card allows; their remove buttons disable at this count. Defaults to 2. */
  minOptions?: number
  /** Most options the card allows; "Add option" disables at this count. Defaults to 8. */
  maxOptions?: number
  /**
   * Makes the id for an option added in the editor. Passing it turns ids on
   * even when the value has no `optionIds` yet. Defaults to `crypto.randomUUID()`.
   */
  createOptionId?: () => OptionId
  theme?: Theme
  className?: string
  style?: CSSProperties
  /** The question's `Editor`, once mounted. */
  onEditorReady?: (editor: Editor) => void
}

export interface QuestionEditorHandle {
  /** The question's editor. */
  editor: Editor | null
  focus: () => void
  getValue: () => QuestionValue
}

const EMPTY_QUESTION: QuestionValue = { stem: '', options: ['', '', '', ''], correct: 0, points: 1 }

// The question itself gets the full kit; answer options stay inline-only —
// formatting, colour, sub/superscript and formulas, but no tables or lists.
const STEM_EXTENSIONS = [
  ...StarterKit.filter((e) => e.name !== 'placeholder'),
  Placeholder.configure({ placeholder: 'Write the question…' }),
]

// An option is one paragraph: Enter does nothing, and pasted paragraphs join.
const OptionDocument = Node.create({ name: 'doc', content: 'paragraph' })

const OPTION_EXTENSIONS = [
  OptionDocument,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Subscript,
  Superscript,
  TextStyle,
  Highlight,
  History,
  Placeholder.configure({ placeholder: 'Answer option' }),
]

const letter = (i: number) => String.fromCharCode(65 + i)

// One-click snippets for the formula panel. `#` marks where the caret lands.
const SNIPPETS: { label: string; latex: string }[] = [
  { label: 'a/b', latex: '\\frac{#}{}' },
  { label: 'x²', latex: '^{#}' },
  { label: 'xₙ', latex: '_{#}' },
  { label: '√', latex: '\\sqrt{#}' },
  { label: 'π', latex: '\\pi' },
  { label: 'Δ', latex: '\\Delta' },
  { label: '×', latex: '\\times' },
  { label: '÷', latex: '\\div' },
  { label: '≤', latex: '\\le' },
  { label: '≥', latex: '\\ge' },
  { label: '≠', latex: '\\ne' },
  { label: '∞', latex: '\\infty' },
  { label: 'Σ', latex: '\\sum_{#}^{}' },
  { label: '∫', latex: '\\int_{#}^{}' },
]

interface MathTarget {
  editor: Editor
  /** Position of the formula being edited, or null to insert a new one. */
  pos: number | null
  latex: string
  /** A display formula on its own line rather than inline. */
  block: boolean
  /** Whether a new formula may go on its own line (the question, not options). */
  allowBlock: boolean
}

function MathPanel({ target, onClose }: { target: MathTarget; onClose: () => void }) {
  const [latex, setLatex] = useState(target.latex)
  const [block, setBlock] = useState(target.block)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (previewRef.current) renderMath(previewRef.current, latex, { displayMode: block })
  }, [latex, block])

  useEffect(() => inputRef.current?.focus(), [])

  const insertSnippet = (snippet: string) => {
    const input = inputRef.current
    if (!input) return
    const { selectionStart: start, selectionEnd: end } = input
    const caret = snippet.indexOf('#')
    const text = snippet.replace('#', '')
    setLatex(latex.slice(0, start) + text + latex.slice(end))
    const at = start + (caret >= 0 ? caret : text.length)
    requestAnimationFrame(() => {
      input.focus()
      input.setSelectionRange(at, at)
    })
  }

  const apply = () => {
    const value = latex.trim()
    if (!value) return
    const chain = target.editor.chain()
    if (target.pos !== null) chain.call('updateMath', target.pos, value)
    else chain.call(block ? 'insertMathBlock' : 'insertMath', value)
    chain.focus().run()
    onClose()
  }

  return (
    <div className="math-panel" role="dialog" aria-label="Formula">
      <div className="math-snippets">
        {SNIPPETS.map((s) => (
          <button
            key={s.label}
            type="button"
            className="math-snippet"
            title={s.latex.replace('#', '')}
            onClick={() => insertSnippet(s.latex)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <textarea
        ref={inputRef}
        className="math-input"
        spellCheck={false}
        placeholder="LaTeX, e.g. \frac{1}{2}mv^2"
        value={latex}
        onChange={(e) => setLatex(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            apply()
          }
          if (e.key === 'Escape') onClose()
        }}
        rows={2}
      />
      <div className="math-preview" ref={previewRef} aria-live="polite" />
      <div className="math-actions">
        {target.pos === null && target.allowBlock && (
          <label className="math-block-toggle">
            <input type="checkbox" checked={block} onChange={(e) => setBlock(e.target.checked)} />
            On its own line
          </label>
        )}
        <button type="button" className="tb-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="tb-btn-primary" onClick={apply} disabled={!latex.trim()}>
          {target.pos === null ? 'Insert' : 'Update'}
        </button>
      </div>
    </div>
  )
}

function QuestionToolbar({
  editor,
  full,
  onMath,
}: {
  editor: Editor
  full: boolean
  onMath: () => void
}) {
  return (
    <Toolbar editor={editor} className="toolbar rk-toolbar rk-toolbar-light">
      <ToolbarGroup>
        <ToolbarButton editor={editor} command="undo" label={<Icons.UndoIcon />} title="Undo" />
        <ToolbarButton editor={editor} command="redo" label={<Icons.RedoIcon />} title="Redo" />
      </ToolbarGroup>
      {full && (
        <ToolbarGroup>
          <BlockTypeMenu editor={editor} iconOnly />
          <FontSizeMenu editor={editor} iconOnly />
        </ToolbarGroup>
      )}
      <ToolbarGroup>
        <ToolbarButton
          editor={editor}
          command="toggleBold"
          isActiveName="bold"
          label={<Icons.BoldIcon />}
          title="Bold"
        />
        <ToolbarButton
          editor={editor}
          command="toggleItalic"
          isActiveName="italic"
          label={<Icons.ItalicIcon />}
          title="Italic"
        />
        <ToolbarButton
          editor={editor}
          command="toggleUnderline"
          isActiveName="underline"
          label={<Icons.UnderlineIcon />}
          title="Underline"
        />
        <ToolbarButton
          editor={editor}
          command="toggleSubscript"
          isActiveName="subscript"
          label={<Icons.SubscriptIcon />}
          title="Subscript"
        />
        <ToolbarButton
          editor={editor}
          command="toggleSuperscript"
          isActiveName="superscript"
          label={<Icons.SuperscriptIcon />}
          title="Superscript"
        />
        <TextColorMenu editor={editor} />
        <HighlightMenu editor={editor} />
      </ToolbarGroup>
      {full && (
        <ToolbarGroup>
          <BulletListMenu editor={editor} />
          <OrderedListMenu editor={editor} />
          <AlignMenu editor={editor} />
        </ToolbarGroup>
      )}
      <ToolbarGroup>
        <button
          type="button"
          className="tb-btn math-btn"
          title="Insert formula"
          aria-label="Insert formula"
          onMouseDown={(e) => {
            e.preventDefault()
            onMath()
          }}
        >
          <span aria-hidden>ƒ𝑥</span>
        </button>
        {full && <ImageMenu editor={editor} />}
        {full && <TableMenu editor={editor} />}
      </ToolbarGroup>
      <span className="question-target">{full ? 'Question' : 'Answer option'}</span>
    </Toolbar>
  )
}

function OptionRow({
  letter,
  content,
  onContent,
  correct,
  onCorrect,
  extensions,
  onReady,
  onDispose,
  onRemove,
  canRemove,
  onBlur,
  disabled,
  readOnly,
}: {
  letter: string
  content: string
  onContent: (html: string) => void
  correct: boolean
  onCorrect: () => void
  extensions: AnyExtension[]
  onReady: (editor: Editor) => void
  onDispose: (editor: Editor) => void
  onRemove?: () => void
  canRemove: boolean
  onBlur?: () => void
  disabled?: boolean
  readOnly?: boolean
}) {
  const editor = useControlledEditor({
    extensions,
    value: content,
    onChange: onContent,
    onBlur: () => onBlur?.(),
    disabled,
    readOnly,
  })

  useEffect(() => {
    if (!editor) return
    onReady(editor)
    return () => onDispose(editor)
  }, [editor, onReady, onDispose])

  return (
    <div className={`question-option${correct ? ' is-correct' : ''}`}>
      <button
        type="button"
        className="question-option-mark"
        aria-pressed={correct}
        title={correct ? 'Correct answer' : 'Mark as correct'}
        aria-label={correct ? 'Correct answer' : 'Mark as correct'}
        disabled={disabled || readOnly}
        onClick={onCorrect}
      >
        {letter}
      </button>
      <EditorContent editor={editor} className="editor question-option-input" />
      {correct && <span className="question-option-tag">Correct</span>}
      {onRemove && (
        <button
          type="button"
          className="question-option-remove"
          title={`Remove option ${letter}`}
          aria-label={`Remove option ${letter}`}
          disabled={!canRemove}
          onClick={onRemove}
        >
          <span aria-hidden>×</span>
        </button>
      )}
    </div>
  )
}

/**
 * A multiple-choice question card: a rich question with formulas, images and
 * tables, inline-only answer options, the correct answer and points. Its value
 * is a `QuestionValue`; each text in it is HTML.
 */
export const QuestionEditor = forwardRef(function QuestionEditor(
  {
    value,
    defaultValue,
    onChange,
    onBlur,
    name,
    disabled,
    readOnly,
    label = 'Multiple choice · single answer',
    hint = 'Click a letter to mark the correct answer. Double-click a formula to edit it.',
    showPoints = true,
    minOptions = 2,
    maxOptions = 8,
    createOptionId,
    theme = 'light',
    className,
    style,
    onEditorReady,
    licenseKey,
  }: QuestionEditorProps,
  ref: ForwardedRef<QuestionEditorHandle>,
) {
  const [internal, setInternal] = useState<QuestionValue>(
    () => value ?? defaultValue ?? EMPTY_QUESTION,
  )
  const question = value ?? internal
  // Patches from several editors can land before a re-render; each builds on
  // the last one emitted, not on this render's props.
  const latest = useRef(question)
  latest.current = question
  const update = (patch: Partial<QuestionValue>) => {
    const next = { ...latest.current, ...patch }
    latest.current = next
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  const [active, setActive] = useState<Editor | null>(null)
  const [math, setMath] = useState<MathTarget | null>(null)
  const editors = useRef(new Map<Editor, number>())
  const stemRef = useRef<Editor | null>(null)

  // Double-clicking a formula opens the panel on it. The extensions are built
  // once, so they reach the latest state through a ref.
  const editMath = useRef((_request: MathEditRequest) => {})
  editMath.current = ({ editor, pos, latex, displayMode }) => {
    setActive(editor)
    setMath({ editor, pos, latex, block: displayMode, allowBlock: editor === stemRef.current })
  }
  const { stemExtensions, optionExtensions } = useMemo(() => {
    const onEdit = (request: MathEditRequest) => editMath.current(request)
    const inline = MathInline.configure({ onEdit })
    return {
      stemExtensions: [...STEM_EXTENSIONS, inline, MathBlock.configure({ onEdit })],
      optionExtensions: [...OPTION_EXTENSIONS, inline],
    }
  }, [])

  const stem = useControlledEditor({
    extensions: stemExtensions,
    value: question.stem,
    onChange: (html) => update({ stem: html }),
    onBlur: () => onBlur?.(),
    disabled,
    readOnly,
  })
  stemRef.current = stem

  useEffect(() => {
    if (stem) onEditorReady?.(stem)
  }, [stem])

  useRequirePro(stem, licenseKey)

  useImperativeHandle(
    ref,
    () => ({ editor: stem, focus: () => stem?.focus(), getValue: () => latest.current }),
    [stem],
  )

  // Every editor on the card shares one toolbar, which follows focus.
  const register = useCallback((editor: Editor) => {
    if (editors.current.has(editor)) return
    editors.current.set(editor, editors.current.size)
    editor.on('focus', () => setActive(editor))
  }, [])

  const unregister = useCallback((editor: Editor) => {
    editors.current.delete(editor)
    setActive((current) => (current === editor ? null : current))
    setMath((current) => (current?.editor === editor ? null : current))
  }, [])

  useEffect(() => {
    if (stem) register(stem)
  }, [stem, register])

  // Row keys follow the option, not its position, so removing option B keeps
  // C's editor (with its history and focus) rather than handing it B's slot.
  // Option ids serve when there are any; otherwise the card keeps its own.
  const rowKeys = useRef<OptionId[]>([])
  if (question.optionIds && question.optionIds.length === question.options.length) {
    rowKeys.current = question.optionIds
  } else {
    while (rowKeys.current.length < question.options.length) rowKeys.current.push(newOptionId())
    rowKeys.current.length = question.options.length
  }

  const tracksIds = question.optionIds !== undefined || createOptionId !== undefined
  const editable = !disabled && !readOnly
  const count = question.options.length

  const addOption = () => {
    const current = latest.current
    if (current.options.length >= maxOptions) return
    const patch: Partial<QuestionValue> = { options: [...current.options, ''] }
    rowKeys.current = [...rowKeys.current, newOptionId()]
    if (tracksIds) {
      const id = (createOptionId ?? newOptionId)()
      patch.optionIds = [...alignedIds(current), id]
      rowKeys.current[rowKeys.current.length - 1] = id
    }
    update(patch)
  }

  const removeOption = (index: number) => {
    const current = latest.current
    if (current.options.length <= minOptions) return
    const patch: Partial<QuestionValue> = {
      options: current.options.filter((_, i) => i !== index),
      correct:
        current.correct === index
          ? -1
          : current.correct > index
            ? current.correct - 1
            : current.correct,
    }
    rowKeys.current = rowKeys.current.filter((_, i) => i !== index)
    if (tracksIds) patch.optionIds = alignedIds(current).filter((_, i) => i !== index)
    update(patch)
  }

  /** `optionIds` padded to match `options`, for values that arrive short. */
  const alignedIds = (current: QuestionValue): OptionId[] => {
    const ids = [...(current.optionIds ?? [])]
    while (ids.length < current.options.length) ids.push((createOptionId ?? newOptionId)())
    ids.length = current.options.length
    return ids
  }

  const toolbarEditor = active ?? stem

  return (
    <div className={cx('rk-frame rk-question', className)} data-theme={theme} style={style}>
      {toolbarEditor && (
        <QuestionToolbar
          key={editors.current.get(toolbarEditor)}
          editor={toolbarEditor}
          full={toolbarEditor === stem}
          onMath={() =>
            setMath({
              editor: toolbarEditor,
              pos: null,
              latex: '',
              block: false,
              allowBlock: toolbarEditor === stem,
            })
          }
        />
      )}
      {math && (
        <MathPanel key={`${math.pos ?? 'new'}`} target={math} onClose={() => setMath(null)} />
      )}
      <div className="rk-scroll">
        <div className="question-card">
          <div className="question-head">
            <span className="question-type">{label}</span>
            {showPoints && (
              <label className="question-points">
                Points
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={question.points}
                  disabled={disabled}
                  readOnly={readOnly}
                  onChange={(e) => update({ points: Number(e.target.value) })}
                  onBlur={() => onBlur?.()}
                />
              </label>
            )}
          </div>
          <EditorContent editor={stem} className="editor question-stem" />
          <div className="question-options">
            {question.options.map((content, i) => (
              <OptionRow
                key={rowKeys.current[i]}
                letter={letter(i)}
                content={content}
                onContent={(html) => {
                  const options = [...latest.current.options]
                  options[i] = html
                  update({ options })
                }}
                correct={question.correct === i}
                onCorrect={() => update({ correct: i })}
                extensions={optionExtensions}
                onReady={register}
                onDispose={unregister}
                onRemove={editable ? () => removeOption(i) : undefined}
                canRemove={count > minOptions}
                onBlur={onBlur}
                disabled={disabled}
                readOnly={readOnly}
              />
            ))}
          </div>
          {editable && (
            <button
              type="button"
              className="question-add-option"
              disabled={count >= maxOptions}
              onClick={addOption}
            >
              <span aria-hidden>+</span> Add option
            </button>
          )}
          {hint && <p className="question-hint">{hint}</p>}
        </div>
      </div>
      {name && <input type="hidden" name={name} value={JSON.stringify(question)} />}
    </div>
  )
})
