/**
 * The hero panel: a still of the agent editor, drawn in markup rather than
 * mounted live. It sits above the fold on every page load, so it stays cheap —
 * the real editors start one section down, under the tab bar.
 */
export function HeroPreview() {
  return (
    <div className="frame">
      <div className="frame-bar">
        <div className="frame-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="frame-tools">
        <span className="t is-mark">B</span>
        <span className="t is-mark" style={{ fontStyle: 'italic' }}>
          I
        </span>
        <span className="t is-mark" style={{ textDecoration: 'underline' }}>
          U
        </span>
        <span className="sep" />
        <span className="t">H1</span>
        <span className="t">H2</span>
        <span className="t">List</span>
        <span className="t">Quote</span>
        <span className="accent">✦ Ask AI</span>
      </div>
      <div className="mock-doc">
        <h3>Specific Aims</h3>
        <p>
          Age-related cognitive decline affects a growing share of the population. This proposal
          tests whether a combined program of aerobic exercise, cognitive training and dietary
          intervention produces measurable gains in neural plasticity relative to single-domain
          controls.
        </p>
        <p className="aim">
          <strong>Aim 1.</strong> Quantify changes in hippocampal volume across intervention arms.
        </p>
        <p>
          <strong>Aim 2.</strong> Measure executive-function improvements using{' '}
          <span className="hl">
            standardized batteries administered at baseline, month 12 and month 24
          </span>
          <span className="caret" />
        </p>
        <div className="mock-suggest">
          <span>✦ Suggested edit</span>
          <span className="acts">
            <span className="accept">Accept</span>
            <span className="reject">Reject</span>
          </span>
        </div>
      </div>
    </div>
  )
}
