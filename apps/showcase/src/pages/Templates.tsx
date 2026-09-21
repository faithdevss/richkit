import { Link } from 'react-router-dom'
import { TemplateCard } from '../components/TemplateCard'
import { TEMPLATES } from '../data/templates'

export function Templates() {
  return (
    <section className="shell page-head">
      <div className="page-eyebrow">Templates</div>
      <h1 className="page-title">Templates, source included</h1>
      <p className="page-lede">
        Every review surface, menu and panel RichKit ships — previewed close to how it renders.
        Source for each lives under <code>apps/showcase/src</code>, and the five full editors run
        live on the <Link to="/#examples">landing page demo</Link>.
      </p>
      <p className="page-lede">
        Comments, DOCX, the agent editor and track changes are{' '}
        <Link to="/docs/licensing">RichKit Pro</Link>. On a production host they want a licence key:
        pass <code>licenseKey</code> to the editor — or to <code>Comment.configure()</code>,{' '}
        <code>trackChangesKit()</code> and the DOCX helpers — or call <code>setLicenseKey</code>{' '}
        once at startup. This site does the first: every demo below carries the prop.
      </p>
      <div className="template-grid" style={{ paddingBottom: 24 }}>
        {TEMPLATES.map((t) => (
          <TemplateCard key={t.title} template={t} />
        ))}
      </div>
    </section>
  )
}
