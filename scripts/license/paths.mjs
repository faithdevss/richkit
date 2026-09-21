import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// A copy at the repo root (git-ignored via *.jwk) is used when the home
// directory has none.
const REPO_KEY = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'license-private.jwk')

export function privateKeyPath() {
  if (process.env.RICHKIT_LICENSE_PRIVATE_KEY) return process.env.RICHKIT_LICENSE_PRIVATE_KEY
  const home = join(homedir(), '.richkit', 'license-private.jwk')
  return !existsSync(home) && existsSync(REPO_KEY) ? REPO_KEY : home
}
