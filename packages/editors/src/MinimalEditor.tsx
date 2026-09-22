import { forwardRef, useMemo } from 'react'
import { EditorContent, BubbleMenu, Icons, LinkMenu, ToolbarButton } from '@richkitjs/react'
import { Bold, History, Italic, Link, Paragraph } from '@richkitjs/starter-kit'
import {
  cx,
  FieldValue,
  useEditorField,
  withPlaceholder,
  type AnyFieldProps,
  type AnyHandleRef,
  type FieldComponent,
} from './field'

// Only what this editor needs. The document and text nodes come from the
// core; everything else is opt-in.
const EXTENSIONS = [Paragraph, Bold, Italic, Link, History]

/** Paragraphs with bold, italic and links from a bubble menu — no toolbar. */
export const MinimalEditor = forwardRef(function MinimalEditor(
  props: AnyFieldProps,
  ref: AnyHandleRef,
) {
  const { placeholder, theme = 'dark', className, style, name, format } = props
  const extensions = useMemo(() => withPlaceholder(EXTENSIONS, placeholder), [placeholder])
  const editor = useEditorField(props, ref, extensions, { deps: [extensions] })

  return (
    <div className={cx('rk-frame rk-minimal', className)} data-theme={theme} style={style}>
      <div className="rk-scroll">
        <div className="rk-page rk-page-minimal">
          <EditorContent editor={editor} className="editor" />
          <BubbleMenu editor={editor} className="bubble-menu">
            {editor && (
              <>
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
                <LinkMenu editor={editor} />
              </>
            )}
          </BubbleMenu>
        </div>
      </div>
      <FieldValue editor={editor} name={name} format={format} />
    </div>
  )
}) as FieldComponent<object>
