import type { ReactNode } from 'react'
import { CommentBoxEditor } from '../editors/CommentBoxEditor'
import { CommentsEditor } from '../editors/CommentsEditor'
import { FindReplaceEditor } from '../editors/FindReplaceEditor'
import { HtmlEditor } from '../editors/HtmlEditor'
import { MentionsEditor } from '../editors/MentionsEditor'
import { MinimalEditor } from '../editors/MinimalEditor'
import { SimpleEditor } from '../editors/SimpleEditor'
import { TrackChangesEditor } from '../editors/TrackChangesEditor'
import commentBoxSource from '../../../../packages/editors/src/CommentBoxEditor.tsx?raw'
import commentsSource from '../../../../packages/editors-pro/src/CommentsEditor.tsx?raw'
import findSource from '../../../../packages/editors/src/FindReplaceEditor.tsx?raw'
import htmlSource from '../../../../packages/editors/src/HtmlEditor.tsx?raw'
import mentionsSource from '../../../../packages/editors/src/MentionsEditor.tsx?raw'
import minimalSource from '../../../../packages/editors/src/MinimalEditor.tsx?raw'
import simpleSource from '../../../../packages/editors-pro/src/SimpleEditor.tsx?raw'
import trackSource from '../../../../packages/editors-pro/src/TrackChangesEditor.tsx?raw'

export interface Example {
  id: string
  title: string
  blurb: string
  /** The package the example is about, shown in the frame bar. */
  pkg: string
  /** Built on a RichKit Pro package, so production use needs a licence key. */
  pro?: boolean
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
    id: 'simple',
    title: 'Simple',
    blurb:
      'The full StarterKit behind a one-row toolbar, with a slash menu, a bubble menu, find and replace and a light/dark toggle. A drop-in editor for most forms and CMS fields.',
    pkg: '@richkitjs/editors-pro',
    pro: true,
    install: `${BASE} @richkitjs/editors @richkitjs/editors-pro @richkitjs/license`,
    points: [
      '`SimpleEditor` behaves like a form input: `value` in, `onChange` out, plus `name` for native form submits and a `ref` handle for form libraries.',
      'Every StarterKit extension is on — headings, lists, tables, images, links, code blocks — with `/` for block commands and a bubble menu over selections.',
      'The toolbar is plain `@richkitjs/react` parts (`Toolbar`, `BlockTypeMenu`, list menus), so the source is a template for your own.',
    ],
    snippet: `import '@richkitjs/editors/style.css'
import { SimpleEditor } from '@richkitjs/editors-pro'

const [html, setHtml] = useState('<p>Hello</p>')

<SimpleEditor value={html} onChange={setHtml} placeholder="Write something…" />`,
    source: simpleSource,
    demo: () => <SimpleEditor />,
  },
  {
    id: 'comments',
    title: 'Comments',
    blurb:
      'Select text to start a thread. Reply, resolve and reopen from the sidebar — threads stay anchored to the text they are about.',
    pkg: '@richkitjs/extension-comments',
    pro: true,
    install: `${BASE} @richkitjs/extension-comments @richkitjs/license`,
    points: [
      'Comments are RichKit Pro: add `Comment` from `@richkitjs/extension-comments` to your extensions. A thread is a mark on the text plus an entry in plugin state, so it moves with the text as the document changes.',
      '`CommentSidebar` lists threads with reply, resolve, reopen and delete. `CommentComposer` is the small box that opens under the selection.',
      'The demo seeds two threads on load with `addComment` and `addCommentReply`.',
    ],
    snippet: `import { Comment } from '@richkitjs/extension-comments'
import { CommentComposer, CommentSidebar } from '@richkitjs/react'

const editor = useEditor({ extensions: [...StarterKit, Comment] })

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
    pro: true,
    install: `${BASE} @richkitjs/extension-track-changes @richkitjs/license`,
    points: [
      'Track changes is RichKit Pro: add `TrackChangesKit` from `@richkitjs/extension-track-changes` to your extensions.',
      'With tracking on, typed text becomes an insertion and deleted text stays in place as a deletion, both credited to the current author.',
      'Suggestions are plain marked-up spans (`data-suggestion="insertion"`), so a document can be loaded with review already in progress.',
      '`SuggestionSidebar` lists every suggestion, with accept and reject for each one, both for all of them, and the tracking toggle.',
    ],
    snippet: `import { TrackChangesKit } from '@richkitjs/extension-track-changes'
import { SuggestionSidebar } from '@richkitjs/react'

const editor = useEditor({ extensions: [...StarterKit, ...TrackChangesKit] })

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
