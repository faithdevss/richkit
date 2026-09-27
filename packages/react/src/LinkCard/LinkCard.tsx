import { safeUrl, type Editor } from '@richkitjs/core'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { rangeRect, useEditorAnchor } from '../Floating/useEditorAnchor'
import { CheckIcon, CopyIcon, ExternalLinkIcon, PencilIcon, UnlinkIcon } from '../icons'
import { LinkPanel, readLinkTarget } from '../Toolbar/LinkMenu'

export interface LinkCardProps {
  editor: Editor | null
  className?: string
}

/**
 * Floats under the link the cursor is in: the URL (opens in a new tab), plus
 * edit, copy and unlink. Edit swaps the card for the same form the toolbar's
 * link button uses. Needs the Link extension; renders nothing useful without.
 */
export function LinkCard({ editor, className }: LinkCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [href, setHref] = useState('')

  const anchorKey = useEditorAnchor(editor, ref, (ed) => {
    const type = ed.state.schema.marks.link
    if (!type || !ed.state.selection.empty) return null
    const target = readLinkTarget(ed.state, type)
    if (!target.href || target.from === target.to) return null
    setHref(target.href)
    return { key: `${target.from}:${target.href}`, rect: rangeRect(ed, target.from, target.to) }
  })

  // following the cursor to another link starts over in view mode
  useEffect(() => {
    setEditing(false)
    setCopied(false)
  }, [anchorKey])

  const unlink = () => {
    if (!editor) return
    const type = editor.state.schema.marks.link
    if (!type) return
    const { from, to } = readLinkTarget(editor.state, type)
    editor.view.dispatch(editor.state.tr.removeMark(from, to, type))
    editor.focus()
  }

  const copy = () => {
    void navigator.clipboard?.writeText(href).then(() => setCopied(true))
  }

  const safe = safeUrl(href)
  const editable = editor?.isEditable ?? false

  return (
    <div
      ref={ref}
      className={`rk-link-card${className ? ` ${className}` : ''}`}
      role="dialog"
      aria-label="Link"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && editing) {
          e.preventDefault()
          setEditing(false)
          editor?.focus()
        }
      }}
    >
      {anchorKey && editor && editing ? (
        <LinkPanel
          key={anchorKey}
          editor={editor}
          onClose={() => {
            setEditing(false)
            editor.focus()
          }}
        />
      ) : (
        <>
          <a
            className="rk-link-card-url"
            href={safe ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            title={href}
          >
            <ExternalLinkIcon />
            <span>{href.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
          </a>
          <span className="rk-float-sep" />
          {editable && (
            <CardButton label="Edit link" onPress={() => setEditing(true)}>
              <PencilIcon />
            </CardButton>
          )}
          <CardButton label={copied ? 'Copied' : 'Copy link'} onPress={copy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </CardButton>
          {editable && (
            <CardButton label="Remove link" onPress={unlink}>
              <UnlinkIcon />
            </CardButton>
          )}
        </>
      )}
    </div>
  )
}

function CardButton({
  label,
  onPress,
  children,
}: {
  label: string
  onPress: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className="tb-btn rk-link-card-btn"
      title={label}
      aria-label={label}
      // keep the editor's selection: it is what edit and unlink act on
      onMouseDown={(e) => {
        e.preventDefault()
        onPress()
      }}
      onClick={(e) => {
        if (e.detail === 0) onPress()
      }}
    >
      {children}
    </button>
  )
}
