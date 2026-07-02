import { Blockquote } from '@rich-editor/extension-blockquote'
import { Comment } from '@rich-editor/extension-comments'
import { FindReplace } from '@rich-editor/extension-find-replace'
import { TrackChangesKit } from '@rich-editor/extension-track-changes'
import { Bold } from '@rich-editor/extension-bold'
import { BulletList } from '@rich-editor/extension-bullet-list'
import { CaseChange } from '@rich-editor/extension-case-change'
import { Code } from '@rich-editor/extension-code'
import { CodeBlock } from '@rich-editor/extension-code-block'
import { Embed } from '@rich-editor/extension-embed'
import { Heading } from '@rich-editor/extension-heading'
import { Highlight } from '@rich-editor/extension-highlight'
import { History } from '@rich-editor/extension-history'
import { HorizontalRule } from '@rich-editor/extension-horizontal-rule'
import { Image } from '@rich-editor/extension-image'
import { Italic } from '@rich-editor/extension-italic'
import { LineHeight } from '@rich-editor/extension-line-height'
import { Link } from '@rich-editor/extension-link'
import { ListItem } from '@rich-editor/extension-list-item'
import { MarkdownShortcuts } from '@rich-editor/extension-markdown-shortcuts'
import { OrderedList } from '@rich-editor/extension-ordered-list'
import { PageBreak } from '@rich-editor/extension-page-break'
import { Paragraph } from '@rich-editor/extension-paragraph'
import { PasteHandler } from '@rich-editor/extension-paste-handler'
import { Placeholder } from '@rich-editor/extension-placeholder'
import { SlashCommands } from '@rich-editor/extension-slash-commands'
import { Strike } from '@rich-editor/extension-strike'
import { Subscript } from '@rich-editor/extension-subscript'
import { Superscript } from '@rich-editor/extension-superscript'
import { TableKit } from '@rich-editor/extension-table'
import { TaskItem, TaskList } from '@rich-editor/extension-task-list'
import { TextAlign } from '@rich-editor/extension-text-align'
import { TextStyle } from '@rich-editor/extension-text-style'
import { Typography } from '@rich-editor/extension-typography'
import { Underline } from '@rich-editor/extension-underline'
import { WordCount } from '@rich-editor/extension-word-count'

export const StarterKit = [
  Paragraph,
  Heading,
  Blockquote,
  CodeBlock,
  HorizontalRule,
  PageBreak,
  BulletList,
  OrderedList,
  ListItem,
  TaskList,
  TaskItem,
  ...TableKit,
  Image,
  Embed,
  TextStyle,
  Bold,
  Italic,
  Underline,
  Strike,
  Code,
  Highlight,
  Subscript,
  Superscript,
  Link,
  TextAlign,
  LineHeight,
  CaseChange,
  History,
  Placeholder,
  Typography,
  MarkdownShortcuts,
  FindReplace,
  Comment,
  ...TrackChangesKit,
  PasteHandler,
  SlashCommands,
  WordCount,
]

export {
  Blockquote,
  Comment,
  FindReplace,
  TrackChangesKit,
  Bold,
  BulletList,
  CaseChange,
  Code,
  CodeBlock,
  Embed,
  Heading,
  Highlight,
  History,
  HorizontalRule,
  Image,
  Italic,
  LineHeight,
  Link,
  ListItem,
  MarkdownShortcuts,
  OrderedList,
  PageBreak,
  Paragraph,
  PasteHandler,
  Placeholder,
  SlashCommands,
  Strike,
  Subscript,
  Superscript,
  TableKit,
  TaskItem,
  TaskList,
  TextAlign,
  TextStyle,
  Typography,
  Underline,
  WordCount,
}
