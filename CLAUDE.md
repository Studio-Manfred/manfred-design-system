# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@jens-wedin/design-system` — the Manfred React component library. Published to GitHub Packages (`@jens-wedin` scope) on release via `.github/workflows/publish.yml`. Consumers import components from the barrel and the stylesheet from the `./styles` export.

## Commands

```bash
npm run storybook           # dev loop — Storybook at http://localhost:6006
npm run build               # library build → dist/ (ESM + CJS + rolled-up .d.ts)
npm run build-storybook     # static Storybook → storybook-static/

npm run test                # vitest run, unit project only (jsdom)
npm run test:watch          # vitest watch, unit project only
npm run test:coverage       # v8 coverage over src/components and src/lib
```

Run a single unit test file:
```bash
npx vitest run --project unit src/components/Button/Button.test.tsx
```

There is **no `lint` or `dev` script**. The parent `/Users/jens.wedin/Sandbox/Code/CLAUDE.md` lists generic npm commands that do not apply here — use the ones above.

### Runtime a11y scan

`scripts/a11y-runtime-scan.mjs` loads every Storybook story in headless Chromium and runs axe-core against it. Storybook must be running first.

```bash
npm run storybook &                         # must be up on :6006
node scripts/a11y-runtime-scan.mjs          # light
node scripts/a11y-runtime-scan.mjs --dark   # dark (sets colorScheme on the Playwright context)
```

Full JSON output is written to `/tmp/a11y-runtime.json`. Stories listed in `CONTRAST_EXEMPT_STORIES` inside the script are token/typography showcases where `color-contrast` is intentionally disabled — update that set when adding new showcase stories.

## Architecture

### Three-layer design tokens (`src/tokens/tokens.css`)

All styling flows through one file, in strict order:

1. **Primitives** — raw scales: `--blue-500`, `--neutral-800`, spacing, typography.
2. **Semantic** — brand-aware aliases: `--color-interactive-brand-bg`, `--color-text-primary`.
3. **shadcn contract** — `--background`, `--foreground`, `--primary`, `--ring`, etc., mapped onto layer 2.

A Tailwind v4 `@theme inline { … }` block at the bottom exposes these as utility classes (`bg-primary`, `text-foreground`, `ring-ring`). There is no `tailwind.config.js` — do not add one.

When adding a new color or spacing value, add it at the primitive layer first, alias it semantically, and only then expose it in `@theme`. Never hardcode hex in components.

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
- **storybook** — real Chromium via `@vitest/browser-playwright`, driven by `@storybook/addon-vitest`, runs the `play` functions in `*.stories.tsx`.

`npm run test` deliberately runs **only the unit project**. Storybook tests execute inside Storybook itself or via the runtime a11y scan. Do not try to run the storybook project from the CLI unless you need a browser-context smoke test.

### Library build

`vite build` uses `vite-plugin-dts` with `rollupTypes: true` to emit a single `dist/index.d.ts`. React, `react-dom`, `react/jsx-runtime`, every `@radix-ui/*`, `sonner`, `class-variance-authority`, `clsx`, and `tailwind-merge` are marked external — they are peer/declared dependencies, not bundled. CSS is emitted as a single non-split `dist/style.css` (the `./styles` export). If you add a new runtime dependency that should ship bundled, also remove it from `rollupOptions.external`.

`tsconfig.build.json` excludes tests and stories from the emitted types.

## Conventions

- **No `tailwind.config.js`.** Tailwind v4 reads `@theme` directly from `tokens.css`.
- **No CSS Modules.** The v0.1.x CSS Modules layer was removed in v0.2.0 (see README breaking-changes table).
- **`components.json` is shadcn config** — it points at `src/tokens/tokens.css` as the Tailwind CSS file and sets `@/components`, `@/lib/utils` as aliases, so `npx shadcn@latest add …` drops components in the right place.
- The unit test setup in `src/test/setup.ts` is required for any Radix-based component test to pass in jsdom — new tests pick this up automatically via the `unit` project config.
- Storybook a11y rules `region`, `landmark-one-main`, and `page-has-heading-one` are disabled globally (see `.storybook/preview.ts`) because isolated component previews are not pages. Keep this in mind when interpreting a11y addon output.

## Accessibility

This is a design system — accessibility is part of the product, not a post-hoc check. Every new component needs stories that cover keyboard interaction and screen-reader semantics, and must clear the runtime a11y scan in both light and dark modes. Existing audit findings live in `A11Y-AUDIT.md` and `A11Y-COLOR-AUDIT.md`.

## Publishing

Bumping `version` in `package.json`, updating `CHANGELOG.md`, and creating a GitHub Release triggers `.github/workflows/publish.yml`, which runs `npm ci && npm run build && npm publish` against `npm.pkg.github.com`. The `files` field restricts the published tarball to `dist/` only.
