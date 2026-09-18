import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { ImageIcon } from '../icons'
import { storeFile, type UploadFile } from '../upload'

export type ImageInsertTab = 'upload' | 'link'

export interface ImageInsertValue {
  src: string
  alt: string | null
}

export interface ImageInsertPanelProps {
  /** Stores the picked file and resolves to its URL; defaults to the host's, then a data: URL. */
  uploadFile?: UploadFile
  onInsert: (image: ImageInsertValue) => void
  /** Shows a Cancel button when given. */
  onCancel?: () => void
  defaultTab?: ImageInsertTab
}

const TABS: { id: ImageInsertTab; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'link', label: 'Link' },
]

/**
 * Upload-or-link image picker shared by the toolbar popover, the menubar and
 * the slash menu. The file is only stored when the user presses Insert, so
 * browsing and cancelling never leaves an orphaned upload behind.
 */
export function ImageInsertPanel({
  uploadFile,
  onInsert,
  onCancel,
  defaultTab = 'upload',
}: ImageInsertPanelProps) {
  const id = useId()
  const [tab, setTab] = useState<ImageInsertTab>(defaultTab)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [url, setUrl] = useState('')
  const [urlBroken, setUrlBroken] = useState(false)
  const [alt, setAlt] = useState('')
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const urlInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  useEffect(() => {
    if (tab === 'link') urlInput.current?.focus()
  }, [tab])

  const pick = (picked: File | undefined | null) => {
    if (!picked) return
    if (!picked.type.startsWith('image/')) return
    setFile(picked)
  }

  const trimmedUrl = url.trim()
  const canInsert = !busy && (tab === 'upload' ? Boolean(file) : Boolean(trimmedUrl))

  const insert = async () => {
    if (!canInsert) return
    if (tab === 'link') {
      onInsert({ src: trimmedUrl, alt: alt.trim() || null })
      return
    }
    if (!file) return
    setBusy(true)
    const src = await storeFile(file, uploadFile)
    setBusy(false)
    if (src) onInsert({ src, alt: alt.trim() || file.name })
  }

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    setTab((t) => (t === 'upload' ? 'link' : 'upload'))
  }

  const onEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    void insert()
  }

  return (
    <div className="re-image-insert">
      <div className="re-image-tabs" role="tablist" aria-label="Image source">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${id}-${t.id}-tab`}
            aria-controls={`${id}-${t.id}`}
            aria-selected={tab === t.id}
            tabIndex={tab === t.id ? 0 : -1}
            className={`re-image-tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setTab(t.id)}
            onKeyDown={onTabKey}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'upload' ? (
        <div role="tabpanel" id={`${id}-upload`} aria-labelledby={`${id}-upload-tab`}>
          <button
            type="button"
            className={`re-image-drop${dragging ? ' is-dragging' : ''}${preview ? ' has-preview' : ''}`}
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              pick(e.dataTransfer.files[0])
            }}
            onPaste={(e) => pick(e.clipboardData.files[0])}
            disabled={busy}
          >
            {preview ? (
              <>
                <img className="re-image-preview" src={preview} alt="" />
                <span className="re-image-drop-hint">
                  {file?.name} · <u>Replace</u>
                </span>
              </>
            ) : (
              <>
                <span className="re-image-drop-icon" aria-hidden>
                  <ImageIcon />
                </span>
                <span className="re-image-drop-title">Drop an image or click to browse</span>
                <span className="re-image-drop-hint">PNG, JPG, GIF, WebP or SVG</span>
              </>
            )}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              pick(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>
      ) : (
        <div role="tabpanel" id={`${id}-link`} aria-labelledby={`${id}-link-tab`}>
          <label className="tb-field">
            <span>Image URL</span>
            <input
              ref={urlInput}
              type="url"
              value={url}
              placeholder="https://example.com/photo.jpg"
              onChange={(e) => {
                setUrl(e.target.value)
                setUrlBroken(false)
              }}
              onKeyDown={onEnter}
            />
          </label>
          {trimmedUrl && (
            <div className="re-image-link-preview">
              {urlBroken ? (
                <span className="re-image-drop-hint">Couldn’t load a preview of that URL.</span>
              ) : (
                <img
                  className="re-image-preview"
                  src={trimmedUrl}
                  alt=""
                  onError={() => setUrlBroken(true)}
                />
              )}
            </div>
          )}
        </div>
      )}

      <label className="tb-field">
        <span>Alt text</span>
        <input
          type="text"
          value={alt}
          placeholder="Describe the image"
          onChange={(e) => setAlt(e.target.value)}
          onKeyDown={onEnter}
        />
      </label>

      <div className="re-image-actions">
        {onCancel && (
          <button type="button" className="tb-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button
          type="button"
          className="tb-btn-primary"
          disabled={!canInsert}
          onClick={() => void insert()}
        >
          {busy ? 'Uploading…' : 'Insert'}
        </button>
      </div>
    </div>
  )
}
