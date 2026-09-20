import { homedir } from 'node:os'
import { join } from 'node:path'

export function privateKeyPath() {
  return (
    process.env.RICHKIT_LICENSE_PRIVATE_KEY ?? join(homedir(), '.richkit', 'license-private.jwk')
  )
}
