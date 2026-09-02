import { forwardRef, useImperativeHandle, useMemo, useState, type ForwardedRef } from 'react'
import {
  AlignMenu,
  BlockTypeMenu,
  BulletListMenu,
  EditorContent,
  FontFamilyMenu,
  FontSizeMenu,
  HighlightMenu,
  Icons,
  ImageMenu,
  Menubar,
  OrderedListMenu,
  TableMenu,
  TextColorMenu,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  buildMenus,
  useEditor,
} from '@richkitjs/react'
import type { Editor } from '@richkitjs/core'
import { Placeholder } from '@richkitjs/extension-placeholder'
import { StarterKit } from '@richkitjs/starter-kit'
import { CLASSIC_CONTENT } from '../content'
import { useDevEditor } from './useDevEditor'

export interface RichEditorHandle {
  editor: Editor | null
  getHTML: () => string
  getText: () => string
  setContent: (html: string) => void
}

interface RichEditorProps {
  value?: string
  label?: string
  placeholder?: string
  helperText?: string
  error?: boolean
  required?: boolean
  disabled?: boolean
  onChange?: (html: string) => void
  setContentText?: (text: string) => void
}

// The menubar a document-style field needs — File/View/Tools/Table belong to a
// full editor app, not to one control inside a form.
const FIELD_MENUS = ['Edit', 'Insert', 'Format', 'Help']

/**
 * A labelled form control — helper text, error/required/disabled — on top of
 * `useEditor`. The MUI version in the docs differs only in which chrome
 * components wrap `<EditorContent>`.
 */
const RichEditor = forwardRef(function RichEditor(
  {
    value = '',
    label = '',
    placeholder = 'Type or paste your content here!',
    helperText = '',
    error = false,
    required = false,
    disabled = false,
    onChange = () => {},
    setContentText = () => {},
  }: RichEditorProps,
  ref: ForwardedRef<RichEditorHandle>,
) {
  // StarterKit already carries a Placeholder; swap in a configured copy rather
  // than appending a second one, which would register the plugin twice.
  const extensions = useMemo(
    () => [
      ...StarterKit.filter((e) => e.name !== 'placeholder'),
      Placeholder.configure({ placeholder }),
    ],
    [placeholder],
  )

  // `editable` is read from the options the Editor was constructed with, so a
  // changed `disabled` has to rebuild the instance — hence the deps array.
  const editor = useEditor(
    {
      extensions,
      content: value,
      editable: !disabled,
      onUpdate: ({ editor }) => {
        const text = editor.getText().trim()
        setContentText(text)
        // An empty doc still serializes to "<p></p>"; forms want "" so the
        // required check and dirty check both behave.
        onChange(text ? editor.getHTML() : '')
      },
    },
    [disabled],
  )
  useDevEditor(editor)

  const menus = useMemo(
    () => (editor ? buildMenus(editor).filter((m) => FIELD_MENUS.includes(m.label)) : []),
    [editor],
  )

  useImperativeHandle(
    ref,
    () => ({
      editor,
      getHTML: () => editor?.getHTML() ?? '',
      getText: () => editor?.getText() ?? '',
      setContent: (html: string) => editor?.setContent(html),
    }),
    [editor],
  )

  return (
    <div className={`ff-field${error ? ' is-error' : ''}${disabled ? ' is-disabled' : ''}`}>
      <label className="ff-label">
        {label}
        {required && <span className="ff-required"> *</span>}
      </label>
      <div className="ff-input">
        {editor && (
          <>
            <Menubar editor={editor} menus={menus} className="menubar ff-menubar" />
            <Toolbar editor={editor} className="toolbar ff-toolbar">
              <ToolbarGroup>
                <ToolbarButton
                  editor={editor}
                  command="undo"
                  label={<Icons.UndoIcon />}
                  title="Undo"
                />
                <ToolbarButton
                  editor={editor}
                  command="redo"
                  label={<Icons.RedoIcon />}
                  title="Redo"
                />
              </ToolbarGroup>
              <ToolbarGroup>
                <BlockTypeMenu editor={editor} iconOnly />
              </ToolbarGroup>
              <ToolbarGroup>
                <FontSizeMenu editor={editor} iconOnly />
                <FontFamilyMenu editor={editor} iconOnly />
              </ToolbarGroup>
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
                <TextColorMenu editor={editor} />
                <HighlightMenu editor={editor} />
              </ToolbarGroup>
              <ToolbarGroup>
                <ToolbarButton
                  editor={editor}
                  command="clearFormatting"
                  label={<Icons.ClearFormatIcon />}
                  title="Clear formatting"
                />
              </ToolbarGroup>
              <ToolbarGroup>
                <ImageMenu editor={editor} />
                <TableMenu editor={editor} />
              </ToolbarGroup>
              <ToolbarGroup>
                <AlignMenu editor={editor} dropdown />
              </ToolbarGroup>
              <ToolbarGroup>
                <BulletListMenu editor={editor} />
                <OrderedListMenu editor={editor} />
                <ToolbarButton
                  editor={editor}
                  command="sinkListItem"
                  label={<Icons.IndentInIcon />}
                  title="Increase indent"
                />
                <ToolbarButton
                  editor={editor}
                  command="liftListItem"
                  label={<Icons.IndentOutIcon />}
                  title="Decrease indent"
                />
              </ToolbarGroup>
            </Toolbar>
          </>
        )}
        <EditorContent editor={editor} className="editor ff-content" />
      </div>
      {Boolean(helperText) && (
        <p className={`ff-helper${error ? ' is-error' : ''}`}>{helperText}</p>
      )}
    </div>
  )
})

const MIN_CHARS = 20

export function FormFieldEditor() {
  const [html, setHtml] = useState('')
  const [text, setText] = useState('')
  const [disabled, setDisabled] = useState(false)
  // An untouched field is not a failing one — the red state waits for a first
  // edit, the way a real form validates on change rather than on mount.
  const [touched, setTouched] = useState(false)

  const tooShort = text.length < MIN_CHARS
  const helper = tooShort
    ? touched
      ? `At least ${MIN_CHARS} characters — ${MIN_CHARS - text.length} to go.`
      : `Minimum ${MIN_CHARS} characters.`
    : `${text.length} characters · ${html.length} bytes of HTML`

  return (
    <div className="demo-frame ff-demo" data-theme="light">
      <RichEditor
        label="Description"
        required
        disabled={disabled}
        error={touched && tooShort}
        helperText={helper}
        value={html}
        onChange={(next) => {
          setTouched(true)
          setHtml(next)
        }}
        setContentText={setText}
      />
      <label className="ff-toggle">
        <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
        disabled
      </label>
      <div className="ff-readout">
        <div>
          <span className="ff-readout-head">onChange (html)</span>
          <pre>{html || '""'}</pre>
        </div>
        <div>
          <span className="ff-readout-head">setContentText (plain)</span>
          <pre>{text || '""'}</pre>
        </div>
      </div>
    </div>
  )
}

/**
 * The same editor without any form chrome — no label, no helper line — for the
 * homepage tab, where it sits beside the other full-bleed editor demos. This is
 * the classic desktop-word-processor arrangement: menubar over a full toolbar.
 */
export function ClassicEditor() {
  const [html, setHtml] = useState(CLASSIC_CONTENT)

  return (
    <div className="demo-frame ff-demo is-bare" data-theme="dark">
      <RichEditor value={html} onChange={setHtml} />
    </div>
  )
}
