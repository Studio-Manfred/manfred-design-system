# STU-169 — Emit `"use client"` on dist entry (Next 16 RSC fix)

**Date:** 2026-05-25
**Linear:** [STU-169](https://linear.app/studio-manfred/issue/STU-169) (High)
**Branch:** `jens-wedin/stu-169-use-client-banner`

## Symptom

Next 16 App Router consumer hits a runtime `TypeError: createContext only works in Client Components` the moment any DS export is imported from a Server Component. The bundled `dist/index.mjs` is a single ESM module with no `"use client"` directive, and several components inside it call `React.createContext` at module load (Tabs, Tooltip, Toaster, Dialog, Select, Popover, Sheet, etc.). Next's RSC graph refuses to bundle that into a server chunk even when the consumer is only using `Button` or `Typography`.

Consumers are working around it today with a thin client-boundary re-export module (`"use client";\nexport { Button, Card, … } from "@studio-manfred/…";`). Every new DS export has to be mirrored — load-bearing duplication the DS should own instead.

## Root cause

The bundle is one chunk and ships without the React Server Components directive. The directive is the contract that tells Next/Turbopack "this module evaluates in the client environment." Without it, RSC marks the import path as server-only and any `createContext` call at module-eval time throws.

## Design

**Option 1 (chosen): banner-prepend `"use client";` to the bundle output.**

Add `output.banner: '"use client";'` to `rollupOptions` in `vite.config.ts`. Rollup emits the banner verbatim at the top of every JS chunk — both `dist/index.mjs` and `dist/index.cjs` — before any other output. Sourcemaps adjust for the offset automatically.

Trade-off accepted: every DS import contributes to the consumer's client bundle even when the import is "pure" (e.g. `Typography` is styled text with no client behaviour). This matches the industry convention for UI component libraries — shadcn/ui, MUI, Mantine all mark the whole library client-side. The savings from Option 2 (per-file boundary classification) don't justify its build-config complexity for a library where the majority of components already use Radix and need the client boundary anyway.

**Option 2 (rejected):** per-file `"use client"` boundaries, with Vite configured to preserve them in dist. Higher complexity, brittle to drift (every new component author has to remember to add the directive), and the savings are modest because most DS components already need it.

### Regression guard

Add `scripts/verify-use-client-directive.mjs`:
* Reads the first 32 bytes of `dist/index.mjs` and `dist/index.cjs`.
* Asserts each starts with `"use client";`.
* Exits non-zero with a clear message if either is missing.

Wire it into:
* `postbuild` chain in `package.json` (after `build-tokens-export.mjs`) — local builds catch regressions immediately.
* CI: add a `Build library and verify RSC banner` step to `.github/workflows/ci.yml` so the gate fires on every PR, not just at release time.

A vitest test would also work, but a small script is more direct for an output-shape assertion and doesn't muddle the unit-test suite with build concerns.

## Acceptance criteria

* [x] `dist/index.mjs` starts with `"use client";` (banner first, then ESM imports).
* [x] `dist/index.cjs` starts with `"use client";` (banner first, then existing `"use strict";` and the CJS body).
* [x] Sourcemaps remain valid (Rollup adjusts).
* [x] All existing tests pass: `npm run test`, `npm run test:storybook`, `npm run lint:play-tiers`.
* [x] Verification script catches a regression: a build with the banner removed fails the postbuild and CI steps.
* [ ] *(verified by consumer)* Fresh Next 16 App Router project can import `Button` from a Server Component without the consumer-side shim.

## Implementation order

1. Add `output.banner: '"use client";'` to `vite.config.ts`.
2. Write `scripts/verify-use-client-directive.mjs`.
3. Wire it into `postbuild` (`package.json`) and add a CI step in `ci.yml`.
4. Local verification: build, run all gates, inspect both dist outputs.
5. CHANGELOG + version bump to **0.23.0** (RSC-compat behaviour change → minor).
6. README: brief note under "Use" pointing out RSC compatibility from 0.23.0.
7. Split commits by concern; PR; merge; tag; release.

## Risks / open questions

* **Banner format collides with CJS `"use strict";`:** Rollup prepends the banner BEFORE its own `"use strict";` insertion. Final order is `"use client";\n"use strict";...`. Both directives are legal at the top of a module. No conflict.
* **Sourcemaps:** Rollup's `banner` option is sourcemap-aware. Verify by spot-checking the emitted `.mjs.map` after build.
* **Future Option 2 migration:** This change is forward-compatible. If someday we want per-file boundaries, we can remove the bundle-level banner and add per-file directives without breaking existing consumers.

## Out of scope

* Per-file `"use client"` classification of individual components.
* A standalone `<Link>` / RSC-safe primitive surface.
* Changing externals or the build matrix.
