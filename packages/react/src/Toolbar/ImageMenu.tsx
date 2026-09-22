import type { Editor } from '@richkitjs/core'
import { ImageIcon } from '../icons'
import { ImageInsertPanel } from '../ImageInsert/ImageInsertPanel'
import type { UploadFile } from '../upload'
import { Popover } from './Popover'

export interface ImageMenuProps {
  editor: Editor
  /** Stores an uploaded image and resolves to its URL; defaults to NotificationsHost's. */
  uploadFile?: UploadFile
}

export function ImageMenu({ editor, uploadFile }: ImageMenuProps) {
  return (
    <Popover
      className="tb-pop-image"
      trigger={
        <button type="button" className="tb-btn" title="Insert image" aria-label="Insert image">
          <ImageIcon />
        </button>
      }
    >
      {(close) => (
        <ImageInsertPanel
          uploadFile={uploadFile}
          onInsert={({ src, alt }) => {
            editor.chain().call('insertImage', { src, alt }).focus().run()
            close()
          }}
        />
      )}
    </Popover>
  )
}
