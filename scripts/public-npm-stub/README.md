# public-npm-stub

A deliberate error package published to **public npmjs.com** under the
`@studio-manfred` scope. The real design system lives on GitHub
Packages — this stub exists only to give a loud, link-rich error when a
consumer forgets to configure `.npmrc` and falls through to the default
public registry.

How it works:

- A correctly configured consumer has a scoped route in their `.npmrc`
  (`@studio-manfred:registry=https://npm.pkg.github.com`). npm uses
  that, fetches the real v0.8.x+ from GitHub Packages, and this stub is
  never touched.
- A misconfigured consumer has no scope route. npm falls back to the
  default registry (npmjs.com), finds this stub, runs its `preinstall`,
  prints a link to `docs/CONSUMING.md`, and exits 1.

## One-time publish

Prerequisites: the `@studio-manfred` scope must be registered on
npmjs.com and 2FA enabled on the maintainer account.

```
cd scripts/public-npm-stub
npm publish --access public
```

Republish only if the redirect message changes. Bump `version` in
`package.json` (e.g. `0.0.1` → `0.0.2`) — npm does not allow
overwriting a published version.

## Do NOT

- Do not publish this stub to GitHub Packages (the real library lives
  there).
- Do not add dependencies or code beyond `error.js`.
- Do not change the `name` field — it must match the real package name
  so the scope route interception works.
