import { NotificationsHost } from '@richkitjs/react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

// Always ends in a slash, so `${HOME}#features` is a valid absolute URL under
// any deploy base. A bare "/#features" would jump to the domain root instead.
const HOME = import.meta.env.BASE_URL

import { LogoMark } from '../components/LogoMark'
import { ScrollManager } from '../components/ScrollManager'
import { GitHubIcon, Icon, type IconName } from '../components/SiteIcons'

const GITHUB = 'https://github.com/faithdevss/richkit'
const SPONSOR = 'https://github.com/sponsors/faithdevss'

const NAV: { label: string; to: string; icon: IconName }[] = [
  { label: 'Platform', to: `${HOME}#platform`, icon: 'platform' },
  { label: 'Templates', to: '/templates', icon: 'book' },
  { label: 'Compare', to: '/docs/comparison', icon: 'compare' },
  { label: 'Docs', to: '/docs', icon: 'docs' },
  { label: 'Support', to: SPONSOR, icon: 'plus' },
]

const FOOT_COLS: { head: string; links: { label: string; to: string }[] }[] = [
  {
    head: 'Product',
    links: [
      { label: 'Editor', to: '/docs/core-concepts' },
      { label: 'Extensions', to: '/docs/extensions' },
      { label: 'Docx', to: '/docs/extensions#pkg-docx' },
      { label: 'Markdown', to: '/docs/extensions#pkg-markdown' },
    ],
  },
  {
    head: 'Examples',
    links: [
      { label: 'Agent', to: '/docs/usecases/agent-workflows' },
      { label: 'Docx', to: '/docs/usecases/docx-editing' },
      { label: 'Notion-like', to: '/docs/usecases/notion-blocks' },
      { label: 'Simple', to: '/docs/usecases/simple-editor' },
      { label: 'Classic', to: '/docs/usecases/classic-editor' },
    ],
  },
  {
    head: 'Resources',
    links: [
      { label: 'Introduction', to: '/docs/introduction' },
      { label: 'Installation', to: '/docs/installation' },
      { label: 'Core concepts', to: '/docs/core-concepts' },
      { label: 'Styling', to: '/docs/styling' },
      { label: 'Comparison', to: '/docs/comparison' },
    ],
  },
  {
    head: 'Packages',
    links: [
      { label: 'core', to: '/docs/extensions#pkg-core' },
      { label: 'react', to: '/docs/extensions#pkg-react' },
      { label: 'starter-kit', to: '/docs/extensions#pkg-starter-kit' },
      { label: 'docx', to: '/docs/extensions#pkg-docx' },
    ],
  },
  {
    head: 'Community',
    links: [
      { label: 'GitHub', to: GITHUB },
      { label: 'npm', to: 'https://www.npmjs.com/org/richkitjs' },
      { label: 'Releases', to: `${GITHUB}/releases` },
      { label: 'Issues', to: `${GITHUB}/issues` },
    ],
  },
]

function FootLink({ to, label }: { to: string; label: string }) {
  if (to.startsWith('http')) {
    return (
      <a href={to} target="_blank" rel="noreferrer">
        {label}
      </a>
    )
  }
  return <Link to={to}>{label}</Link>
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  )
}

function Brand() {
  return (
    <>
      <span className="site-logo">
        <LogoMark />
      </span>
      RichKit
    </>
  )
}

export function SiteShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname, hash } = useLocation()

  // the drawer covers the page, so any navigation out of it has to close it --
  // including a hash link back to a section of the page already open
  useEffect(() => setMenuOpen(false), [pathname, hash])

  return (
    <div className="site">
      <ScrollManager />
      <div className="site-inner">
        <header className="site-nav">
          <div className="site-nav-inner">
            <Link to="/" className="site-brand">
              <Brand />
            </Link>
            <nav className={`site-links${menuOpen ? ' is-open' : ''}`}>
              {NAV.map((item) =>
                item.to.startsWith('http') || item.to.includes('#') ? (
                  <a
                    key={item.label}
                    href={item.to}
                    {...(item.to.startsWith('http')
                      ? { target: '_blank', rel: 'noreferrer' }
                      : null)}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={({ isActive }) => (isActive ? 'is-active' : undefined)}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </NavLink>
                ),
              )}
            </nav>
            <div className="site-nav-actions">
              <a href={GITHUB} className="site-ghost" target="_blank" rel="noreferrer">
                <GitHubIcon />
                GitHub
              </a>
              <Link to="/docs/installation" className="site-cta">
                Get started
              </Link>
              <button
                type="button"
                className="site-menu-btn"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <MenuIcon open={menuOpen} />
              </button>
            </div>
          </div>
        </header>

        <Outlet />

        <footer className="site-foot">
          <div className="foot-cols">
            <div className="foot-brand-col">
              <div className="site-brand">
                <Brand />
              </div>
              <p className="foot-tagline">The open-source rich text editor toolkit for React.</p>
            </div>
            {FOOT_COLS.map((c) => (
              <div className="foot-col" key={c.head}>
                <span className="foot-head">{c.head}</span>
                {c.links.map((l) => (
                  <FootLink key={l.label} to={l.to} label={l.label} />
                ))}
              </div>
            ))}
          </div>
          <div className="foot-base">
            Built with <code>@richkitjs/core</code> · <code>@richkitjs/react</code> ·{' '}
            <code>@richkitjs/starter-kit</code> · MIT licensed
          </div>
        </footer>
      </div>

      <NotificationsHost />
    </div>
  )
}
