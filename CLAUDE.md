# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@studio-manfred/manfred-design-system` — the Manfred React component library. Published to GitHub Packages (`@studio-manfred` scope, `Studio-Manfred/manfred-design-system` repo) on release via `.github/workflows/publish.yml`. Consumers import components from the barrel and the stylesheet from the `./styles` export.

## Commands

```bash
npm run storybook           # dev loop — Storybook at http://localhost:6006
npm run build               # library build → dist/ (ESM + CJS + rolled-up .d.ts)
npm run build-storybook     # static Storybook → storybook-static/

npm run test                # vitest run, unit project only (jsdom)
npm run test:watch          # vitest watch, unit project only
npm run test:coverage       # v8 coverage over src/components and src/lib
npm run test:storybook      # play functions, headless Chromium (CI-gated since v0.20.1)
npm run test:all            # unit + storybook, sequential
npm run lint:play-tiers     # regex tier compliance (required CI gate)
npm run chromatic           # local visual-regression upload (needs CHROMATIC_PROJECT_TOKEN)
```

Run a single unit test file:
```bash
npx vitest run --project unit src/components/Button/Button.test.tsx
```

There is **no `lint` or `dev` script**. The parent `/Users/jens.wedin/Sandbox/Code/CLAUDE.md` lists generic npm commands that do not apply here — use the ones above.

### Visual regression (Chromatic)

`.github/workflows/chromatic.yml` uploads every Storybook story to [Chromatic](https://www.chromatic.com/) on every PR and main push. The first run on main sets the baseline; subsequent PRs render diffs in the Chromatic UI for review. **Soft gate initially** (`exitZeroOnChanges: true`) — visual diffs surface in the UI but don't fail the PR. See [memory/reference_chromatic_tuning.md](../../.claude/projects/-Users-jens-wedin-Sandbox-Code-manfred-design-system/memory/reference_chromatic_tuning.md) for when to flip to a hard gate and other tuning knobs.

TurboSnap (`onlyChanged: true`) is on — Chromatic only re-snapshots stories whose dependency graph changed between commits. Cuts ~80% of snapshot usage on a typical PR. Disable briefly when changing core build pipeline (a Vite plugin that affects all bundles) and let main re-baseline before re-enabling.

Locally: `npm run chromatic` uploads from your workstation against your branch. Requires `CHROMATIC_PROJECT_TOKEN` in env.

### Runtime a11y scan

`scripts/a11y-runtime-scan.mjs` loads every Storybook story in headless Chromium and runs axe-core against it. Storybook must be running first.

```bash
npm run storybook &                         # must be up on :6006
node scripts/a11y-runtime-scan.mjs          # light
node scripts/a11y-runtime-scan.mjs --dark   # dark (sets colorScheme on the Playwright context)
```

Full JSON output is written to `/tmp/a11y-runtime.json`. Stories listed in `CONTRAST_EXEMPT_STORIES` inside the script are token/typography showcases where `color-contrast` is intentionally disabled — update that set when adding new showcase stories.

## Storybook MCP

This repo registers a Storybook MCP server at `http://localhost:6006/mcp` (see [.mcp.json](.mcp.json) and the `@storybook/addon-mcp` registration in [.storybook/main.ts](.storybook/main.ts)). When working on UI components in this repo, **use the `manfred-design-system` MCP tools to access Storybook's component and documentation knowledge before answering or taking any action.** This requires Storybook to be running on :6006.

### Mandatory workflow

- **CRITICAL: Never hallucinate component properties.** Before using ANY property on a DS component (including common-sounding ones like `shadow`, `elevation`, `tone`, etc.), you MUST verify the property is actually documented for that component via the MCP.
- Query `list-all-documentation` to get the full component inventory.
- Query `get-documentation` for the target component to see its real props and example stories.
- Use only properties that are explicitly documented or shown in example stories. Do NOT assume props from naming conventions or patterns from other libraries — story names sometimes don't reflect prop names accurately.
- If a property isn't documented, do not invent one. Ask the user.
- When creating or updating stories, use `get-storybook-story-instructions` to fetch the latest conventions before writing the story.
- After creating or modifying stories, run `run-story-tests` to verify.

### When the MCP is unavailable

If Storybook is not running (`localhost:6006` not reachable), prefer to start it with `npm run storybook &` before invoking MCP tools. If you can't (or don't want to spin up Storybook), fall back to the **published MCP** Chromatic serves at `https://main--6a26cfd37771192ff26832bf.chromatic.com/mcp` — a public, always-current endpoint exposing the **docs toolset only** (`list-all-documentation`, `get-documentation`, `get-documentation-for-story`; no `run-story-tests` / `preview-stories`, which are local-only). Only if **both** are unreachable, do not grep as a substitute — read the source directly via the Read tool when the MCP is genuinely unreachable, and surface that to the user.

## Architecture

### Three-layer design tokens (`src/tokens/tokens.css`)

All styling flows through one file, in strict order:

1. **Primitives** — raw scales: `--blue-500`, `--neutral-800`, spacing, typography.
2. **Semantic** — brand-aware aliases: `--color-interactive-brand-bg`, `--color-text-primary`.
3. **shadcn contract** — `--background`, `--foreground`, `--primary`, `--ring`, etc., mapped onto layer 2.

A Tailwind v4 `@theme inline { … }` block at the bottom exposes these as utility classes (`bg-primary`, `text-foreground`, `ring-ring`). There is no `tailwind.config.js` — do not add one.

When adding a new color or spacing value, add it at the primitive layer first, alias it semantically, and only then expose it in `@theme`. Never hardcode hex in components.

#### Consumer-facing `tokens.css` export (STU-266)

The library build runs Tailwind, which consumes the `@theme inline` block from `tokens.css` and removes it from `dist/style.css`. That means shadcn-shape utilities (`bg-muted`, `text-muted-foreground`, `bg-accent`, `border-border`, `ring-ring`, etc.) are dead in downstream Tailwind v4 consumers unless we hand them the `@theme` block separately.

`scripts/build-tokens-export.mjs` runs as a `postbuild` step, copies `src/tokens/tokens.css` to `dist/tokens.css`, and strips the DS-internal `@import "tailwindcss"` and `@import "tw-animate-css"` lines so the file is a clean Tailwind v4 input. It's exported as `./tokens.css` in `package.json`; consumers `@import "@studio-manfred/manfred-design-system/tokens.css";` from their Tailwind input alongside `@import "tailwindcss";`. Don't add anything to that file that requires DS-only dependencies — if you do, either add it to `STRIP_IMPORTS` in the build script or accept that consumers will need that peer.

### Dark mode rebinding

Dark mode is activated by `<html class="dark">` or by `prefers-color-scheme: dark` when no explicit class is set. `<html class="light">` forces light.

**Only layer 2 semantic tokens rebind under dark** — primitives never change, and the shadcn contract flips automatically via `var()` indirection. When a dark value is needed, add it to the `.dark, :root:where(...)` block in `tokens.css`, not at primitive level.

In Storybook, the theme toggle uses `withThemeByClassName` from `@storybook/addon-themes` with `system | light | dark`. `system` maps to an empty class string so the OS preference wins.

### Component authoring pattern

Every component directory follows: `Component.tsx` + `Component.stories.tsx` + `Component.test.tsx` + `index.ts`. New exports must be added to the top-level `src/index.ts` barrel (both the runtime export and the type export).

Interactive components use shadcn/Radix idioms: `cva()` for variants, `React.forwardRef`, `asChild` via `@radix-ui/react-slot`, and `cn()` from `@/lib/utils`. Variant classes reference CSS custom properties directly (`bg-[var(--color-interactive-brand-bg)]`) rather than arbitrary Tailwind values — this keeps the token contract as the single source of truth.

Path alias `@/*` → `src/*` is wired in `tsconfig.json`, `vite.config.ts`, and `vitest.config.ts`. Keep all three in sync.

### Dual-project Vitest setup

`vitest.config.ts` defines two projects run by the same runner:

- **unit** — jsdom, `src/**/*.test.{ts,tsx}`, setup file at `src/test/setup.ts` which polyfills Radix-required browser APIs (`ResizeObserver`, `PointerEvent`, `hasPointerCapture`, `scrollIntoView`) that jsdom lacks.
- **storybook** — real Chromium via `@vitest/browser-playwright`, driven by `@storybook/addon-vitest`, runs the `play` functions in `*.stories.tsx`. Loads `.storybook/vitest.setup.ts` via `setupFiles` so `setProjectAnnotations(preview)` runs explicitly — addon-vitest 10.3.5's auto-provisioning of preview annotations doesn't fully propagate `parameters.a11y.config.rules` to the runner, so the bridge is required for the rule disables in `preview.ts` to take effect.

`npm run test` deliberately runs **only the unit project**. Storybook tests execute inside Storybook itself or via the runtime a11y scan. Do not try to run the storybook project from the CLI unless you need a browser-context smoke test.

### Play functions and the tier lint

`npm run test:storybook` runs every story's `play` function in headless Chromium (Playwright). `npm run lint:play-tiers` enforces presence + tier from `scripts/play-tiers.json` (tiers A/B/C with an exclusion list for layout primitives). Both are wired by `.github/workflows/ci.yml`; `lint:play-tiers` is soft-fail until Wave 2 (STU-129) fills coverage gaps. The `test:storybook` CI gate is deferred to v0.18.1 — locally it works, in CI the vitest browser-mode setup is still being verified. Authoring guide: [docs/PLAY-FUNCTIONS.md](docs/PLAY-FUNCTIONS.md). When adding a new component to `src/components/`, you must either assign it a tier or add it to the exclusion list — otherwise the lint fails.

### Library build

`vite build` uses `vite-plugin-dts` with `rollupTypes: true` to emit a single `dist/index.d.ts`. React, `react-dom`, `react/jsx-runtime`, every `@radix-ui/*`, `sonner`, `class-variance-authority`, `clsx`, and `tailwind-merge` are marked external — they are peer/declared dependencies, not bundled. CSS is emitted as a single non-split `dist/style.css` (the `./styles` export). If you add a new runtime dependency that should ship bundled, also remove it from `rollupOptions.external`.

`tsconfig.build.json` excludes tests and stories from the emitted types.

## Conventions

- **No `tailwind.config.js`.** Tailwind v4 reads `@theme` directly from `tokens.css`.
- **No CSS Modules.** The v0.1.x CSS Modules layer was removed in v0.2.0 (see README breaking-changes table).
- **`components.json` is shadcn config** — it points at `src/tokens/tokens.css` as the Tailwind CSS file and sets `@/components`, `@/lib/utils` as aliases, so `npx shadcn@latest add …` drops components in the right place.
- The unit test setup in `src/test/setup.ts` is required for any Radix-based component test to pass in jsdom — new tests pick this up automatically via the `unit` project config.
- Storybook a11y rules `region`, `landmark-one-main`, `page-has-heading-one`, and `bypass` are disabled globally (see `.storybook/preview.ts`) because isolated component previews are not pages. Keep this in mind when interpreting a11y addon output. Other axe violations **fail CI** since v0.20.2 (`a11y.test: 'error'` in `preview.ts`) — fix at the root per the project's a11y philosophy; only add a rule exemption with explicit justification, and mirror it in `scripts/a11y-runtime-scan.mjs`'s `GLOBAL_DISABLED_RULES`.

## Accessibility

This is a design system — accessibility is part of the product, not a post-hoc check. Every new component needs stories that cover keyboard interaction and screen-reader semantics, and must clear the runtime a11y scan in both light and dark modes. Existing audit findings live in `A11Y-AUDIT.md` and `A11Y-COLOR-AUDIT.md`.

## Publishing

Bumping `version` in `package.json`, updating `CHANGELOG.md`, and creating a GitHub Release triggers `.github/workflows/publish.yml`, which runs `npm ci && npm run build && npm publish` against `npm.pkg.github.com`. The `files` field restricts the published tarball to `dist/` only.
