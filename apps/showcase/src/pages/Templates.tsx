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
      <div className="template-grid" style={{ paddingBottom: 24 }}>
        {TEMPLATES.map((t) => (
          <TemplateCard key={t.title} template={t} />
        ))}
      </div>
    </section>
  )
}
