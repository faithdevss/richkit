export type ExtensionCategory =
  | 'Core'
  | 'Nodes'
  | 'Marks'
  | 'Editing behavior'
  | 'Collaboration'
  | 'AI'
  | 'Conversion'
  | 'Framework bindings'

export interface ExtensionEntry {
  pkg: string
  category: ExtensionCategory
  description: string
}

export const EXTENSIONS: ExtensionEntry[] = [
  {
    pkg: 'core',
    category: 'Core',
    description: 'Headless, transaction-based editor engine. Framework-agnostic.',
  },
  {
    pkg: 'starter-kit',
    category: 'Core',
    description: 'Curated bundle of the common nodes, marks, and editing-behavior extensions.',
  },

  { pkg: 'extension-paragraph', category: 'Nodes', description: 'The paragraph block node.' },
  { pkg: 'extension-heading', category: 'Nodes', description: 'H1–H6 heading nodes.' },
  { pkg: 'extension-blockquote', category: 'Nodes', description: 'Blockquote node.' },
  { pkg: 'extension-code-block', category: 'Nodes', description: 'Fenced code block node.' },
  {
    pkg: 'extension-horizontal-rule',
    category: 'Nodes',
    description: 'Horizontal rule / divider node.',
  },
  {
    pkg: 'extension-page-break',
    category: 'Nodes',
    description: 'Explicit page-break node for paginated/print layouts.',
  },
  { pkg: 'extension-bullet-list', category: 'Nodes', description: 'Unordered list node.' },
  { pkg: 'extension-ordered-list', category: 'Nodes', description: 'Ordered list node.' },
  {
    pkg: 'extension-list-item',
    category: 'Nodes',
    description: 'List item node shared by bullet, ordered, and task lists.',
  },
  {
    pkg: 'extension-task-list',
    category: 'Nodes',
    description: 'Checkbox task list and task item nodes.',
  },
  {
    pkg: 'extension-table',
    category: 'Nodes',
    description: 'Table, row, and cell nodes with resizing support.',
  },
  { pkg: 'extension-image', category: 'Nodes', description: 'Inline/block image node.' },
  {
    pkg: 'extension-embed',
    category: 'Nodes',
    description: 'Embed node for external content (video/social providers).',
  },

  { pkg: 'extension-bold', category: 'Marks', description: 'Bold mark.' },
  { pkg: 'extension-italic', category: 'Marks', description: 'Italic mark.' },
  { pkg: 'extension-underline', category: 'Marks', description: 'Underline mark.' },
  { pkg: 'extension-strike', category: 'Marks', description: 'Strikethrough mark.' },
  { pkg: 'extension-code', category: 'Marks', description: 'Inline code mark.' },
  {
    pkg: 'extension-highlight',
    category: 'Marks',
    description: 'Text highlight/background-color mark.',
  },
  { pkg: 'extension-link', category: 'Marks', description: 'Hyperlink mark.' },
  { pkg: 'extension-subscript', category: 'Marks', description: 'Subscript mark.' },
  { pkg: 'extension-superscript', category: 'Marks', description: 'Superscript mark.' },
  {
    pkg: 'extension-text-style',
    category: 'Marks',
    description: 'Base mark carrying font family/size/color attributes.',
  },

  {
    pkg: 'extension-history',
    category: 'Editing behavior',
    description: 'Undo/redo history stack.',
  },
  {
    pkg: 'extension-find-replace',
    category: 'Editing behavior',
    description: 'Find and replace within the document.',
  },
  {
    pkg: 'extension-placeholder',
    category: 'Editing behavior',
    description: 'Empty-state placeholder text.',
  },
  {
    pkg: 'extension-paste-handler',
    category: 'Editing behavior',
    description: 'Normalizes/cleans pasted content.',
  },
  {
    pkg: 'extension-markdown-shortcuts',
    category: 'Editing behavior',
    description: 'Type-through markdown shortcuts (e.g. "# " → heading).',
  },
  {
    pkg: 'extension-slash-commands',
    category: 'Editing behavior',
    description: '"/" command menu for inserting blocks.',
  },
  {
    pkg: 'extension-typography',
    category: 'Editing behavior',
    description: 'Smart typography replacements (quotes, dashes, ellipses).',
  },
  {
    pkg: 'extension-text-align',
    category: 'Editing behavior',
    description: 'Left/center/right/justify block alignment.',
  },
  {
    pkg: 'extension-line-height',
    category: 'Editing behavior',
    description: 'Per-block line-height control.',
  },
  {
    pkg: 'extension-word-count',
    category: 'Editing behavior',
    description: 'Live word/character count.',
  },
  {
    pkg: 'extension-case-change',
    category: 'Editing behavior',
    description: 'Transform selection to upper/lower/title case.',
  },

  {
    pkg: 'extension-comments',
    category: 'Collaboration',
    description: 'Inline comment threads anchored to text ranges.',
  },
  {
    pkg: 'extension-track-changes',
    category: 'Collaboration',
    description: 'Suggested-edit tracking with accept/reject.',
  },

  {
    pkg: 'extension-ai',
    category: 'AI',
    description:
      'Streams model output into the document; provider-agnostic, output reviewable via track changes.',
  },
  {
    pkg: 'ai-openai',
    category: 'AI',
    description:
      'OpenAI transport for extension-ai. Proxy through your own endpoint, or use an end-user-supplied key.',
  },
  {
    pkg: 'ai-anthropic',
    category: 'AI',
    description:
      'Anthropic (Claude) transport for extension-ai. Proxy through your own endpoint, or use an end-user-supplied key.',
  },

  { pkg: 'docx', category: 'Conversion', description: 'DOCX import and export.' },
  { pkg: 'markdown', category: 'Conversion', description: 'Markdown import and export.' },
  { pkg: 'html', category: 'Conversion', description: 'HTML import and export.' },

  {
    pkg: 'react',
    category: 'Framework bindings',
    description: 'React hooks and components (useEditor, EditorContent, toolbar, menus).',
  },
  {
    pkg: 'vue',
    category: 'Framework bindings',
    description: 'Vue bindings mirroring the React package.',
  },
]

export const CATEGORY_ORDER: ExtensionCategory[] = [
  'Core',
  'Nodes',
  'Marks',
  'Editing behavior',
  'Collaboration',
  'AI',
  'Conversion',
  'Framework bindings',
]
