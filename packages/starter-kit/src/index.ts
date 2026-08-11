import { Blockquote } from '@richkitjs/extension-blockquote'
import { Comment } from '@richkitjs/extension-comments'
import { FindReplace } from '@richkitjs/extension-find-replace'
import { TrackChangesKit } from '@richkitjs/extension-track-changes'
import { Bold } from '@richkitjs/extension-bold'
import { BulletList } from '@richkitjs/extension-bullet-list'
import { CaseChange } from '@richkitjs/extension-case-change'
import { Code } from '@richkitjs/extension-code'
import { CodeBlock } from '@richkitjs/extension-code-block'
import { Embed } from '@richkitjs/extension-embed'
import { Heading } from '@richkitjs/extension-heading'
import { Highlight } from '@richkitjs/extension-highlight'
import { History } from '@richkitjs/extension-history'
import { HorizontalRule } from '@richkitjs/extension-horizontal-rule'
import { Image } from '@richkitjs/extension-image'
import { Italic } from '@richkitjs/extension-italic'
import { LineHeight } from '@richkitjs/extension-line-height'
import { Link } from '@richkitjs/extension-link'
import { ListItem } from '@richkitjs/extension-list-item'
import { MarkdownShortcuts } from '@richkitjs/extension-markdown-shortcuts'
import { OrderedList } from '@richkitjs/extension-ordered-list'
import { PageBreak } from '@richkitjs/extension-page-break'
import { Paragraph } from '@richkitjs/extension-paragraph'
import { PasteHandler } from '@richkitjs/extension-paste-handler'
import { Placeholder } from '@richkitjs/extension-placeholder'
import { SlashCommands } from '@richkitjs/extension-slash-commands'
import { Strike } from '@richkitjs/extension-strike'
import { Subscript } from '@richkitjs/extension-subscript'
import { Superscript } from '@richkitjs/extension-superscript'
import { TableKit } from '@richkitjs/extension-table'
import { TaskItem, TaskList } from '@richkitjs/extension-task-list'
import { TextAlign } from '@richkitjs/extension-text-align'
import { TextStyle } from '@richkitjs/extension-text-style'
import { Typography } from '@richkitjs/extension-typography'
import { Underline } from '@richkitjs/extension-underline'
import { WordCount } from '@richkitjs/extension-word-count'

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
