import { forwardRef, useEffect, useId, useMemo, type ReactNode } from 'react'
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
} from '@richkitjs/react'
import { StarterKit } from './kit'
import {
  cx,
  FieldValue,
  useEditorField,
  withPlaceholder,
  type AnyProFieldProps,
  type AnyHandleRef,
  type ProFieldComponent,
} from './field'

export interface ClassicEditorProps {
  /** Shown above the field. */
  label?: ReactNode
  /** Shown below the field; turns red with `error`. */
  helperText?: ReactNode
  /** Invalid state: red label, border and helper text, and `aria-invalid`. */
  error?: boolean
  /** Adds an asterisk to the label and `aria-required`. */
  required?: boolean
  /** Which menubar menus to show, by label. Defaults to Edit, Insert, Format and Help. */
  menus?: string[]
}

// The menubar a document-style field needs — File/View/Tools/Table belong to a
// full editor app, not to one control inside a form.
const FIELD_MENUS = ['Edit', 'Insert', 'Format', 'Help']

/**
 * A labelled form control — menubar over a full toolbar, helper text,
 * error/required/disabled — in the shape of a Material UI text field.
 */
export const ClassicEditor = forwardRef(function ClassicEditor(
  props: AnyProFieldProps & ClassicEditorProps,
  ref: AnyHandleRef,
) {
  const {
    label,
    helperText,
    error = false,
    required = false,
    menus: menuLabels = FIELD_MENUS,
    placeholder = 'Type or paste your content here!',
    disabled,
    readOnly,
    theme,
    className,
    style,
    name,
    format,
  } = props
  const extensions = useMemo(() => withPlaceholder(StarterKit, placeholder), [placeholder])
  const editor = useEditorField(
    { ...props, 'aria-invalid': props['aria-invalid'] ?? error },
    ref,
    extensions,
    { deps: [extensions] },
  )
  const labelId = useId()

  useEffect(() => {
    const dom = editor?.view.dom
    if (!dom) return
    if (required) dom.setAttribute('aria-required', 'true')
    else dom.removeAttribute('aria-required')
    if (label && !props['aria-label']) dom.setAttribute('aria-labelledby', labelId)
    else dom.removeAttribute('aria-labelledby')
  }, [editor, required, label, labelId, props])

  const menuKey = menuLabels.join('|')
  const menus = useMemo(() => {
    const wanted = menuKey.split('|')
    return editor ? buildMenus(editor).filter((m) => wanted.includes(m.label)) : []
  }, [editor, menuKey])

  return (
    <div
      className={cx('ff-field', error && 'is-error', disabled && 'is-disabled', className)}
      data-theme={theme}
      style={style}
    >
      {label && (
        <label className="ff-label" id={labelId}>
          {label}
          {required && <span className="ff-required"> *</span>}
        </label>
      )}
      <div className="ff-input">
        {editor && (
          <>
            {/* the menubar is not a Toolbar, so it goes inert here by hand */}
            <div
              className="ff-chrome"
              ref={(el) => {
                if (el) el.inert = Boolean(disabled || readOnly)
              }}
            >
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
            </div>
          </>
        )}
        <EditorContent editor={editor} className="editor ff-content" />
      </div>
      {Boolean(helperText) && (
        <p className={`ff-helper${error ? ' is-error' : ''}`}>{helperText}</p>
      )}
      <FieldValue editor={editor} name={name} format={format} />
    </div>
  )
}) as ProFieldComponent<ClassicEditorProps>
