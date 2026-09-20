// Append-only record of every key this server has minted. One JSON object per
// line, loaded into memory at boot. At a few orders a day this outlives any
// database we would otherwise have to run, and the file is the backup: copy it
// and every issued key is recoverable without re-minting.
import { appendFileSync, existsSync, readFileSync } from 'node:fs'

export function openStore(path) {
  /** licenceId -> latest record */
  const byId = new Map()
  /** lowercased email -> licenceIds, newest last */
  const byEmail = new Map()

  function index(record) {
    byId.set(record.licenseId, record)
    const email = record.email.toLowerCase()
    const ids = byEmail.get(email) ?? []
    if (!ids.includes(record.licenseId)) ids.push(record.licenseId)
    byEmail.set(email, ids)
  }

  if (existsSync(path)) {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      if (!line.trim()) continue
      try {
        index(JSON.parse(line))
      } catch {
        // A truncated last line (killed mid-write) must not stop the service.
        console.warn('[store] skipping unreadable line')
      }
    }
  }

  return {
    get: (licenseId) => byId.get(licenseId),
    forEmail: (email) => (byEmail.get(email.toLowerCase()) ?? []).map((id) => byId.get(id)),
    size: () => byId.size,
    /** Record a mint. Written before the email is sent, so a mail failure never loses a key. */
    put(record) {
      const row = { ...record, recordedAt: new Date().toISOString() }
      appendFileSync(path, JSON.stringify(row) + '\n', { mode: 0o600 })
      index(row)
      return row
    },
  }
}
