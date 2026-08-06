import { Blockquote } from '@richkit/extension-blockquote'
import { Comment } from '@richkit/extension-comments'
import { FindReplace } from '@richkit/extension-find-replace'
import { TrackChangesKit } from '@richkit/extension-track-changes'
import { Bold } from '@richkit/extension-bold'
import { BulletList } from '@richkit/extension-bullet-list'
import { CaseChange } from '@richkit/extension-case-change'
import { Code } from '@richkit/extension-code'
import { CodeBlock } from '@richkit/extension-code-block'
import { Embed } from '@richkit/extension-embed'
import { Heading } from '@richkit/extension-heading'
import { Highlight } from '@richkit/extension-highlight'
import { History } from '@richkit/extension-history'
import { HorizontalRule } from '@richkit/extension-horizontal-rule'
import { Image } from '@richkit/extension-image'
import { Italic } from '@richkit/extension-italic'
import { LineHeight } from '@richkit/extension-line-height'
import { Link } from '@richkit/extension-link'
import { ListItem } from '@richkit/extension-list-item'
import { MarkdownShortcuts } from '@richkit/extension-markdown-shortcuts'
import { OrderedList } from '@richkit/extension-ordered-list'
import { PageBreak } from '@richkit/extension-page-break'
import { Paragraph } from '@richkit/extension-paragraph'
import { PasteHandler } from '@richkit/extension-paste-handler'
import { Placeholder } from '@richkit/extension-placeholder'
import { SlashCommands } from '@richkit/extension-slash-commands'
import { Strike } from '@richkit/extension-strike'
import { Subscript } from '@richkit/extension-subscript'
import { Superscript } from '@richkit/extension-superscript'
import { TableKit } from '@richkit/extension-table'
import { TaskItem, TaskList } from '@richkit/extension-task-list'
import { TextAlign } from '@richkit/extension-text-align'
import { TextStyle } from '@richkit/extension-text-style'
import { Typography } from '@richkit/extension-typography'
import { Underline } from '@richkit/extension-underline'
import { WordCount } from '@richkit/extension-word-count'

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
