import { CATEGORY_ORDER, EXTENSIONS } from '../../data/extensions'

export function ExtensionsReference() {
  return (
    <div className="docs-prose">
      <h1>Extensions reference</h1>
      <p>
        Every <code>@richkitjs/*</code> package, grouped by category. Install only what you need —{' '}
        <code>starter-kit</code> bundles the common ones. Each name links to its page on{' '}
        <a href="https://www.npmjs.com/org/richkitjs" target="_blank" rel="noreferrer">
          npm
        </a>
        .
      </p>

      {CATEGORY_ORDER.map((category) => {
        const rows = EXTENSIONS.filter((e) => e.category === category)
        if (rows.length === 0) return null
        return (
          <section key={category}>
            <h2>{category}</h2>
            <table className="ext-table">
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr id={`pkg-${r.pkg}`} key={r.pkg}>
                    <td>
                      <a
                        className="pkg-npm-link"
                        href={`https://www.npmjs.com/package/@richkitjs/${r.pkg}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <code>@richkitjs/{r.pkg}</code>
                      </a>
                    </td>
                    <td>{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )
      })}
    </div>
  )
}
