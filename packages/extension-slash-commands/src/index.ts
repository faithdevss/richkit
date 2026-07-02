import { Extension } from '@rich-editor/core'
import { slashCommandsPlugin } from './plugin'

export const SlashCommands = Extension.create({
  name: 'slashCommands',
  addProseMirrorPlugins: () => [slashCommandsPlugin()],
})

export {
  slashKey,
  slashCommandsPlugin,
  getSlashState,
  setSlashItemCount,
  closeSlash,
  registerSlashEnter,
} from './plugin'
export type { SlashState, SlashMeta, SlashRange } from './plugin'
