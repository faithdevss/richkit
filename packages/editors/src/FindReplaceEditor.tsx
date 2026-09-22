import { forwardRef, useEffect, useMemo, useState } from 'react'
import { EditorContent } from '@richkitjs/react'
import { StarterKit } from '@richkitjs/starter-kit'
import {
  getFindState,
  gotoNext,
  gotoPrev,
  replaceAll,
  replaceCurrent,
  setQuery,
} from '@richkitjs/extension-find-replace'
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

export interface FindReplaceEditorProps {
  /** What the find box starts with. */
  defaultQuery?: string
  /** What the replace box starts with. */
  defaultReplacement?: string
}

/**
 * An editor under an always-open find and replace bar, built on the headless
 * find/replace API: the plugin finds and highlights, the bar is inputs and buttons.
 */
export const FindReplaceEditor = forwardRef(function FindReplaceEditor(
  props: AnyFieldProps & FindReplaceEditorProps,
  ref: AnyHandleRef,
) {
  const {
    defaultQuery = '',
    defaultReplacement = '',
    placeholder,
    className,
    style,
    name,
    format,
  } = props
  const extensions = useMemo(() => withPlaceholder(StarterKit, placeholder), [placeholder])
  const editor = useEditorField(props, ref, extensions, { deps: [extensions] })
  const [theme] = useTheme(props.theme, 'dark')
  const [query, setQueryText] = useState(defaultQuery)
  const [replacement, setReplacement] = useState(defaultReplacement)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [, rerender] = useState(0)

  // Matches live in plugin state, so re-read them after every transaction.
  useEffect(() => {
    if (!editor) return
    return editor.on('transaction', () => rerender((n) => n + 1))
  }, [editor])

  useEffect(() => {
    if (editor) setQuery(editor.view, query, false, caseSensitive)
  }, [editor, query, caseSensitive])

  const find = editor ? getFindState(editor.state) : undefined
  const total = find?.matches.length ?? 0
  const position =
    total && find && find.current >= 0 ? `${find.current + 1} of ${total}` : `0 of ${total}`

  return (
    <div className={cx('rk-frame rk-find', className)} data-theme={theme} style={style}>
      <div className="find-bar">
        <div className="find-row">
          <input
            className="find-input"
            placeholder="Find"
            aria-label="Find"
            value={query}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || !editor) return
              e.preventDefault()
              if (e.shiftKey) gotoPrev(editor.view)
              else gotoNext(editor.view)
            }}
          />
          <span className="find-count">{query ? position : ''}</span>
          <button
            type="button"
            className={`find-btn${caseSensitive ? ' is-active' : ''}`}
            title="Match case"
            aria-label="Match case"
            aria-pressed={caseSensitive}
            onClick={() => setCaseSensitive((v) => !v)}
          >
            Aa
          </button>
          <button
            type="button"
            className="find-btn"
            title="Previous match (Shift+Enter)"
            aria-label="Previous match"
            disabled={!total}
            onClick={() => editor && gotoPrev(editor.view)}
          >
            ↑
          </button>
          <button
            type="button"
            className="find-btn"
            title="Next match (Enter)"
            aria-label="Next match"
            disabled={!total}
            onClick={() => editor && gotoNext(editor.view)}
          >
            ↓
          </button>
        </div>
        <div className="find-row">
          <input
            className="find-input"
            placeholder="Replace with"
            aria-label="Replace with"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
          />
          <button
            type="button"
            className="find-btn find-btn-text"
            disabled={!total}
            onClick={() => editor && replaceCurrent(editor.view, replacement)}
          >
            Replace
          </button>
          <button
            type="button"
            className="find-btn find-btn-text"
            disabled={!total}
            onClick={() => editor && replaceAll(editor.view, replacement)}
          >
            Replace all
          </button>
        </div>
      </div>
      <div className="rk-scroll">
        <div className="rk-page rk-page-simple">
          <EditorContent editor={editor} className="editor" />
        </div>
      </div>
      <FieldValue editor={editor} name={name} format={format} />
    </div>
  )
}) as FieldComponent<FindReplaceEditorProps>
