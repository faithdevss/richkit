import { useRef, useState } from 'react'
import { ClassicEditor as Classic, type EditorHandle } from '@richkitjs/editors-pro'
import { CLASSIC_CONTENT } from '../content'
import { exposeEditor } from './useDevEditor'

const MIN_CHARS = 20

/**
 * The editor as a form field: label, helper text, error and disabled states,
 * with the value it hands to the form shown underneath.
 */
export function FormFieldEditor() {
  const field = useRef<EditorHandle>(null)
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
      <Classic
        ref={field}
        name="description"
        label="Description"
        required
        disabled={disabled}
        error={touched && tooShort}
        helperText={helper}
        value={html}
        onChange={(next) => {
          setTouched(true)
          setHtml(next)
          setText(field.current?.editor?.getText().trim() ?? '')
        }}
        onEditorReady={exposeEditor}
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
          <span className="ff-readout-head">getText() (plain)</span>
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
      <Classic value={html} onChange={setHtml} onEditorReady={exposeEditor} />
    </div>
  )
}
