import { signLicensePayload, type LicensePayload } from '../key'

export async function makeKeyPair() {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
    'sign',
    'verify',
  ])
  const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey)
  return { privateKey: pair.privateKey, publicJwk }
}

export const payload: LicensePayload = {
  v: 1,
  id: 'ord_1',
  company: 'Acme Ltd',
  email: 'dev@acme.test',
  plan: 'business',
  issued: '2026-09-19',
  updatesUntil: '2027-09-19',
}

export { signLicensePayload }
