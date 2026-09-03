import type { CSSProperties, ReactNode } from 'react'

export type TemplateVariant = 'comments' | 'slash' | 'docx' | 'agent' | 'track' | 'find'

export type Template = {
  variant: TemplateVariant
  title: string
  body: string
  pkg: string
  tag?: string
  status?: string
}

/**
 * Wireframes, not screenshots — they stay sharp at any density, follow the
 * theme, and can't drift out of date the way a captured image would.
 */
const ART: Record<TemplateVariant, () => ReactNode> = {
  comments: CommentsArt,
  slash: SlashArt,
  docx: DocxArt,
  agent: AgentArt,
  track: TrackArt,
  find: FindArt,
}

function Line({ w, tone }: { w: string; tone?: 'faint' | 'accent' }) {
  return <span className={`wf-line${tone ? ` is-${tone}` : ''}`} style={{ width: w }} />
}

export function TemplateCard({ template }: { template: Template }) {
  const { variant, title, body, pkg, tag = 'MIT', status = 'Available on npm' } = template
  const pending = /development|roadmap|soon/i.test(status)
  const Art = ART[variant]

  return (
    <article className="tpl-card">
      <div className="tpl-art">
        <div className="tpl-art-inner">
          <Art />
        </div>
      </div>
      <div className="tpl-meta">
        <span className={`tag${tag === 'MIT' ? ' is-mit' : ''}`}>{tag}</span>
        <h3 className="tpl-title">{title}</h3>
        <p className="tpl-body">{body}</p>
        <div className="tpl-foot">
          <span className="dot" style={pending ? { background: '#8f8fa2' } : undefined} />
          <span className="status">{status}</span>
          <code>{pkg}</code>
        </div>
      </div>
    </article>
  )
}

/* ---------- art ---------- */

const PANEL_PAD: CSSProperties = { padding: 9, display: 'flex', flexDirection: 'column', gap: 8 }

function CommentsArt() {
  return (
    <div className="wf-row">
      <div className="wf-col">
        <Line w="88%" />
        <Line w="72%" />
        <Line w="80%" tone="accent" />
        <Line w="60%" />
        <Line w="40%" tone="faint" />
        <span className="wf-chip is-grad" style={{ marginTop: 6 }}>
          + Add comment
        </span>
      </div>
      <div className="wf-panel" style={{ width: 176, flex: '0 0 176px' }}>
        <div
          style={{
            padding: '8px 9px 9px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
          }}
        >
          <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#fff' }}>Comments</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <span
              style={{
                padding: '3px 7px',
                borderRadius: 6,
                background: 'rgba(124,92,255,0.22)',
                color: '#c9b8ff',
                fontSize: '0.58rem',
                fontWeight: 700,
              }}
            >
              Open
            </span>
            <span style={{ padding: '3px 7px', color: '#6f6f85', fontSize: '0.58rem' }}>
              Resolved
            </span>
            <span style={{ padding: '3px 7px', color: '#6f6f85', fontSize: '0.58rem' }}>All</span>
          </div>
        </div>
        <div style={PANEL_PAD}>
          <div
            style={{
              padding: '8px 9px',
              borderRadius: 9,
              border: '1px solid rgba(124,92,255,0.28)',
              background: 'rgba(124,92,255,0.09)',
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: '0.6rem',
                fontStyle: 'italic',
                color: '#c9b8ff',
                marginBottom: 5,
              }}
            >
              “standardized batteries”
            </span>
            <span className="wf-text" style={{ fontSize: '0.62rem' }}>
              Anchor this to the whole paragraph?
            </span>
          </div>
          <div
            style={{
              padding: '8px 9px',
              borderRadius: 9,
              border: '1px solid rgba(255,255,255,0.09)',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <span className="wf-text" style={{ fontSize: '0.62rem' }}>
              Resolved on the last pass.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SlashArt() {
  return (
    <div className="wf">
      <span
        className="wf-line"
        style={{
          width: '52%',
          height: 12,
          borderRadius: 4,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.38), rgba(255,255,255,0.14))',
        }}
      />
      <Line w="84%" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 14,
            height: 14,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.07)',
            color: '#6f6f85',
            fontSize: '0.6rem',
          }}
        >
          ⋮⋮
        </span>
        <span
          style={{ fontFamily: 'var(--site-mono)', fontSize: '0.72rem', color: 'var(--site-teal)' }}
        >
          /
        </span>
        <span
          style={{ display: 'inline-block', width: 2, height: 13, background: 'var(--site-teal)' }}
        />
      </div>
      <div className="wf-panel" style={{ marginLeft: 22, width: 208 }}>
        <div
          className="wf-cap"
          style={{ padding: '7px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          Style
        </div>
        <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <MenuRow glyph="H1" label="Heading 1" active />
          <MenuRow glyph="H2" label="Heading 2" />
          <MenuRow glyph="•" label="Bullet list" />
          <MenuRow glyph="☐" label="To-do list" />
          <div className="wf-cap" style={{ padding: '5px 8px 2px', fontSize: '0.54rem' }}>
            Insert
          </div>
          <MenuRow glyph="▦" label="Table" />
        </div>
      </div>
    </div>
  )
}

function MenuRow({ glyph, label, active }: { glyph: string; label: string; active?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 8px',
        borderRadius: 7,
        background: active ? 'rgba(124,92,255,0.16)' : undefined,
      }}
    >
      <span
        style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          color: active ? '#c9b8ff' : '#6f6f85',
        }}
      >
        {glyph}
      </span>
      <span
        style={{
          fontSize: '0.66rem',
          color: active ? '#fff' : '#a2a2b4',
          fontWeight: active ? 600 : 400,
        }}
      >
        {label}
      </span>
    </div>
  )
}

function DocxArt() {
  return (
    <div style={{ height: '100%', display: 'flex', justifyContent: 'center' }}>
      <div className="wf-sheet">
        <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
          <span style={{ width: 16, height: 5, borderRadius: 2, background: '#c9c9d2' }} />
          <span style={{ width: 10, height: 5, borderRadius: 2, background: '#dcdce2' }} />
          <span style={{ width: 10, height: 5, borderRadius: 2, background: '#dcdce2' }} />
          <span
            style={{
              marginLeft: 'auto',
              width: 24,
              height: 5,
              borderRadius: 2,
              background: '#3884ff',
            }}
          />
        </div>
        <span
          style={{
            fontSize: '0.66rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: '#12121a',
          }}
        >
          NON-DISCLOSURE AGREEMENT
        </span>
        <span className="ink" style={{ width: '100%' }} />
        <span className="ink" style={{ width: '96%' }} />
        <span className="ink" style={{ width: '62%' }} />
        <span style={{ marginTop: 5, fontSize: '0.6rem', fontWeight: 700, color: '#12121a' }}>
          1. Purpose
        </span>
        <span className="ink" style={{ width: '100%' }} />
        <span className="ink" style={{ width: '88%' }} />
        <span className="ink" style={{ width: '74%' }} />
        <span
          style={{
            marginTop: 'auto',
            paddingBottom: 8,
            fontSize: '0.55rem',
            color: '#8b8b98',
          }}
        >
          Page 1 of 4 · 1,284 words
        </span>
      </div>
    </div>
  )
}

function AgentArt() {
  return (
    <div className="wf" style={{ gap: 9 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span className="wf-chip is-accent">✦ Ask AI</span>
        <span style={{ fontSize: '0.6rem', color: '#6f6f85' }}>streaming…</span>
      </div>
      <Line w="90%" />
      <span className="wf-del">Age-related decline affects many people today.</span>
      <span className="wf-ins">
        Age-related cognitive decline affects a growing share of the population, with measurable
        onset by midlife.
      </span>
      <div className="wf-note">
        Suggested edit
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
          <span className="wf-chip is-ok">Accept</span>
          <span className="wf-chip is-ghost">Reject</span>
        </span>
      </div>
    </div>
  )
}

function TrackArt() {
  return (
    <div className="wf-row">
      <div className="wf-col" style={{ gap: 8, paddingTop: 4 }}>
        <Line w="86%" />
        <span className="wf-del" style={{ color: '#ff9d9d' }}>
          two weeks earlier than planned
        </span>
        <span
          style={{
            fontSize: '0.66rem',
            lineHeight: 1.6,
            color: '#c9b8ff',
            borderBottom: '1.5px solid #8b5cff',
            width: 'fit-content',
          }}
        >
          ahead of the forecast date
        </span>
        <Line w="70%" />
        <Line w="46%" tone="faint" />
      </div>
      <div
        className="wf-panel"
        style={{
          width: 150,
          flex: '0 0 150px',
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <span style={{ fontSize: '0.66rem', color: '#fff', fontWeight: 700 }}>Suggestions</span>
        <div style={{ display: 'flex', gap: 5 }}>
          <span className="wf-chip is-ghost">Accept all</span>
          <span className="wf-chip is-ghost">Reject all</span>
        </div>
        <ChangeRow label="+ Insertion" tone="insert" />
        <ChangeRow label="− Deletion" tone="delete" />
      </div>
    </div>
  )
}

function ChangeRow({ label, tone }: { label: string; tone: 'insert' | 'delete' }) {
  const insert = tone === 'insert'
  return (
    <div
      style={{
        padding: 8,
        borderRadius: 8,
        border: insert ? '1px solid rgba(124,92,255,0.28)' : '1px solid rgba(255,255,255,0.09)',
        background: insert ? 'rgba(124,92,255,0.09)' : 'rgba(255,255,255,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <span style={{ fontSize: '0.6rem', fontWeight: 650, color: insert ? '#c9b8ff' : '#ff9d9d' }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 5 }}>
        <span className="wf-chip is-ok" style={{ flex: 1, justifyContent: 'center' }}>
          Accept
        </span>
        <span className="wf-chip is-ghost" style={{ flex: 1, justifyContent: 'center' }}>
          Reject
        </span>
      </div>
    </div>
  )
}

function FindArt() {
  return (
    <div className="wf" style={{ gap: 9 }}>
      <div
        className="wf-panel"
        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 10px' }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6f6f85"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: '0.66rem', color: '#d9d9e4' }}>plasticity</span>
        <span
          style={{
            display: 'inline-block',
            width: 1.5,
            height: 11,
            background: 'var(--site-teal)',
          }}
        />
        <span style={{ marginLeft: 'auto', fontSize: '0.58rem', color: '#6f6f85' }}>3 of 12</span>
        <span className="wf-chip is-accent">Replace all</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '7px 10px',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.09)',
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        <span style={{ fontSize: '0.6rem', color: '#6f6f85' }}>Replace</span>
        <span style={{ fontSize: '0.64rem', color: '#a2a2b4' }}>neuroplasticity</span>
      </div>
      <span className="wf-text">
        gains in neural{' '}
        <span
          style={{
            background: 'rgba(255,190,80,0.28)',
            borderRadius: 3,
            padding: '1px 3px',
            color: '#ffd7a0',
          }}
        >
          plasticity
        </span>{' '}
        relative to single-domain controls
      </span>
      <Line w="76%" />
      <span className="wf-text">
        measures of{' '}
        <span
          style={{
            background: 'rgba(124,92,255,0.34)',
            borderRadius: 3,
            padding: '1px 3px',
            color: '#ddd3ff',
          }}
        >
          plasticity
        </span>{' '}
        at month 12
      </span>
      <Line w="52%" tone="faint" />
    </div>
  )
}
