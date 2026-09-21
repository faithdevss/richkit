/**
 * The showcase runs Pro demos on a production host, so it carries its own
 * domain-bound key. Unset (forks, local dev) is fine: localhost needs none.
 *
 * Every Pro demo passes this as the `licenseKey` prop rather than registering
 * it once in `main.tsx` — the same thing, shown the way the docs suggest it.
 */
export const LICENSE_KEY = import.meta.env.VITE_RICHKIT_LICENSE_KEY
