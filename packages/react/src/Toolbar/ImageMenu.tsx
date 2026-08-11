import type { Editor } from '@richkitjs/core'
import { useState } from 'react'
import { ImageIcon } from '../icons'
import { Popover } from './Popover'

export interface ImageMenuProps {
  editor: Editor
}

export function ImageMenu({ editor }: ImageMenuProps) {
  return (
    <Popover
      className="tb-pop-image"
      trigger={
        <button type="button" className="tb-btn" title="Insert image">
          <ImageIcon />
        </button>
      }
    >
      {(close) => <ImageForm editor={editor} onClose={close} />}
    </Popover>
  )
}

function ImageForm({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [src, setSrc] = useState('')
  const [alt, setAlt] = useState('')

  const apply = () => {
    if (!src.trim()) return
    editor
      .chain()
      .call('insertImage', { src: src.trim(), alt: alt.trim() || null })
      .focus()
      .run()
    onClose()
  }

  const onFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result ?? '')
      if (dataUrl) {
        editor
          .chain()
          .call('insertImage', { src: dataUrl, alt: alt.trim() || null })
          .focus()
          .run()
        onClose()
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="tb-image-form">
      <label className="tb-field">
        <span>Image URL</span>
        <input
          autoFocus
          type="url"
          value={src}
          placeholder="https://…"
          onChange={(e) => setSrc(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              apply()
            }
          }}
        />
      </label>
      <label className="tb-field">
        <span>Alt text</span>
        <input
          type="text"
          value={alt}
          placeholder="Description"
          onChange={(e) => setAlt(e.target.value)}
        />
      </label>
      <div className="tb-image-actions">
        <label className="tb-btn-ghost tb-file">
          Upload…
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFile(file)
            }}
          />
        </label>
        <button
          type="button"
          className="tb-btn-primary"
          onMouseDown={(e) => {
            e.preventDefault()
            apply()
          }}
        >
          Insert
        </button>
      </div>
    </div>
  )
}
