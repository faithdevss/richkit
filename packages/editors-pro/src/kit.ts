import { Comment } from '@richkitjs/extension-comments'
import { TrackChangesKit } from '@richkitjs/extension-track-changes'
import { PasteHandler, StarterKit as FreeKit } from '@richkitjs/starter-kit'

// StarterKit is MIT and leaves out the Pro review extensions. The Pro editors
// keep them, in the slot they always had: just before the paste handler.
const at = FreeKit.indexOf(PasteHandler)

export const StarterKit = [
  ...FreeKit.slice(0, at),
  Comment,
  ...TrackChangesKit,
  ...FreeKit.slice(at),
]
