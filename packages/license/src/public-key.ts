// The public half of the RichKit Pro signing key. Generate the pair once with
// `pnpm license:keygen` and paste the printed JWK here. The private half never
// enters the repository.
//
// While this is null every key is rejected as `unconfigured`, so a build can
// never ship silently accepting keys nobody can mint.
export const PUBLIC_KEY: JsonWebKey | null = {
  kty: 'EC',
  crv: 'P-256',
  x: 'QQ16fWwq-jjiHAyJVU5DhDERwnwhGnXw3dqETkKKapw',
  y: 'zHnbDee4VG8uSe_htI8OJAhBtItypCCx9Bj_v78Y3IU',
}
