import type { ReactNode } from 'react'
import { CommentBoxEditor } from '../editors/CommentBoxEditor'
import { CommentsEditor } from '../editors/CommentsEditor'
import { FindReplaceEditor } from '../editors/FindReplaceEditor'
import { HtmlEditor } from '../editors/HtmlEditor'
import { MarkdownEditor } from '../editors/MarkdownEditor'
import { MentionsEditor } from '../editors/MentionsEditor'
import { MinimalEditor } from '../editors/MinimalEditor'
import { QuestionEditor } from '../editors/QuestionEditor'
import { TrackChangesEditor } from '../editors/TrackChangesEditor'
import commentBoxSource from '../editors/CommentBoxEditor.tsx?raw'
import commentsSource from '../editors/CommentsEditor.tsx?raw'
import findSource from '../editors/FindReplaceEditor.tsx?raw'
import htmlSource from '../editors/HtmlEditor.tsx?raw'
import markdownSource from '../editors/MarkdownEditor.tsx?raw'
import mentionsSource from '../editors/MentionsEditor.tsx?raw'
import minimalSource from '../editors/MinimalEditor.tsx?raw'
import questionSource from '../editors/QuestionEditor.tsx?raw'
import trackSource from '../editors/TrackChangesEditor.tsx?raw'

export interface Example {
  id: string
  title: string
  blurb: string
  /** The package the example is about, shown in the frame bar. */
  pkg: string
  /** Everything to install, space-separated. */
  install: string
  /** What to notice, one point per line. */
  points: string[]
  /** The few lines that matter, before the full file. */
  snippet: string
  source: string
  demo: () => ReactNode
}

const BASE = '@richkitjs/react @richkitjs/starter-kit'

export const EXAMPLES: Example[] = [
  {
    id: 'question',
    title: 'Question editor',
    blurb:
      'Author a multiple-choice question: formulas, tables, images, sub- and superscript, colour and highlight. One toolbar follows whichever field you are in.',
    pkg: '@richkitjs/extension-math',
    install: `${BASE} @richkitjs/extension-math`,
    points: [
      'The question uses the full StarterKit plus both math nodes. Each answer option is its own small editor, limited to inline formatting and inline formulas.',
      'One toolbar serves every field: each editor reports focus, and the toolbar re-binds to whichever was focused last.',
      'Double-clicking a formula calls the math extension’s `onEdit`, which opens the formula panel with a live KaTeX preview.',
      'Formulas are stored as `<span data-math>` and `<div data-math-block>` with the LaTeX inside, so saved questions stay readable.',
    ],
    snippet: `import { MathBlock, MathInline } from '@richkitjs/extension-math'
import '@richkitjs/extension-math/style.css'

const onEdit = ({ editor, pos, latex }) => openFormulaPanel({ editor, pos, latex })

const editor = useEditor({
  extensions: [
    ...StarterKit,
    MathInline.configure({ onEdit }),
    MathBlock.configure({ onEdit }),
  ],
})

editor.chain().call('insertMath', '\\\\frac{\\\\Delta v}{\\\\Delta t}').run()
editor.chain().call('updateMath', pos, 'a = 3').run()`,
    source: questionSource,
    demo: () => <QuestionEditor />,
  },
  {
    id: 'markdown',
    title: 'Markdown editor',
    blurb:
      'Rich editing on the left, the Markdown source on the right. Edit either side and the other follows.',
    pkg: '@richkitjs/markdown',
    install: `${BASE} @richkitjs/markdown`,
    points: [
      'Markdown goes in through `markdownToHtml` and comes out through `docToMarkdown`. The editor itself only ever holds a document.',
      'A ref marks updates that came from the source pane, so the editor doesn’t re-serialise and overwrite what is being typed.',
      'Markdown shortcuts such as `## ` and `- ` come with StarterKit.',
    ],
    snippet: `import { docToMarkdown, markdownToHtml } from '@richkitjs/markdown'

const editor = useEditor({
  extensions: StarterKit,
  content: markdownToHtml(markdown),
  onUpdate: ({ editor }) => setMarkdown(docToMarkdown(editor.state.doc)),
})`,
    source: markdownSource,
    demo: () => <MarkdownEditor />,
  },
  {
    id: 'comments',
    title: 'Comments',
    blurb:
      'Select text to start a thread. Reply, resolve and reopen from the sidebar — threads stay anchored to the text they are about.',
    pkg: '@richkitjs/extension-comments',
    install: BASE,
    points: [
      'Comments ship in StarterKit. A thread is a mark on the text plus an entry in plugin state, so it moves with the text as the document changes.',
      '`CommentSidebar` lists threads with reply, resolve, reopen and delete. `CommentComposer` is the small box that opens under the selection.',
      'The demo seeds two threads on load with `addComment` and `addCommentReply`.',
    ],
    snippet: `import { CommentComposer, CommentSidebar } from '@richkitjs/react'

editor.chain().call('addComment', { body, author: 'Priya', from, to }).run()
editor.chain().call('addCommentReply', { id, body: 'Agreed.' }).run()

<CommentSidebar editor={editor} onAddRequest={openComposer} />
<CommentComposer editor={editor} range={range} onSubmit={submit} onClose={close} />`,
    source: commentsSource,
    demo: () => <CommentsEditor />,
  },
  {
    id: 'track-changes',
    title: 'Track changes',
    blurb:
      'Edits land as suggestions, attributed to whoever made them. Accept or reject each one, or clear the lot in one go.',
    pkg: '@richkitjs/extension-track-changes',
    install: BASE,
    points: [
      'With tracking on, typed text becomes an insertion and deleted text stays in place as a deletion, both credited to the current author.',
      'Suggestions are plain marked-up spans (`data-suggestion="insertion"`), so a document can be loaded with review already in progress.',
      '`SuggestionSidebar` lists every suggestion, with accept and reject for each one, both for all of them, and the tracking toggle.',
    ],
    snippet: `import { SuggestionSidebar } from '@richkitjs/react'

editor.chain().call('enableTrackChanges', 'Dana (Legal)').run()
editor.chain().call('acceptSuggestion', id).run()
editor.chain().call('rejectSuggestion', id).run()

<SuggestionSidebar editor={editor} />`,
    source: trackSource,
    demo: () => <TrackChangesEditor />,
  },
  {
    id: 'mentions',
    title: 'Mentions',
    blurb:
      'A chat composer: type @ to mention a person or a page, Enter to send. The list of who can be mentioned is your own data.',
    pkg: '@richkitjs/extension-mention',
    install: `${BASE} @richkitjs/extension-mention`,
    points: [
      '`MentionMenu` filters the `items` you pass in. The editor stores only the id and label of whatever was picked.',
      'Enter is caught in the capture phase to send the message, unless the mention menu is open. Then it picks a person.',
      'Sent messages are the editor’s own `getHTML()`, so typed text arrives escaped.',
    ],
    snippet: `import { MentionMenu } from '@richkitjs/react'
import { getMentionState } from '@richkitjs/extension-mention'

const PEOPLE = [{ id: 'priya', label: 'Priya', detail: 'Design' }]

<div onKeyDownCapture={(e) => {
  if (e.key === 'Enter' && !getMentionState(editor.state)?.active) send()
}}>
  <EditorContent editor={editor} />
  <MentionMenu editor={editor} items={PEOPLE} />
</div>`,
    source: mentionsSource,
    demo: () => <MentionsEditor />,
  },
  {
    id: 'minimal',
    title: 'Minimal',
    blurb:
      'Five extensions and no toolbar — select text for a small bold, italic and link menu. The smallest useful editor.',
    pkg: '@richkitjs/core',
    install: BASE,
    points: [
      'The core supplies the document and text nodes. Everything else is opt-in, so this editor only knows paragraphs, bold, italic, links and undo.',
      'Pasted headings, lists or images are reduced to what the schema allows.',
      '`BubbleMenu` appears over a selection, which is the only place formatting is offered.',
    ],
    snippet: `import { Bold, History, Italic, Link, Paragraph } from '@richkitjs/starter-kit'

const editor = useEditor({
  extensions: [Paragraph, Bold, Italic, Link, History],
})`,
    source: minimalSource,
    demo: () => <MinimalEditor />,
  },
  {
    id: 'comment-box',
    title: 'Comment box with a limit',
    blurb:
      'A reply box with a live word and character count. Past 280 characters the counter turns red and Reply is disabled.',
    pkg: '@richkitjs/extension-word-count',
    install: `${BASE} @richkitjs/extension-word-count @richkitjs/extension-placeholder`,
    points: [
      '`getWordCount(doc)` returns words, characters and reading time. It runs on every update, so the counter is always current.',
      'The limit is enforced where the reply is posted, not while typing. Going over is allowed, and the counter shows how far over.',
      '`Placeholder.configure()` returns a copy, so this box’s placeholder text doesn’t leak into other editors on the page.',
    ],
    snippet: `import { getWordCount } from '@richkitjs/extension-word-count'

useEffect(() => {
  if (!editor) return
  return editor.on('update', () => setStats(getWordCount(editor.state.doc)))
}, [editor])

const over = stats.characters > 280`,
    source: commentBoxSource,
    demo: () => <CommentBoxEditor />,
  },
  {
    id: 'find-replace',
    title: 'Find & replace',
    blurb:
      'A search bar of your own on the headless find API: highlighted matches, next and previous, replace one or all.',
    pkg: '@richkitjs/extension-find-replace',
    install: `${BASE} @richkitjs/extension-find-replace`,
    points: [
      'The plugin finds and highlights matches. The search bar is just inputs and buttons calling its functions.',
      'Matches live in plugin state, so the component re-reads them after every transaction.',
      'For a ready-made dialog instead, `FindReplace` from `@richkitjs/react` wraps the same API.',
    ],
    snippet: `import {
  getFindState, gotoNext, gotoPrev, replaceAll, replaceCurrent, setQuery,
} from '@richkitjs/extension-find-replace'

setQuery(editor.view, 'customer', false, caseSensitive)
const { matches, current } = getFindState(editor.state)
gotoNext(editor.view)
replaceAll(editor.view, 'reader')`,
    source: findSource,
    demo: () => <FindReplaceEditor />,
  },
  {
    id: 'html',
    title: 'HTML in & out',
    blurb:
      'The editor beside the HTML it produces. Edit either side — paste HTML on the right and it renders on the left.',
    pkg: '@richkitjs/core',
    install: BASE,
    points: [
      '`getHTML()` serialises the document and `setContent(html)` parses HTML back through the schema.',
      'Anything the schema doesn’t know is dropped on the way in. Scripts and event-handler attributes never reach the document.',
      'Output is semantic tags only, with inline styles only for things like colour and alignment.',
    ],
    snippet: `const editor = useEditor({
  extensions: StarterKit,
  content: html,
  onUpdate: ({ editor }) => setHtml(editor.getHTML()),
})

editor.setContent('<h2>Pasted</h2><p>HTML</p>')`,
    source: htmlSource,
    demo: () => <HtmlEditor />,
  },
]
