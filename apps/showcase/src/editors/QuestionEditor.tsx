import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AnyExtension, Editor } from '@richkitjs/core'
import {
  useEditor,
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
import '@richkitjs/extension-math/style.css'
import { QUESTION_OPTIONS, QUESTION_STEM } from '../content'
import { useDevEditor } from './useDevEditor'

// The question itself gets the full kit; answer options stay inline-only —
// formatting, colour, sub/superscript and formulas, but no tables or lists.
const STEM_EXTENSIONS = [
  ...StarterKit.filter((e) => e.name !== 'placeholder'),
  Placeholder.configure({ placeholder: 'Write the question…' }),
]

const OPTION_EXTENSIONS = [
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

const LETTERS = ['A', 'B', 'C', 'D']

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
    <Toolbar editor={editor} className="toolbar demo-toolbar demo-toolbar-light">
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
  correct,
  onCorrect,
  extensions,
  onReady,
}: {
  letter: string
  content: string
  correct: boolean
  onCorrect: () => void
  extensions: AnyExtension[]
  onReady: (editor: Editor) => void
}) {
  const editor = useEditor({ extensions, content })

  useEffect(() => {
    if (editor) onReady(editor)
  }, [editor, onReady])

  return (
    <div className={`question-option${correct ? ' is-correct' : ''}`}>
      <button
        type="button"
        className="question-option-mark"
        aria-pressed={correct}
        title={correct ? 'Correct answer' : 'Mark as correct'}
        onClick={onCorrect}
      >
        {letter}
      </button>
      <EditorContent editor={editor} className="editor question-option-input" />
      {correct && <span className="question-option-tag">Correct</span>}
    </div>
  )
}

export function QuestionEditor() {
  const [active, setActive] = useState<Editor | null>(null)
  const [correct, setCorrect] = useState(0)
  const [points, setPoints] = useState(2)
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

  const stem = useEditor({ extensions: stemExtensions, content: QUESTION_STEM })
  stemRef.current = stem
  useDevEditor(stem)

  // Every editor on the card shares one toolbar, which follows focus.
  const register = useCallback((editor: Editor) => {
    if (editors.current.has(editor)) return
    editors.current.set(editor, editors.current.size)
    editor.on('focus', () => setActive(editor))
  }, [])

  useEffect(() => {
    if (stem) register(stem)
  }, [stem, register])

  const toolbarEditor = active ?? stem

  return (
    <div className="demo-frame demo-question" data-theme="light">
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
      <div className="demo-scroll">
        <div className="question-card">
          <div className="question-head">
            <span className="question-type">Multiple choice · single answer</span>
            <label className="question-points">
              Points
              <input
                type="number"
                min={0}
                max={100}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
              />
            </label>
          </div>
          <EditorContent editor={stem} className="editor question-stem" />
          <div className="question-options">
            {QUESTION_OPTIONS.map((content, i) => (
              <OptionRow
                key={LETTERS[i]}
                letter={LETTERS[i]!}
                content={content}
                correct={correct === i}
                onCorrect={() => setCorrect(i)}
                extensions={optionExtensions}
                onReady={register}
              />
            ))}
          </div>
          <p className="question-hint">
            Click a letter to mark the correct answer. Double-click a formula to edit it.
          </p>
        </div>
      </div>
    </div>
  )
}
