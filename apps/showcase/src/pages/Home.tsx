import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icons } from '@richkitjs/react'
import { ComparisonTable } from '../components/ComparisonTable'
import { HeroPreview } from '../components/HeroPreview'
import { Icon, type IconName } from '../components/SiteIcons'
import { TemplateCard } from '../components/TemplateCard'
import { TEMPLATES } from '../data/templates'
import { AgentEditor } from '../editors/AgentEditor'
import { DocxEditor } from '../editors/DocxEditor'
import { ClassicEditor } from '../editors/FormFieldEditor'
import { NotionEditor } from '../editors/NotionEditor'
import { SimpleEditor } from '../editors/SimpleEditor'
import agentSource from '../../../../packages/editors/src/AgentEditor.tsx?raw'
import docxSource from '../../../../packages/editors/src/DocxEditor.tsx?raw'
import classicSource from '../../../../packages/editors/src/ClassicEditor.tsx?raw'
import notionSource from '../../../../packages/editors/src/NotionEditor.tsx?raw'
import simpleSource from '../../../../packages/editors/src/SimpleEditor.tsx?raw'

type TabId = 'agent' | 'docx' | 'notion' | 'simple' | 'classic'

const SOURCES: Record<TabId, string> = {
  agent: agentSource,
  docx: docxSource,
  notion: notionSource,
  simple: simpleSource,
  classic: classicSource,
}

const TABS: { id: TabId; label: string; pkg: string }[] = [
  { id: 'agent', label: 'Agent editor', pkg: '@richkitjs/extension-ai' },
  { id: 'docx', label: 'Docx editor', pkg: '@richkitjs/docx' },
  { id: 'notion', label: 'Notion-like editor', pkg: '@richkitjs/extension-slash-commands' },
  { id: 'simple', label: 'Simple editor', pkg: '@richkitjs/starter-kit' },
  { id: 'classic', label: 'Classic editor', pkg: '@richkitjs/extension-table' },
]

const TAB_IDS = new Set<string>(TABS.map((t) => t.id))

const INSTALL = 'pnpm add @richkitjs/starter-kit'

const METRICS: { value: string; label: string }[] = [
  { value: '40+', label: 'extensions on npm' },
  { value: '100%', label: 'headless core' },
  { value: '$99', label: 'a year, every package' },
]

const STACK = ['React 18 · 19', 'Next.js', 'Vite', 'TypeScript', 'ProseMirror', 'Yjs-ready']

const FEATURES: { id: string; icon: IconName; tag: string; title: string; body: string }[] = [
  {
    id: 'ai',
    icon: 'sparkle',
    tag: 'Included',
    title: 'AI toolkit',
    body: 'Wire agents into the document. Chatbots, proofreaders and multi-step edit workflows arrive as reviewable suggestions, not silent rewrites.',
  },
  {
    id: 'conversion',
    icon: 'convert',
    tag: 'Included',
    title: 'Conversion',
    body: 'DOCX, Markdown and HTML in and out, with packages that map cleanly to the editor schema. Runs in the browser — no conversion service.',
  },
  {
    id: 'collab',
    icon: 'collab',
    tag: 'Roadmap',
    title: 'Collaboration',
    body: 'A transaction-based core built for shared editing: deterministic document state, presence hooks and a Yjs-ready shape.',
  },
  {
    id: 'comments',
    icon: 'comment',
    tag: 'Included',
    title: 'Comments',
    body: 'Anchor inline threads to ranges. Discuss, resolve, and keep annotations glued to the text as it moves around them.',
  },
  {
    id: 'documents',
    icon: 'book',
    tag: 'Included',
    title: 'Documents',
    body: 'Page breaks, word count and paginated DOCX layout — the primitives real document tools depend on, not a demo approximation.',
  },
  {
    id: 'editor',
    icon: 'type',
    tag: 'Included',
    title: 'Editor',
    body: 'A framework-agnostic core with first-class React bindings. Headless, typed end to end, and yours to extend.',
  },
]

const PROOF: { head: string; body: string }[] = [
  { head: 'One flat price', body: 'Unlimited devs, every package' },
  { head: 'No license key', body: 'Never phones home' },
  { head: 'Source available', body: 'Read and patch every line' },
  { head: 'Runs in the browser', body: 'DOCX without a service' },
  { head: 'Typed end to end', body: 'TypeScript sources, ESM + CJS' },
  { head: 'Bring your own model', body: 'Anthropic or OpenAI adapters' },
]

function tabFromHash(hash: string): TabId {
  const h = hash.replace(/^#/, '')
  return (TAB_IDS.has(h) ? h : 'agent') as TabId
}

function CopyIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function Home() {
  const { hash } = useLocation()
  const navigate = useNavigate()
  // The tab lives in the hash so a link can open one, which means the hash --
  // not local state -- has to be what renders, or Back leaves the URL and the
  // tabbar disagreeing.
  const tab = tabFromHash(hash)
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [installCopied, setInstallCopied] = useState(false)

  const active = TABS.find((t) => t.id === tab)!

  const selectTab = (id: TabId) => navigate({ hash: id }, { replace: true })

  const copy = async (text: string, mark: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
      mark(true)
      window.setTimeout(() => mark(false), 1500)
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <>
      <section className="shell hero" id="top">
        <div>
          <div className="hero-eyebrow">
            <b>$99/yr</b>
            The rich text editor toolkit for React
          </div>
          <h1 className="hero-title">
            Build AI-native editors with <em>production-ready</em> primitives
          </h1>
          <p className="hero-sub">
            A headless, transaction-based editor core with first-class React bindings. Track
            changes, comments, DOCX round-tripping and agent workflows are in the box, for one flat
            price — no per-seat maths, no license key, no hosted backend, no vendor account.
          </p>
          <div className="hero-actions">
            <a href="#examples" className="btn-primary">
              <Icon name="book" size={17} />
              Explore live examples
            </a>
            <Link to="/docs/installation" className="btn-secondary">
              <Icon name="docs" size={17} />
              Read the docs
            </Link>
          </div>
          <button
            type="button"
            className="hero-install"
            onClick={() => copy(INSTALL, setInstallCopied)}
            title="Copy install command"
          >
            <span className="prompt">$</span> {INSTALL}
            <span className="copied">{installCopied ? 'Copied' : ''}</span>
          </button>
          <div className="hero-metrics">
            {METRICS.map((m) => (
              <div key={m.label}>
                <span className="metric-value">{m.value}</span>
                <span className="metric-label">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-art">
          <HeroPreview />
          <p className="hero-art-note">
            Agent edits land as suggestions you accept or reject.{' '}
            <a href="#examples">Open the live editor ↗</a>
          </p>
        </div>
      </section>

      <section className="shell">
        <div className="stack-strip">
          <span className="lead">Ships with the stack you already run</span>
          <div className="names">
            {STACK.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="examples" className="shell section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Five editors, one core</h2>
            <p className="section-sub">
              Five surfaces built from the same <code>@richkitjs</code> packages. Switch tabs to see
              how far one core stretches.
            </p>
          </div>
          <Link to="/templates" className="section-link">
            All templates →
          </Link>
        </div>

        <div className="tabbar" role="tablist" aria-label="Editor examples">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => selectTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="stage-wrap">
          <div className="frame-bar">
            <div className="frame-dots">
              <span />
              <span />
              <span />
            </div>
            <span className="frame-title">{active.label}</span>
            <code className="frame-pkg">{active.pkg}</code>
          </div>

          <div className="stage-actions">
            <button
              type="button"
              className={`code-icon-btn${showCode ? ' is-active' : ''}`}
              aria-pressed={showCode}
              title={showCode ? 'View demo' : 'View code'}
              onClick={() => setShowCode((v) => !v)}
            >
              <Icons.CodeIcon />
            </button>
            {showCode && (
              <button
                type="button"
                className={`code-icon-btn${copied ? ' is-active' : ''}`}
                title={copied ? 'Copied' : 'Copy code'}
                onClick={() => copy(SOURCES[tab], setCopied)}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            )}
          </div>

          {showCode ? (
            <pre className="docs-pre code-panel">
              <code>{SOURCES[tab]}</code>
            </pre>
          ) : (
            <div className="stage">
              {tab === 'agent' && <AgentEditor />}
              {tab === 'docx' && <DocxEditor />}
              {tab === 'notion' && <NotionEditor />}
              {tab === 'simple' && <SimpleEditor />}
              {tab === 'classic' && <ClassicEditor />}
            </div>
          )}
        </div>

        <p className="stage-caption">
          Each template's full source sits in <code>apps/showcase/src/editors</code>. Want the
          write-up for each? See the <Link to="/docs/usecases/agent-workflows">usecase docs</Link>.
        </p>
      </section>

      <section id="platform" className="shell section">
        <h2 className="section-title">Everything you need to build real editors</h2>
        <p className="section-sub" style={{ marginBottom: 34 }}>
          One core, a grid of composable packages. Add only what you ship — and none of it sits
          behind a plan.
        </p>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" id={f.id} key={f.title}>
              <div className="feature-top">
                <span className="feature-icon">
                  <Icon name={f.icon} size={19} />
                </span>
                <span className={`tag${f.tag === 'Included' ? ' is-included' : ''}`}>{f.tag}</span>
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-body">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="templates" className="shell section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Templates and UI components</h2>
            <p className="section-sub">
              Not just editors — the panels, menus and review surfaces around them. Copy the source
              out of the repo and keep the parts you want.
            </p>
          </div>
          <Link to="/templates" className="section-link">
            All templates →
          </Link>
        </div>
        <div className="template-grid">
          {TEMPLATES.slice(0, 3).map((t) => (
            <TemplateCard key={t.title} template={t} />
          ))}
        </div>
      </section>

      <section id="compare" className="shell section">
        <div className="section-head">
          <div>
            <h2 className="section-title">The same premium features, a tenth of the price</h2>
            <p className="section-sub">
              Track changes, comments, DOCX round-tripping and AI sit behind four-figure plans
              almost everywhere else. Here they are on npm, all of them, for $99 a year.
            </p>
          </div>
          <Link to="/docs/comparison" className="section-link">
            Full comparison &amp; sources →
          </Link>
        </div>

        <ComparisonTable notes={false} />

        <p className="stage-caption">
          <span className="cmp-mark is-open">✓</span> included in the base price ·{' '}
          <span className="cmp-mark is-paid">$</span> costs extra ·{' '}
          <span className="cmp-mark is-partial">~</span> partial ·{' '}
          <span className="cmp-mark is-none">–</span> unavailable — claims taken from each vendor's
          own pricing and licensing pages.
        </p>
      </section>

      <section className="shell section">
        <div className="proof-grid">
          {PROOF.map((p) => (
            <div className="proof-cell" key={p.head}>
              <b>{p.head}</b>
              <span>{p.body}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="get-started" className="shell section">
        <div className="cta-panel">
          <h2>Install it and ship the editor this week</h2>
          <p>
            One command gets you the starter kit. The AI, DOCX and comments packages are one install
            away — and one licence covers every package.
          </p>
          <div className="cta-actions">
            <Link to="/docs/installation" className="btn-light">
              <Icon name="type" size={17} />
              Get started
            </Link>
            <Link to="/pricing" className="btn-secondary">
              <Icon name="price" size={17} />
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
