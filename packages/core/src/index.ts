export { Editor } from './editor'
export type { EditorOptions, EditorEvents } from './editor'
export { Extension } from './extension/extension'
export type { ExtensionConfig, AnyExtension } from './extension/extension'
export { Node } from './extension/node'
export type { NodeConfig } from './extension/node'
export { Mark } from './extension/mark'
export type { MarkConfig } from './extension/mark'
export { buildSchema } from './schema/builder'
export { CommandChain } from './commands/chain'
export type { Command, CommandProps } from './commands/chain'
export { toggleMark, setMark, unsetMark, fromPM } from './commands/marks'
export { selectAll, clearFormatting } from './commands/util'
export {
  setBlockType,
  wrapIn,
  lift,
  wrapInList,
  toggleWrap,
  toggleBlockType,
} from './commands/blocks'
export { trailingClick } from './plugins/trailing-click'
export { htmlToDoc, docToHtml } from './html'
export { createAutosave } from './autosave'
export type { AutosaveOptions } from './autosave'
