import { forwardRef, useMemo } from 'react'
import {
  EditorContent,
  FontSizeMenu,
  HighlightMenu,
  Icons,
  LinkMenu,
  TextColorMenu,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
} from '@richkitjs/react'
import {
  Blockquote,
  Bold,
  HardBreak,
  Highlight,
  History,
  Italic,
  Link,
  Paragraph,
  Strike,
  TextStyle,
  Underline,
} from '@richkitjs/starter-kit'
import {
  cx,
  FieldValue,
  useEditorField,
  useTheme,
  withPlaceholder,
  type AnyFieldProps,
  type AnyHandleRef,
  type FieldComponent,
} from './field'

// Text-level formatting plus quotes: no headings or lists. Other pasted
// structure is reduced to paragraphs, so the field holds running text.
const EXTENSIONS = [
  Paragraph,
  Blockquote,
  HardBreak,
  TextStyle,
  Bold,
  Italic,
  Underline,
  Strike,
  Highlight,
  Link,
  History,
]

/**
 * A form field for answers, descriptions and details: undo/redo, font size,
 * bold, italic, underline, strikethrough, text color, highlight, links and
 * quotes. No headings, lists or page chrome.
 */
export const DescriptionEditor = forwardRef(function DescriptionEditor(
  props: AnyFieldProps,
  ref: AnyHandleRef,
) {
  const { placeholder = 'Write a description…', className, style, name, format } = props
  const extensions = useMemo(() => withPlaceholder(EXTENSIONS, placeholder), [placeholder])
  const editor = useEditorField(props, ref, extensions, { deps: [extensions] })
  const [theme] = useTheme(props.theme, 'dark')

  return (
    <div className={cx('rk-frame rk-description', className)} data-theme={theme} style={style}>
      <div className="desc-box">
        {editor && (
          <Toolbar editor={editor} className="toolbar rk-toolbar desc-tools">
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
              <FontSizeMenu editor={editor} iconOnly />
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
              <ToolbarButton
                editor={editor}
                command="toggleStrike"
                isActiveName="strike"
                label={<Icons.StrikeIcon />}
                title="Strikethrough"
              />
            </ToolbarGroup>
            <ToolbarGroup>
              <TextColorMenu editor={editor} />
              <HighlightMenu editor={editor} />
            </ToolbarGroup>
            <ToolbarGroup>
              <LinkMenu editor={editor} />
              <ToolbarButton
                editor={editor}
                command="toggleBlockquote"
                isActiveName="blockquote"
                label={<Icons.BlockquoteIcon />}
                title="Blockquote"
              />
            </ToolbarGroup>
          </Toolbar>
        )}
        <EditorContent editor={editor} className="editor desc-input" />
      </div>
      <FieldValue editor={editor} name={name} format={format} />
    </div>
  )
}) as FieldComponent<object>
