# Consuming `@studio-manfred/manfred-design-system`

Internal guide for teammates who want to use the Manfred Design System
in a different project.

The package is published to **GitHub Packages** (not public npm) with
`access: restricted`. Only collaborators on
[`Studio-Manfred/manfred-design-system`](https://github.com/Studio-Manfred/manfred-design-system)
can install it. If you don't have access, ask the maintainer to add
you.

## One-time setup (per machine)

### 1. Accept the collaborator invite

Go to https://github.com/Studio-Manfred/manfred-design-system and accept
the invitation (check your GitHub notifications or email).

### 2. Create a classic Personal Access Token

1. Open https://github.com/settings/tokens (**classic**, not
   fine-grained — fine-grained tokens don't yet work with GitHub
   Packages for npm).
2. Click **Generate new token → Generate new token (classic)**.
3. Scope: only **`read:packages`** is required.
4. Expiration: up to you. Shorter is safer; 90 days is a reasonable
   default.
5. Copy the token (starts with `ghp_`). GitHub only shows it once.

### 3. Store the token in your shell


```bash
# in any terminal:
launchctl setenv GITHUB_TOKEN ghp_your_token_here
```

Then fully **quit** the IDE + Terminal and relaunch. The token will now be visible to the extension process.


## Per-project setup

### 4. Add `.npmrc` to the consuming project

In the root of the project that will import the design system, create
(or append to) `.npmrc`:

```
@studio-manfred:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

The `${GITHUB_TOKEN}` is expanded by npm at install time from your
shell env.

Commit this `.npmrc` to the project so teammates share the registry
routing. (Do **not** hardcode the token in the file.)

### 5. Install

```
npm install @studio-manfred/manfred-design-system
```

## Use it

Import the stylesheet once at your app entry (for example,
`src/main.tsx` or `app/layout.tsx`), then import components anywhere:

```tsx
import '@studio-manfred/manfred-design-system/styles';
import { Button, Dialog, DialogTrigger, DialogContent } from '@studio-manfred/manfred-design-system';

export function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="brand">Open</Button>
      </DialogTrigger>
      <DialogContent>…</DialogContent>
    </Dialog>
  );
}
```

The stylesheet bundles Tailwind v4 utilities, design tokens, and the
themed baseline — nothing else to wire up. Dark mode activates from
`prefers-color-scheme: dark` by default, or set `<html class="dark">`
to force it.

See the [README](../README.md) for the full list of components and
theming overview.

## CI / GitHub Actions

If your consuming project builds on GitHub Actions, the default
`GITHUB_TOKEN` has `read:packages` access to packages owned by the
same organization/account. Add the registry env to the `npm install`
step:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    registry-url: 'https://npm.pkg.github.com'
    scope: '@studio-manfred'

- run: npm ci
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

If your consuming repo lives in a **different** organization than
`Studio-Manfred`, you'll need a PAT (set as a repo secret, e.g.
`DESIGN_SYSTEM_TOKEN`) instead of the default `GITHUB_TOKEN`.

## Troubleshooting

**`npm ERR! 401 Unauthorized`** — the shell doesn't have
`GITHUB_TOKEN` set, or the token lacks `read:packages` scope, or the
token is expired. Re-check step 2 and step 3.

**`npm ERR! 404 Not Found`** — you don't have access to the package.
Confirm you accepted the collaborator invite on the source repo. The
package inherits the repo's access control.

**`npm ERR! 403 Forbidden`** — token exists but lacks
`read:packages`. Generate a new classic token with that scope.

**Stale install** — `npm uninstall @studio-manfred/manfred-design-system` then
reinstall after changing `.npmrc` or token.
