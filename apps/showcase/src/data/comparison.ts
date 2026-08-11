export type CellState = 'open' | 'paid' | 'partial' | 'none'

export type Cell = {
  state: CellState
  label: string
  note?: string
}

export type ComparisonRow = {
  feature: string
  detail: string
  cells: Cell[]
}

/**
 * Column order is fixed across every row. RichKit is always index 0.
 * Competitor claims are sourced from the vendors' own pricing/licensing
 * pages — see COMPARISON_SOURCES. Keep them checkable, not editorial.
 */
export const COMPARISON_COLUMNS = ['RichKit', 'Tiptap', 'Lexical', 'CKEditor 5', 'TinyMCE'] as const

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: 'Editor license',
    detail: 'What the core itself is licensed under.',
    cells: [
      { state: 'open', label: 'MIT' },
      { state: 'open', label: 'MIT' },
      { state: 'open', label: 'MIT' },
      {
        state: 'partial',
        label: 'GPL-2.0+ / commercial',
        note: 'Closed-source products need the commercial license.',
      },
      { state: 'partial', label: 'GPL-2.0+ / commercial', note: 'v7 moved from MIT to GPL-2.0+.' },
    ],
  },
  {
    feature: 'DOCX import / export',
    detail: 'Round-trip Word documents without a conversion service.',
    cells: [
      { state: 'open', label: 'MIT', note: '@richkit/docx — runs in the browser, no server call.' },
      { state: 'paid', label: 'Paid', note: 'Conversion is a hosted service on a paid plan.' },
      { state: 'none', label: 'Not built in' },
      { state: 'paid', label: 'Premium feature' },
      { state: 'paid', label: 'Premium add-on', note: 'Export to Word.' },
    ],
  },
  {
    feature: 'Track changes',
    detail: 'Redlining with accept / reject per change.',
    cells: [
      { state: 'open', label: 'MIT', note: '@richkit/extension-track-changes' },
      { state: 'paid', label: 'Paid add-on' },
      { state: 'none', label: 'Not built in' },
      { state: 'paid', label: 'Premium feature' },
      { state: 'paid', label: 'Premium add-on' },
    ],
  },
  {
    feature: 'Comments & threads',
    detail: 'Inline threads anchored to a range of text.',
    cells: [
      { state: 'open', label: 'MIT', note: '@richkit/extension-comments' },
      {
        state: 'paid',
        label: 'Paid',
        note: 'Part of the Documents bundle; needs cloud-stored docs.',
      },
      { state: 'none', label: 'Not built in' },
      { state: 'paid', label: 'Premium feature' },
      { state: 'paid', label: 'Premium add-on' },
    ],
  },
  {
    feature: 'AI assistance',
    detail: 'Prompt the model to write or rewrite inside the document.',
    cells: [
      {
        state: 'open',
        label: 'MIT',
        note: '@richkit/extension-ai — bring your own provider; edits arrive as reviewable suggestions.',
      },
      { state: 'paid', label: 'Paid', note: 'Content AI bundle.' },
      { state: 'none', label: 'Not built in' },
      { state: 'paid', label: 'Premium feature' },
      { state: 'paid', label: 'Premium add-on' },
    ],
  },
  {
    feature: 'Real-time collaboration',
    detail: 'Multiple cursors on one document.',
    cells: [
      {
        state: 'none',
        label: 'On the roadmap',
        note: 'Not shipped yet. The core is transaction-based and ready for it.',
      },
      {
        state: 'partial',
        label: 'Free self-host / paid cloud',
        note: 'Hocuspocus is MIT; the managed backend is on a paid plan.',
      },
      { state: 'partial', label: 'Bring your own Yjs' },
      { state: 'paid', label: 'Premium feature' },
      { state: 'paid', label: 'Premium add-on' },
    ],
  },
  {
    feature: 'Slash commands',
    detail: 'Type / to insert blocks.',
    cells: [
      { state: 'open', label: 'MIT', note: '@richkit/extension-slash-commands, menu included.' },
      {
        state: 'partial',
        label: 'Build it yourself',
        note: 'MIT Suggestion utility, no ready-made menu.',
      },
      { state: 'partial', label: 'Build it yourself' },
      { state: 'open', label: 'Included' },
      { state: 'open', label: 'Included' },
    ],
  },
  {
    feature: 'Find & replace',
    detail: 'Search across the document, replace one or all.',
    cells: [
      { state: 'open', label: 'MIT', note: '@richkit/extension-find-replace' },
      { state: 'partial', label: 'Community package' },
      { state: 'none', label: 'Not built in' },
      { state: 'open', label: 'Included' },
      { state: 'open', label: 'Included' },
    ],
  },
  {
    feature: 'Runs with no vendor account',
    detail: 'No API key, license key, or hosted backend to sign up for.',
    cells: [
      {
        state: 'open',
        label: 'Yes',
        note: 'npm install and ship. The editor never phones home; only the optional AI extension calls out, to a provider you choose.',
      },
      { state: 'partial', label: 'Editor yes, platform no' },
      { state: 'open', label: 'Yes' },
      { state: 'partial', label: 'License key required' },
      { state: 'partial', label: 'API key for cloud' },
    ],
  },
  {
    feature: 'Cost of the full feature set',
    detail: 'Everything above, for one product, per month.',
    cells: [
      { state: 'open', label: '$0' },
      { state: 'paid', label: '$49 – $999 / mo', note: 'Per-seat dev licenses billed on top.' },
      { state: 'open', label: '$0', note: 'You build the missing pieces.' },
      { state: 'paid', label: 'Quote' },
      { state: 'paid', label: 'Quote' },
    ],
  },
]

export const COMPARISON_SOURCES: { label: string; href: string }[] = [
  { label: 'Tiptap pricing', href: 'https://tiptap.dev/pricing' },
  {
    label: 'Tiptap: open-sourcing more of Tiptap',
    href: 'https://tiptap.dev/blog/release-notes/were-open-sourcing-more-of-tiptap',
  },
  {
    label: 'CKEditor licensing options',
    href: 'https://ckeditor.com/legal/ckeditor-licensing-options/',
  },
  {
    label: 'TinyMCE licensing',
    href: 'https://www.tiny.cloud/blog/opensource-rich-text-editor-licences/',
  },
  { label: 'Lexical', href: 'https://lexical.dev' },
]

export const COMPARISON_CHECKED = 'August 2026'
