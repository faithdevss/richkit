// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { decodeLicenseKey, verifyLicenseKey } from '../key'
import { makeKeyPair, payload, signLicensePayload } from './helpers'

describe('verifyLicenseKey', () => {
  it('accepts a correctly signed key', async () => {
    const { privateKey, publicJwk } = await makeKeyPair()
    const key = await signLicensePayload(payload, privateKey)
    const result = await verifyLicenseKey(key, publicJwk, '2027-01-01')
    expect(result).toEqual({ valid: true, payload })
  })

  it('reports a missing key', async () => {
    const { publicJwk } = await makeKeyPair()
    expect(await verifyLicenseKey('', publicJwk)).toEqual({ valid: false, reason: 'missing' })
    expect(await verifyLicenseKey(null, publicJwk)).toEqual({ valid: false, reason: 'missing' })
  })

  it('rejects every key while no public key is embedded', async () => {
    const { privateKey } = await makeKeyPair()
    const key = await signLicensePayload(payload, privateKey)
    expect(await verifyLicenseKey(key, null)).toEqual({ valid: false, reason: 'unconfigured' })
  })

  it('rejects garbage', async () => {
    const { publicJwk } = await makeKeyPair()
    for (const key of ['nope', 'a.b', 'a.b.c', '!!!.???']) {
      expect(await verifyLicenseKey(key, publicJwk)).toMatchObject({ reason: 'malformed' })
    }
  })

  it('rejects a tampered payload', async () => {
    const { privateKey, publicJwk } = await makeKeyPair()
    const key = await signLicensePayload(payload, privateKey)
    const forged = await signLicensePayload({ ...payload, updatesUntil: null }, privateKey)
    const tampered = `${forged.split('.')[0]}.${key.split('.')[1]}`
    expect(await verifyLicenseKey(tampered, publicJwk)).toMatchObject({
      valid: false,
      reason: 'invalid-signature',
    })
  })

  it('rejects a key signed by someone else', async () => {
    const ours = await makeKeyPair()
    const theirs = await makeKeyPair()
    const key = await signLicensePayload(payload, theirs.privateKey)
    expect(await verifyLicenseKey(key, ours.publicJwk)).toMatchObject({
      reason: 'invalid-signature',
    })
  })

  it('covers releases up to updatesUntil, and not after', async () => {
    const { privateKey, publicJwk } = await makeKeyPair()
    const key = await signLicensePayload(payload, privateKey)
    expect(await verifyLicenseKey(key, publicJwk, '2027-09-19')).toMatchObject({ valid: true })
    expect(await verifyLicenseKey(key, publicJwk, '2027-09-20')).toMatchObject({
      valid: false,
      reason: 'expired',
    })
    // Unknown release date (running from source) is treated as covered.
    expect(await verifyLicenseKey(key, publicJwk)).toMatchObject({ valid: true })
  })

  it('treats a null updatesUntil as covering every release', async () => {
    const { privateKey, publicJwk } = await makeKeyPair()
    const key = await signLicensePayload({ ...payload, updatesUntil: null }, privateKey)
    expect(await verifyLicenseKey(key, publicJwk, '2099-01-01')).toMatchObject({ valid: true })
  })

  it('restricts a domain-bound key to its hosts', async () => {
    const { privateKey, publicJwk } = await makeKeyPair()
    const key = await signLicensePayload(
      { ...payload, domains: ['acme.com', '*.acme.io'] },
      privateKey,
    )
    for (const host of ['acme.com', 'app.acme.io', 'a.b.acme.io']) {
      expect(await verifyLicenseKey(key, publicJwk, undefined, host)).toMatchObject({ valid: true })
    }
    for (const host of ['evil.com', 'acme.com.evil.com', 'acme.io', 'notacme.io']) {
      expect(await verifyLicenseKey(key, publicJwk, undefined, host)).toMatchObject({
        reason: 'wrong-domain',
      })
    }
  })

  it('decodes the payload for display', async () => {
    const { privateKey } = await makeKeyPair()
    const key = await signLicensePayload(payload, privateKey)
    expect(decodeLicenseKey(key)).toEqual(payload)
  })
})
