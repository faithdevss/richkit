// Prints the licensing notice once per install, from @richkitjs/core only —
// every other @richkitjs package depends on core, so one notice covers all 53
// without spamming the install log.
//
// This must never fail an install. Everything is wrapped, and the process
// always exits 0.

try {
  // A published tarball ships `dist` but not `src`, so the presence of `src`
  // means this is the source checkout — no notice during our own development.
  const { existsSync } = require('node:fs')
  const { join } = require('node:path')

  const isSourceCheckout = existsSync(join(__dirname, '..', 'src'))
  const isQuiet =
    process.env.CI === 'true' ||
    process.env.RICHKIT_SILENT === '1' ||
    process.env.npm_config_loglevel === 'silent'

  if (!isSourceCheckout && !isQuiet) {
    console.log(
      [
        '',
        '  RichKit is free for noncommercial use under the PolyForm',
        '  Noncommercial License 1.0.0 — hobby projects, learning, research,',
        '  education, and charities.',
        '',
        '  Commercial and business use requires a paid license, after a free',
        '  90-day evaluation period. See LICENSE-COMMERCIAL, or:',
        '',
        '  https://faithdevss.github.io/richkit/pricing',
        '',
      ].join('\n')
    )
  }
} catch {
  // Never let the notice break an install.
}
