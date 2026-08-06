import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '@rich-editor/react'
import { AgentEditor } from '../editors/AgentEditor'
import { DocxEditor } from '../editors/DocxEditor'
import { NotionEditor } from '../editors/NotionEditor'
import { SimpleEditor } from '../editors/SimpleEditor'
import agentSource from '../editors/AgentEditor.tsx?raw'
import docxSource from '../editors/DocxEditor.tsx?raw'
import notionSource from '../editors/NotionEditor.tsx?raw'
import simpleSource from '../editors/SimpleEditor.tsx?raw'

type TabId = 'agent' | 'docx' | 'notion' | 'simple'

const SOURCES: Record<TabId, string> = {
  agent: agentSource,
  docx: docxSource,
  notion: notionSource,
  simple: simpleSource,
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'agent', label: 'Agent editor' },
  { id: 'docx', label: 'Docx editor' },
  { id: 'notion', label: 'Notion-like editor' },
  { id: 'simple', label: 'Simple editor' },
]

const TAB_IDS = new Set<string>(['agent', 'docx', 'notion', 'simple'])

const METRICS: { value: string; label: string }[] = [
  { value: '40+', label: 'extensions' },
  { value: '100%', label: 'headless core' },
  { value: 'MIT', label: 'licensed' },
]

const FEATURES: { icon: string; badge?: string; title: string; body: string }[] = [
  {
    icon: '✦',
    badge: 'Add-on',
    title: 'AI Toolkit',
    body: 'Wire agents into the document. Build chatbots, proofreaders, and multi-step edit workflows on top of the editor state.',
  },
  {
    icon: '⇄',
    title: 'Conversion',
    body: 'Import and export DOCX, Markdown, and HTML with dedicated packages that map cleanly to the editor schema.',
  },
  {
    icon: '◍',
    title: 'Collaboration',
    body: 'Transaction-based core built for shared editing — track changes, presence, and deterministic document state.',
  },
  {
    icon: '❝',
    title: 'Comments',
    body: 'Anchor inline threads to ranges. Discuss, resolve, and keep annotations glued to the text as it moves.',
  },
  {
    icon: '▤',
    title: 'Documents',
    body: 'Page breaks, word count, and paginated docx layout — the primitives real document tools depend on.',
  },
  {
    icon: '◆',
    title: 'Editor',
    body: 'A framework-agnostic core with first-class React bindings. Open source, extensible, yours to ship.',
  },
]

const TEMPLATES: { title: string; tag: string; body: string; tab: TabId }[] = [
  {
    title: 'Simple editor',
    tag: 'Free',
    body: 'A batteries-included toolbar editor — bold, lists, links, headings. Drop it in and go.',
    tab: 'simple',
  },
  {
    title: 'Notion-like editor',
    tag: 'Free',
    body: 'Slash commands, callouts, and a clean block canvas for doc-style writing.',
    tab: 'notion',
  },
  {
    title: 'Docx editor',
    tag: 'Free',
    body: 'A paginated paper sheet with DOCX import/export baked in for real documents.',
    tab: 'docx',
  },
]

const SUPPORT_LINKS: { label: string; href: string; body: string }[] = [
  {
    label: 'GitHub Sponsors',
    href: 'https://github.com/sponsors/faithdevss',
    body: 'Recurring or one-time sponsorship through GitHub.',
  },
  {
    label: 'Ko-fi',
    href: 'https://ko-fi.com/faithdevss',
    body: 'Buy the maintainers a coffee — one-off or monthly.',
  },
]

function initialTab(): TabId {
  const h = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
  return (TAB_IDS.has(h) ? h : 'agent') as TabId
}

function CopyIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function Home() {
  const [tab, setTab] = useState<TabId>(initialTab)
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)

  const selectTab = (id: TabId) => {
    setTab(id)
    if (typeof window !== 'undefined') window.location.hash = id
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(SOURCES[tab])
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">The rich text editor toolkit for React</div>
        <h1 className="hero-title">
          Build <em>AI-native</em> editors <em>faster</em> 🚀
          <br />with production-ready <em>tools</em>
        </h1>
        <p className="hero-sub">
          A headless, extensible, framework-agnostic editor core with React bindings.
          Ship agent editors, docx editors, Notion-like editors, and simple editors —
          all from one MIT-licensed toolkit.
        </p>
        <div className="hero-actions">
          <a href="#examples" className="btn-primary">Explore examples</a>
          <Link to="/docs/installation" className="btn-secondary">Read the docs</Link>
          <code className="hero-install">npm i @rich-editor/starter-kit</code>
        </div>

        <div className="hero-metrics">
          {METRICS.map((m) => (
            <div className="metric" key={m.label}>
              <span className="metric-value">{m.value}</span>
              <span className="metric-label">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="examples" className="examples">
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
                onClick={copyCode}
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
            </div>
          )}
        </div>

        <p className="stage-caption">
          Every example above is a live editor built with the same{' '}
          <code>@rich-editor</code> packages. Switch tabs to see how far one core
          stretches. Want the write-up and code for each? See the{' '}
          <Link to="/docs/usecases/agent-workflows">usecase docs</Link>.
        </p>
      </section>

      <section id="features" className="features">
        <h2 className="section-title">
          Everything you need to build <em>real</em> editors
        </h2>
        <p className="section-sub">
          One core, a grid of composable packages. Add only what you ship.
        </p>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-top">
                <span className="feature-icon">{f.icon}</span>
                {f.badge && <span className="feature-badge">{f.badge}</span>}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-body">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="templates" className="templates">
        <h2 className="section-title">
          Launch faster with <em>ready-made templates</em>
        </h2>
        <p className="section-sub">Open a template, then jump straight to its live demo.</p>
        <div className="template-grid">
          {TEMPLATES.map((t) => (
            <button
              className="template-card"
              key={t.title}
              onClick={() => {
                selectTab(t.tab)
                document
                  .getElementById('examples')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <div className="template-preview" aria-hidden />
              <div className="template-meta">
                <span className="template-name">{t.title}</span>
                <span className="template-tag">{t.tag}</span>
              </div>
              <p className="template-body">{t.body}</p>
            </button>
          ))}
        </div>
      </section>

      <section id="support" className="support">
        <h2 className="section-title">
          Support the <em>project</em>
        </h2>
        <p className="section-sub">
          Rich Editor is free and MIT-licensed. Sponsorship funds maintenance and new
          extensions.
        </p>
        <div className="support-grid">
          {SUPPORT_LINKS.map((s) => (
            <a
              className="support-card"
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className="support-name">{s.label}</span>
              <p className="support-body">{s.body}</p>
            </a>
          ))}
        </div>
      </section>
    </>
  )
}
