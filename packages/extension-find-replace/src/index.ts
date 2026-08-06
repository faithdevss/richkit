import { Extension } from '@richkit/core'
import { findReplacePlugin } from './plugin'

export const FindReplace = Extension.create({
  name: 'findReplace',
  addProseMirrorPlugins: () => [findReplacePlugin()],
})

export {
  findReplaceKey,
  findReplacePlugin,
  findMatches,
  setQuery,
  clearFind,
  gotoNext,
  gotoPrev,
  replaceCurrent,
  replaceAll,
  getFindState,
} from './plugin'
export type { FindReplaceState, FindReplaceMeta, Match } from './plugin'
