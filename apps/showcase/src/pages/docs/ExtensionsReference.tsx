import { CATEGORY_ORDER, EXTENSIONS } from '../../data/extensions'

export function ExtensionsReference() {
  return (
    <div className="docs-prose">
      <h1>Extensions reference</h1>
      <p>
        Every <code>@richkit/*</code> package, grouped by category. Install only what
        you need — <code>starter-kit</code> bundles the common ones.
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
                      <code>@richkit/{r.pkg}</code>
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
