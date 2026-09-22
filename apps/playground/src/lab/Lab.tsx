/**
 * Editors lab: every ready-made editor mounted the way an app would use it,
 * with knobs for the documented contract (controlled value, reset, ref handle,
 * disabled/readOnly, theme, native form, react-hook-form, host CSS reset).
 */
import {
  CommentBoxEditor,
  FindReplaceEditor,
  HtmlEditor,
  MarkdownEditor,
  MentionsEditor,
  MinimalEditor,
  NotificationsHost,
  type EditorHandle,
} from '@richkitjs/editors'
import {
  AgentEditor,
  ClassicEditor,
  CommentsEditor,
  DocxEditor,
  NotionEditor,
  QuestionEditor,
  SimpleEditor,
  TrackChangesEditor,
  type QuestionEditorHandle,
  type QuestionValue,
} from '@richkitjs/editors-pro'
import type { AIComplete } from '@richkitjs/extension-ai'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'

const stubAI: AIComplete = async function* (req, { signal }) {
  const text =
    req.selection ||
    `## Drafted section\n\nThis is a **drafted** answer to: _${req.prompt.slice(0, 60)}_.\n\n- point one\n- point two`
  for (const w of text.split(/(\s+)/)) {
    if (signal.aborted) return
    await new Promise((r) => setTimeout(r, 8))
    yield w
  }
}

const people = [
  { id: 'ada', label: 'Ada Lovelace' },
  { id: 'alan', label: 'Alan Turing' },
  { id: 'grace', label: 'Grace Hopper' },
]

const RICH = `<h2>Quarterly notes</h2><p>Hello <strong>bold</strong>, <em>italic</em> and a <a href="https://example.com">link</a>.</p><ul><li>First item</li><li>Second item</li></ul><ol><li>One</li><li>Two</li></ol><blockquote><p>A quote.</p></blockquote>`

type Knobs = {
  disabled: boolean
  readOnly: boolean
  theme: 'light' | 'dark'
  placeholder: string
}

type Entry = {
  id: string
  pro?: boolean
  initial: unknown
  reset: unknown
  render: (p: {
    value: any
    onChange: (v: any) => void
    knobs: Knobs
    handleRef: React.Ref<any>
    log: (s: string) => void
  }) => ReactNode
}

const common = (k: Knobs) => ({
  disabled: k.disabled,
  readOnly: k.readOnly,
  theme: k.theme,
  placeholder: k.placeholder || undefined,
})

const Q0: QuestionValue = {
  stem: '<p>What is $x$ if $x^2 = 4$ and $x &gt; 0$?</p>',
  options: ['<p>1</p>', '<p>2</p>', '<p>4</p>'],
  optionIds: [101, 102, 103],
  correct: 1,
  points: 5,
}

const ENTRIES: Entry[] = [
  {
    id: 'Minimal',
    initial: '<p>Hello <strong>world</strong></p>',
    reset: '<p>Reset from parent</p>',
    render: ({ value, onChange, knobs, handleRef }) => (
      <MinimalEditor ref={handleRef} value={value} onChange={onChange} {...common(knobs)} />
    ),
  },
  {
    id: 'Markdown',
    initial:
      '# Title\n\nSome **bold** and a [link](https://example.com).\n\n- a\n- b\n\nMath $x^2$.\n\n| a | b |\n| - | - |\n| 1 | 2 |\n',
    reset: '## Reset\n\nfrom parent',
    render: ({ value, onChange, knobs, handleRef }) => (
      <MarkdownEditor ref={handleRef} value={value} onChange={onChange} {...common(knobs)} />
    ),
  },
  {
    id: 'Html',
    initial: RICH,
    reset: '<p>Reset from parent</p>',
    render: ({ value, onChange, knobs, handleRef }) => (
      <HtmlEditor ref={handleRef} value={value} onChange={onChange} {...common(knobs)} />
    ),
  },
  {
    id: 'Mentions',
    initial: '',
    reset: '<p>Reset</p>',
    render: ({ value, onChange, knobs, handleRef, log }) => (
      <MentionsEditor
        ref={handleRef}
        value={value}
        onChange={onChange}
        mentions={people}
        header="#general"
        onSubmit={(h) => log('onSubmit: ' + h)}
        {...common(knobs)}
      >
        <div style={{ padding: 8 }}>Ada: hi all</div>
      </MentionsEditor>
    ),
  },
  {
    id: 'CommentBox',
    initial: '',
    reset: '<p>Reset</p>',
    render: ({ value, onChange, knobs, handleRef, log }) => (
      <CommentBoxEditor
        ref={handleRef}
        value={value}
        onChange={onChange}
        limit={40}
        onSubmit={(h) => log('onSubmit: ' + h)}
        {...common(knobs)}
      >
        <div style={{ padding: 8 }}>Replying to: “Nice work on this”</div>
      </CommentBoxEditor>
    ),
  },
  {
    id: 'FindReplace',
    initial: '<p>cat hat cat bat cat</p><p>Cat CAT</p>',
    reset: '<p>Reset</p>',
    render: ({ value, onChange, knobs, handleRef }) => (
      <FindReplaceEditor
        ref={handleRef}
        value={value}
        onChange={onChange}
        defaultQuery="cat"
        defaultReplacement="dog"
        {...common(knobs)}
      />
    ),
  },
  {
    id: 'Simple',
    pro: true,
    initial: RICH,
    reset: '<p>Reset from parent</p>',
    render: ({ value, onChange, knobs, handleRef }) => (
      <SimpleEditor ref={handleRef} value={value} onChange={onChange} {...common(knobs)} />
    ),
  },
  {
    id: 'Notion',
    pro: true,
    initial: RICH,
    reset: '<p>Reset from parent</p>',
    render: ({ value, onChange, knobs, handleRef }) => (
      <NotionEditor
        ref={handleRef}
        value={value}
        onChange={onChange}
        mentions={people}
        ai={stubAI}
        header="Workspace / Notes"
        footer="Saved"
        {...common(knobs)}
      />
    ),
  },
  {
    id: 'Classic',
    pro: true,
    initial: '<p>Classic content</p>',
    reset: '',
    render: ({ value, onChange, knobs, handleRef }) => (
      <ClassicEditor
        ref={handleRef}
        value={value}
        onChange={onChange}
        label="Description"
        helperText="Describe the product"
        required
        error={!value}
        {...common(knobs)}
      />
    ),
  },
  {
    id: 'Question',
    pro: true,
    initial: Q0,
    reset: { stem: '<p>Reset?</p>', options: ['<p>yes</p>', '<p>no</p>'], correct: 0, points: 1 },
    render: ({ value, onChange, knobs, handleRef }) => (
      <QuestionEditor
        ref={handleRef as React.Ref<QuestionEditorHandle>}
        value={value}
        onChange={onChange}
        disabled={knobs.disabled}
        readOnly={knobs.readOnly}
        theme={knobs.theme}
        hint="Pick one"
        minOptions={2}
        maxOptions={4}
        createOptionId={() => Math.floor(Math.random() * 1e6)}
      />
    ),
  },
  {
    id: 'Comments',
    pro: true,
    initial: RICH,
    reset: '<p>Reset</p>',
    render: ({ value, onChange, knobs, handleRef }) => (
      <CommentsEditor
        ref={handleRef}
        value={value}
        onChange={onChange}
        author="Tester"
        {...common(knobs)}
      />
    ),
  },
  {
    id: 'CommentsUncontrolled',
    pro: true,
    initial: RICH,
    reset: '<p>Reset</p>',
    render: ({ onChange, knobs, handleRef }) => (
      <CommentsEditor ref={handleRef} defaultValue={RICH} onChange={onChange} {...common(knobs)} />
    ),
  },
  {
    id: 'TrackChanges',
    pro: true,
    initial: RICH,
    reset: '<p>Reset</p>',
    render: ({ value, onChange, knobs, handleRef }) => (
      <TrackChangesEditor
        ref={handleRef}
        value={value}
        onChange={onChange}
        author="Tester"
        {...common(knobs)}
      />
    ),
  },
  {
    id: 'Docx',
    pro: true,
    initial: RICH,
    reset: '<p>Reset</p>',
    render: ({ value, onChange, knobs, handleRef }) => (
      <DocxEditor
        ref={handleRef}
        value={value}
        onChange={onChange}
        title="Report"
        filename="report.docx"
        brand="ACME"
        {...common(knobs)}
      />
    ),
  },
  {
    id: 'Agent',
    pro: true,
    initial: '<h1>Plan</h1><p>Intro.</p>',
    reset: '<p>Reset</p>',
    render: ({ value, onChange, knobs, handleRef }) => (
      <AgentEditor
        ref={handleRef}
        value={value}
        onChange={onChange}
        complete={stubAI}
        {...common(knobs)}
      />
    ),
  },
]

declare global {
  interface Window {
    __lab: { logs: string[]; handle: any; value: unknown }
  }
}
window.__lab = { logs: [], handle: null, value: undefined }

function Pane({ entry }: { entry: Entry }) {
  const [value, setValue] = useState<unknown>(entry.initial)
  const [knobs, setKnobs] = useState<Knobs>({
    disabled: false,
    readOnly: false,
    theme: 'light',
    placeholder: '',
  })
  const [logs, setLogs] = useState<string[]>([])
  const handle = useRef<EditorHandle | QuestionEditorHandle | null>(null)
  const changes = useRef(0)
  const log = (s: string) => {
    window.__lab.logs.push(s)
    setLogs((l) => [...l.slice(-30), s])
  }
  window.__lab.value = value
  useEffect(() => {
    window.__lab.handle = handle.current
  })
  const onChange = (v: unknown) => {
    changes.current++
    log(`onChange #${changes.current}`)
    setValue(v)
  }
  const set = <K extends keyof Knobs>(k: K, v: Knobs[K]) => setKnobs((s) => ({ ...s, [k]: v }))
  return (
    <div className={`pane ${knobs.theme}`}>
      <div className="knobs">
        <label>
          <input
            type="checkbox"
            checked={knobs.disabled}
            onChange={(e) => set('disabled', e.target.checked)}
          />{' '}
          disabled
        </label>
        <label>
          <input
            type="checkbox"
            checked={knobs.readOnly}
            onChange={(e) => set('readOnly', e.target.checked)}
          />{' '}
          readOnly
        </label>
        <label>
          <input
            type="checkbox"
            checked={knobs.theme === 'dark'}
            onChange={(e) => set('theme', e.target.checked ? 'dark' : 'light')}
          />{' '}
          dark
        </label>
        <input
          placeholder="placeholder prop"
          value={knobs.placeholder}
          onChange={(e) => set('placeholder', e.target.value)}
        />
        <button onClick={() => setValue(entry.reset)}>Parent reset</button>
        <button onClick={() => log('getValue: ' + JSON.stringify(handle.current?.getValue()))}>
          ref.getValue
        </button>
        <button onClick={() => handle.current?.focus()}>ref.focus</button>
        {'clear' in (handle.current ?? {}) || !entry.pro || entry.id !== 'Question' ? (
          <>
            <button onClick={() => (handle.current as EditorHandle)?.clear?.()}>ref.clear</button>
            <button
              onClick={() => (handle.current as EditorHandle)?.setValue?.(entry.reset as string)}
            >
              ref.setValue
            </button>
          </>
        ) : null}
      </div>
      <div className="editor-slot">
        {entry.render({ value, onChange, knobs, handleRef: handle, log })}
      </div>
      <div className="out">
        <div>
          <h4>value</h4>
          <pre data-testid="value">
            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          </pre>
        </div>
        <div>
          <h4>log</h4>
          <pre data-testid="log">{logs.join('\n')}</pre>
        </div>
      </div>
    </div>
  )
}

function FormsPane() {
  const [submitted, setSubmitted] = useState('')
  const { control, handleSubmit, formState, reset } = useForm({
    defaultValues: { description: '', body: '' },
  })
  return (
    <div className="pane light">
      <h3>Native form (MinimalEditor name=body)</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))))
        }}
      >
        <MinimalEditor name="body" defaultValue="<p>native</p>" />
        <button>Submit native</button>
      </form>
      <pre>{submitted}</pre>
      <h3>react-hook-form (ClassicEditor + MinimalEditor, required)</h3>
      <form onSubmit={handleSubmit((v) => setSubmitted('RHF ' + JSON.stringify(v)))}>
        <Controller
          name="description"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <ClassicEditor
              {...field}
              label="Description"
              required
              error={!!fieldState.error}
              helperText={fieldState.error ? 'Required' : 'ok'}
            />
          )}
        />
        <Controller
          name="body"
          control={control}
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <MinimalEditor {...field} aria-invalid={!!fieldState.error} />
          )}
        />
        <button>Submit RHF</button>
        <button
          type="button"
          onClick={() => reset({ description: '<p>reset desc</p>', body: '<p>reset body</p>' })}
        >
          RHF reset
        </button>
        <span>
          {' '}
          dirty: {String(formState.isDirty)} errors: {Object.keys(formState.errors).join(',')}
        </span>
      </form>
    </div>
  )
}

export function Lab() {
  const [id, setId] = useState(() => location.hash.slice(1) || 'Minimal')
  const [hostReset, setHostReset] = useState(false)
  useEffect(() => {
    const on = () => setId(location.hash.slice(1) || 'Minimal')
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  const entry = ENTRIES.find((e) => e.id === id)
  return (
    <div className={hostReset ? 'lab host-reset' : 'lab'}>
      <nav>
        {ENTRIES.map((e) => (
          <a key={e.id} href={'#' + e.id} className={e.id === id ? 'on' : ''}>
            {e.id} {e.pro ? <small>pro</small> : null}
          </a>
        ))}
        <a href="#Forms" className={id === 'Forms' ? 'on' : ''}>
          Forms
        </a>
        <label style={{ marginTop: 16 }}>
          <input
            type="checkbox"
            checked={hostReset}
            onChange={(e) => setHostReset(e.target.checked)}
          />{' '}
          host CSS reset
        </label>
      </nav>
      <main>
        {id === 'Forms' ? <FormsPane /> : entry ? <Pane key={entry.id} entry={entry} /> : 'unknown'}
      </main>
      <NotificationsHost />
    </div>
  )
}
