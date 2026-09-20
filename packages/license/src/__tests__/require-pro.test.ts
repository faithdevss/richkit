// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://app.example.com/"}
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { makeKeyPair, payload, signLicensePayload } from './helpers'

const keys = await makeKeyPair()
vi.mock('../public-key', () => ({ PUBLIC_KEY: keys.publicJwk }))

const { __resetLicenseForTests, isDevelopmentHost, requirePro, setLicenseKey } =
  await import('../index')

const badge = () => document.getElementById('richkit-pro-unlicensed')
const settle = () => new Promise((r) => setTimeout(r, 20))

describe('requirePro', () => {
  beforeAll(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => __resetLicenseForTests())

  it('shows one badge and one warning on production hosts without a key', async () => {
    requirePro('docx')
    requirePro('track-changes')
    await settle()
    expect(document.querySelectorAll('#richkit-pro-unlicensed')).toHaveLength(1)
    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('shows nothing with a valid key', async () => {
    setLicenseKey(await signLicensePayload(payload, keys.privateKey))
    requirePro('docx')
    await settle()
    expect(badge()).toBeNull()
  })

  it('removes the badge when a valid key arrives later', async () => {
    requirePro('docx')
    await settle()
    expect(badge()).not.toBeNull()
    setLicenseKey(await signLicensePayload(payload, keys.privateKey))
    await settle()
    expect(badge()).toBeNull()
  })

  it('shows the badge for a forged key', async () => {
    const other = await makeKeyPair()
    setLicenseKey(await signLicensePayload(payload, other.privateKey))
    requirePro('docx')
    await settle()
    expect(badge()).not.toBeNull()
  })
})

describe('isDevelopmentHost', () => {
  it.each([
    ['localhost', 'http:'],
    ['127.0.0.1', 'http:'],
    ['[::1]', 'http:'],
    ['myapp.local', 'http:'],
    ['site.test', 'https:'],
    ['app.localhost', 'http:'],
    ['', 'file:'],
  ])('%s over %s is development', (hostname, protocol) => {
    expect(isDevelopmentHost({ hostname, protocol })).toBe(true)
  })

  it.each(['example.com', '192.168.1.10', 'staging.acme.io'])('%s is production', (hostname) => {
    expect(isDevelopmentHost({ hostname, protocol: 'https:' })).toBe(false)
  })
})
