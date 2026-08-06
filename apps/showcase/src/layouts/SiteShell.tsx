import { NotificationsHost } from '@richkit/react'
import { Link, NavLink, Outlet } from 'react-router-dom'

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
    ],
  },
  {
    head: 'Resources',
    links: [
      { label: 'Introduction', to: '/docs/introduction' },
      { label: 'Installation', to: '/docs/installation' },
      { label: 'Core concepts', to: '/docs/core-concepts' },
      { label: 'Styling', to: '/docs/styling' },
      { label: 'Extensions', to: '/docs/extensions' },
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
]

export function SiteShell() {
  return (
    <div className="site">
      <div className="site-inner">
        <header className="site-nav">
          <Link to="/" className="site-brand">
            <span className="site-logo">▤</span> RichKit
          </Link>
          <nav className="site-links">
            <a href="/#features">Platform</a>
            <a href="/#examples">Examples</a>
            <NavLink to="/docs" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
              Docs
            </NavLink>
            <a href="/#support">Support</a>
          </nav>
          <div className="site-nav-actions">
            <a href="https://github.com/sponsors/faithdevss" className="site-ghost" target="_blank" rel="noreferrer">
              Sponsor
            </a>
            <Link to="/docs/installation" className="site-cta">
              Get started
            </Link>
          </div>
        </header>

        <Outlet />

        <footer className="site-foot">
          <div className="foot-cols">
            <div className="foot-brand-col">
              <div className="site-brand">
                <span className="site-logo">▤</span> RichKit
              </div>
              <p className="foot-tagline">
                The open-source rich text editor toolkit for React.
              </p>
            </div>
            {FOOT_COLS.map((c) => (
              <div className="foot-col" key={c.head}>
                <span className="foot-head">{c.head}</span>
                {c.links.map((l) =>
                  l.to.startsWith('/docs') ? (
                    <Link to={l.to} key={l.label}>
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.to} key={l.label}>
                      {l.label}
                    </a>
                  ),
                )}
              </div>
            ))}
          </div>
          <div className="foot-base">
            Built with <code>@richkit/core</code> · <code>@richkit/react</code> ·{' '}
            <code>@richkit/starter-kit</code> · MIT licensed
          </div>
        </footer>
      </div>

      <NotificationsHost />
    </div>
  )
}
