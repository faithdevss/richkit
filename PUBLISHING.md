# Publishing

How the 46 `@richkitjs/*` packages get to npm.

Releases are automated. You never run `npm publish` by hand — you write a changeset, and
merging two PRs does the rest. The only manual work is the one-time npm account setup in
[First-time setup](#first-time-setup).

## How it works

Two GitHub Actions workflows, both on push to `main`:

- **`.github/workflows/ci.yml`** — typecheck, lint, build, test. Also runs on pull requests.
- **`.github/workflows/release.yml`** — the same four checks, then hands off to
  `changesets/action`.

`changesets/action` does one of two things depending on whether unreleased changesets exist
in `.changeset/`:

| State of `.changeset/` | What the workflow does                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| Has `*.md` changesets  | Opens (or updates) a PR titled **chore(release): version packages**. Nothing is published.                   |
| Empty                  | Runs `pnpm release` → builds, then `changeset publish` pushes every package whose version is not yet on npm. |

So a release is always two merges: your feature PR carrying a changeset, then the version PR
the bot raises. That second merge empties `.changeset/`, which is what triggers the actual
publish on the following run.

```
feature PR (with changeset)
        │  merge
        ▼
  main ──► release.yml ──► opens "chore(release): version packages" PR
                                    │  merge
                                    ▼
                          main ──► release.yml ──► changeset publish → npm
```

## First-time setup

These are account-level and only need doing once. **Until all three are done, the publish step
fails** — though the version PR still opens fine, so you can do this at any point before
merging it.

### 1. Create the `@richkitjs` npm organization

All packages are scoped, so the scope must exist and you must own it.

1. Go to <https://www.npmjs.com/org/create>.
2. Name it `richkitjs`, pick the **Free** plan — free orgs can publish unlimited _public_
   packages, which is all this repo needs.

The plain `richkit` name was unavailable. npm org names share a namespace with usernames, so
an account holding the name blocks the org even when no package by that name exists.

`.changeset/config.json` already sets `"access": "public"`, so scoped packages publish
publicly rather than being rejected as private.

Verify:

```bash
npm org ls richkitjs
```

### 2. Create an npm token and add it to the repo

1. npmjs.com → your avatar → **Access Tokens** → **Generate New Token** → **Granular Access
   Token**.
2. Configure it:
   - **Expiration** — set a calendar reminder; an expired token fails the release with `ENEEDAUTH`.
   - **Packages and scopes** — `Read and write`, applied to the `@richkitjs` scope.
   - **Organizations** — `Read and write` on `richkitjs`, so the token can create packages that
     do not exist yet. Without this, the _first_ publish of each package 404s.
3. Copy the token — npm shows it once.
4. In GitHub: repo → **Settings** → **Secrets and variables** → **Actions** → **New
   repository secret**, named exactly `NPM_TOKEN`.

The workflow feeds that secret to both `NPM_TOKEN` and `NODE_AUTH_TOKEN`, because
`actions/setup-node` writes the `.npmrc` that `pnpm publish` reads from `NODE_AUTH_TOKEN`.

### 3. Check the account's 2FA mode

npmjs.com → **Account** → **Two-Factor Authentication**.

If it is set to **Authorization and writes**, every publish demands an OTP that CI cannot
supply, and the release dies with `EOTP`. Either:

- set it to **Authorization only** — 2FA still guards logins and settings, just not writes; or
- keep the stricter mode and rely on the granular token, which is exempt from the OTP prompt.

Granular tokens are the better answer: revocable, scope-limited, and they leave login 2FA
fully intact.

## Releasing

### 1. Write a changeset with your change

Every PR that touches something publishable needs one:

```bash
pnpm changeset
```

It asks which packages changed and at what bump level, then writes a markdown file into
`.changeset/`. Commit that file with your code.

Choosing a bump, while the project is pre-1.0:

| Bump    | Use for                                   | 0.1.0 becomes |
| ------- | ----------------------------------------- | ------------- |
| `patch` | Bug fixes, docs, internal refactors       | 0.1.1         |
| `minor` | New features **and** breaking changes     | 0.2.0         |
| `major` | Nothing yet — save it for the 1.0 release | 1.0.0         |

Under semver, `0.x` minors are allowed to break. Bumping to `1.0.0` is a deliberate promise of
API stability, so it should be a decision, not a side effect of a changeset.

You only list the packages you actually changed. Changesets bumps dependents automatically —
`updateInternalDependencies: "patch"` in the config means a package gets a patch bump when one
of its workspace dependencies moves.

Skip the changeset entirely for changes that ship nothing: CI config, tests, the playground and
showcase apps, or repo docs like this file.

### 2. Merge your PR

CI runs. Then Release runs, sees your changeset, and opens or updates the **chore(release):
version packages** PR.

### 3. Review the version PR

The bot's PR is generated, but read it before merging — it is the last checkpoint before npm,
and npm publishes are permanent.

- **Version bumps** are correct across every affected `package.json`.
- **CHANGELOG.md** entries read like release notes, not internal chatter. Edit them directly in
  the PR if they don't; the bot preserves manual edits.
- **No package is left behind.** Anything still on `0.0.0` that others depend on with
  `workspace:*` will break consumers — see [Never leave a workspace dependency
  unreleased](#never-leave-a-workspace-dependency-unreleased).

### 4. Merge the version PR

Release runs again, finds `.changeset/` empty, and publishes. `changeset publish` skips any
package whose version already exists on npm, so a re-run is safe and partial failures are
recoverable by re-running the job.

### 5. Verify

```bash
npm view @richkitjs/core version
npm view @richkitjs/starter-kit dependencies    # workspace:* must be gone
```

Then install from a scratch directory outside the monorepo, so you resolve against the registry
rather than the workspace:

```bash
mkdir /tmp/richkit-smoke && cd /tmp/richkit-smoke
npm init -y
npm i @richkitjs/core @richkitjs/react @richkitjs/starter-kit
node -e "console.log(Object.keys(require('@richkitjs/core')))"
```

Changesets also pushes a git tag per package. Cutting a GitHub Release from
`@richkitjs/core@x.y.z` is optional but makes the history readable.

## Never leave a workspace dependency unreleased

The one failure mode that reaches users instead of failing loudly in CI.

Internal dependencies are declared as `"@richkitjs/core": "workspace:*"`. On publish, `pnpm
publish` rewrites that to the dependency's real version. If the dependency was never released,
that rewrite produces a version nobody can install:

```jsonc
// what ships if @richkitjs/extension-ai has no changeset
"dependencies": {
  "@richkitjs/extension-ai": "0.0.0"   // 404 for every consumer
}
```

`@richkitjs/react` alone depends on eight workspace packages this way. Publishing it while any
one of them is unreleased breaks `npm i @richkitjs/react` outright.

Before merging the version PR:

```bash
pnpm changeset status
```

Cross-check that against the workspace. Anything listed here is unreleased and must not be
depended on by a package that is shipping:

```bash
# publishable packages still sitting at 0.0.0
for f in packages/*/package.json; do
  node -e "const p=require('./$f'); if(p.version==='0.0.0'&&!p.private) console.log(p.name)"
done
```

The fix is always the same: add a changeset covering the missing package and push it to the
version PR's branch.

## Adding a new package

A new `packages/<name>/` needs all of this before its first release:

- `package.json` with `name` (`@richkitjs/*`), `description`, `license`, `files: ["dist"]`,
  `main` / `module` / `types` / `exports`, `repository.directory`, `homepage`, `bugs`,
  `sideEffects`, and `keywords`. Copy `packages/core/package.json` as the template.
- `README.md` and `LICENSE` — npm always includes both regardless of `files`, and a package
  page with no README looks abandoned.
- A `build` script producing `dist/` with ESM, CJS, and `.d.ts` — inherit `tsup.config.base.ts`.
- **A changeset.** New packages are the easiest thing to forget, and see the section above for
  why that is expensive.

Anything not meant for npm — apps, test harnesses — needs `"private": true`. That is what keeps
`apps/playground`, `apps/showcase`, `tests/e2e`, and `tests/integration` off the registry.

Sanity-check what a package will actually ship:

```bash
cd packages/<name> && npm pack --dry-run
```

Expect `LICENSE`, `README.md`, `package.json`, and `dist/`. Source files or `node_modules` in
that listing mean `files` is wrong.

## Prereleases

To ship `0.2.0-next.0` style versions off `main`:

```bash
pnpm changeset pre enter next   # commit the resulting .changeset/pre.json
# ... merge PRs with changesets as usual; each version PR now produces -next.N
pnpm changeset pre exit         # commit, then the next version PR is the stable release
```

While in pre mode, published packages get the `next` dist-tag instead of `latest`, so
`npm i @richkitjs/core` still resolves to the last stable release.

## Troubleshooting

| Symptom                                     | Cause                                                                         | Fix                                                      |
| ------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------- |
| `404 Not Found - PUT .../@richkitjs%2fcore` | Scope does not exist, or the token lacks org write access                     | [Setup steps 1 and 2](#first-time-setup)                 |
| `ENEEDAUTH`                                 | `NPM_TOKEN` secret missing, misnamed, or expired                              | Re-issue the token, re-add the secret                    |
| `EOTP`                                      | Account 2FA requires an OTP on writes                                         | [Setup step 3](#3-check-the-accounts-2fa-mode)           |
| `E402 Payment Required`                     | npm treats the scoped package as private                                      | Confirm `"access": "public"` in `.changeset/config.json` |
| `E403 Forbidden`                            | Version already published, or name owned by someone else                      | Versions are immutable — bump and republish              |
| Version PR never opens                      | No changesets, or `.changeset/*.md` was not committed                         | `pnpm changeset status`                                  |
| Version PR opens but nothing publishes      | Expected — the publish is the _next_ run, after that PR merges                | Merge it                                                 |
| Publish stopped partway                     | A package failed mid-run                                                      | Re-run the job; already-published versions are skipped   |
| A flaky e2e spec failed the release         | `turbo run test` gates publishing, and Playwright has no `retries` configured | Re-run the job                                           |

Nothing was published if the workflow failed before `changeset publish`. If it failed _during_,
some packages are live and some are not — re-running finishes the rest, since publish is
idempotent per version.

## Undoing a bad release

You cannot overwrite a published version. The options, worst to best:

- **`npm unpublish`** — only allowed within 72 hours, and only if nothing depends on it.
  Disruptive; it breaks anyone who already installed it.
- **`npm deprecate @richkitjs/core@x.y.z "message"`** — leaves the version installable but warns
  on install. This is usually the right call.
- **Publish a fix.** The cheapest option almost every time.

```bash
npm deprecate @richkitjs/core@0.1.0 "Broken dependency range, use 0.1.1"
```

## Emergency manual publish

Only when Actions itself is down. Prefer fixing the workflow.

```bash
npm login                       # an account with @richkitjs write access
git checkout main && git pull

pnpm install --frozen-lockfile
pnpm turbo run typecheck lint build test    # do not skip

pnpm changeset version          # bumps versions, writes changelogs
pnpm release                    # build + changeset publish

git add -A
git commit -m "chore(release): version packages"
git push --follow-tags
```

Push the version commit and tags. Skipping that leaves the repo claiming versions that are
already on npm, and the next automated release will collide with them.
