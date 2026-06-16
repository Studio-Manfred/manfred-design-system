# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.30.0] - 2026-06-15

### Added

- **Stepper component.** Generic, data-driven progress indicator for
  multi-step flows (wizards, checkouts, onboarding). Configurable `steps`
  array with explicit per-step `status` (`complete` / `current` / `upcoming`
  / `error`), horizontal + vertical orientation, optional per-step
  `description`, and optional click-to-navigate via `onStepClick` (only
  `complete` / `current` / `error` steps are interactive — upcoming steps can
  never be jumped to). Built on `<nav>` → `<ol>`/`<li>` with
  `aria-current="step"` and sr-only position + error announcements.
  Generalizes the hardcoded `StepIndicator` previously local to
  `manfred-find-a-time`.

## [0.29.0] - 2026-06-08

### Added

- **AppHeader — SPA / button-driven nav.** `navItems` now accept `onClick` +
  `as: 'button'` (not just `href`), threaded through both the desktop nav and
  the mobile drawer. The drawer's `Sheet` is now controlled and auto-closes
  when a button nav item is activated (an `href` item closes by navigating).
- **AppHeader — 3-state theme cycle.** `themeToggle` widens to
  `boolean | 'toggle' | 'cycle'`; `'cycle'` steps light → dark → system
  (sun / moon / monitor icons). `true` / `'toggle'` keep the 2-state button.
- **AppHeader — clickable profile avatar.** `user` gains `onAvatarClick` /
  `avatarHref` / `avatarActive` / `avatarLabel`; the avatar renders as a
  button/link with an active ring (and `aria-current="page"`), or stays
  display-only (default, unchanged).
- **`useThemeToggle`** gains `cycle()` (light → dark → system).
- **`Icon`** gains the `monitor` glyph.

### Fixed

- **AppHeader** mobile drawer now renders the search slot at full width.

## [0.28.0] - 2026-06-04

### Changed

- **Chart palette** refreshed to a 6-colour brand visualisation palette with
  dark-mode variants (STU-587).

## [0.27.0] - 2026-06-02

### Added

- **`SplitButton` component** — a primary action joined to a dropdown toggle
  (`[ Play │ ▾ ]`). Compose `SplitButton` (root, sets `variant` / `size` for
  both segments) with `SplitButtonAction` (left), `SplitButtonTrigger` (chevron,
  requires `aria-label`), and `SplitButtonContent` (the panel). Built on
  `Button` (theming) and the DS `Popover` (focus, outside-click / Escape,
  `aria-expanded`); the chevron rotates when open. Stories + unit tests.

### Changed

- The Welcome (Storybook front page) version badge now reads from
  `package.json` instead of a hardcoded value, so it can't drift.

## [0.26.0] - 2026-06-02

### Added

- **`Popover` component** — a compound popover built on
  `@radix-ui/react-popover` (`Popover`, `PopoverTrigger`, `PopoverContent`,
  `PopoverAnchor`, `PopoverClose`). The `asChild` trigger opens the panel from
  any element (button, link, icon, …); the content portals to `body`, animates
  via `data-state`, and uses the `--popover` surface tokens. Radix handles
  focus, outside-click / Escape dismissal, and `aria-expanded` / `aria-controls`.
- **`settings` icon** added to `Icon` — a cog / gear (Heroicons outline
  "cog-6-tooth") glyph for settings / options triggers. `IconName` union and
  `iconPaths` updated together.

## [0.25.0] - 2026-06-01

### Added

- **`library` icon** added to `Icon` — a stacked-layers (Heroicons
  outline "rectangle-stack") glyph for prompt-library / saved-collection
  controls. Union (`IconName`) and `iconPaths` updated together.

## [0.24.0] - 2026-05-27

Closes [STU-495](https://linear.app/studio-manfred/issue/STU-495).

### Added

- **`AppHeader` component** — opinionated, configurable application
  header that composes existing DS pieces (NavBar, NavigationMenu,
  Logo, Avatar, Button, Sheet, SearchBar, Icon) into one configured
  shape. Nine archetypes covered (intranet flat nav, dropdown nav,
  custom nav slot, brand-tone landing, always-dark surface, theme
  toggle, typed user menu, plain-text title, monogram, mobile drawer)
  with no per-app boilerplate.
- **`useThemeToggle` hook** — co-shipped with `AppHeader`. Reads
  `localStorage('manfred-theme')`, applies the light/dark class on
  `<html>`, resolves 'system' against the OS preference query.
  SSR-safe. Available for consumers building custom theme switchers.
- **Four icons** added to `Icon`: `sun`, `moon`, `menu`, `log-out` —
  required by `AppHeader`'s theme toggle, mobile hamburger, and
  sign-out button respectively.

### Design notes

- Logo color picks per surface: brand-blue on the default (light)
  tone, white in dark mode, white on brand and dark tones. The Logo
  component is brand-literal (not theme-reactive), so AppHeader uses
  `useThemeToggle()`'s `resolved` value to pick the right variant per
  render.
- Mobile drawer redesign: full-width tappable nav items, full-width
  sign-out button, divider, and a footer row pinned to the bottom —
  identity (avatar + name + email stacked) on the left, theme toggle
  on the right.
- Logo, nav, and right-cluster all get explicit whitespace separators
  (`gap-8` + `ml-6 shrink-0`) so the surfaces never visually crowd
  each other.

### Fixed

- `scripts/lint-play-tiers.mjs` walker now honours the `excluded`
  list BEFORE requiring a stories file. Previously, an excluded
  component without a stories file silently failed the lint with
  "No stories file at …" — the exclusion was inert.

### Notes

- `AppHeader` is the new opinionated header; the existing `PageHeader`
  slot inside `PageShell` is unchanged and remains the escape hatch
  for marketing-site / custom-layout pages. No breaking change.

## [0.23.1] - 2026-05-27

Closes [STU-482](https://linear.app/studio-manfred/issue/STU-482).

### Added

- **`Button` gains a `destructive` variant** for delete / remove /
  cancel-with-consequence actions. Routes through the existing
  shadcn-contract `--destructive` and `--destructive-foreground`
  tokens. Same shape as `primary` / `brand` (matching focus ring +
  hover/active behaviour); only the colour tokens swap.
- Storybook gains a dedicated `Destructive` story under
  `Components/Button` and the variant joins the existing `All variants`
  showcase. The play function asserts the named-utility tokens compile
  through, locking the contract in CI.
- Consumers (e.g. `manfred-up`) can drop the Tailwind className overlay
  on top of `variant="primary"` and use `variant="destructive"`
  directly.

### Fixed

- **Dark-mode `--destructive-foreground` now uses `--neutral-900`** so
  destructive surfaces meet WCAG AA contrast in dark mode. The
  contract's dark `--destructive` (`#fca5a5`, soft pink) failed
  contrast against white text (~1.6:1) — surfaced by the new Button
  variant and confirmed by the runtime axe scan. Matches the
  shadcn/UI dark-mode destructive convention (soft red surface, dark
  text). No light-mode visual change.

## [0.23.0] - 2026-05-25

Closes [STU-169](https://linear.app/studio-manfred/issue/STU-169) — Next 16 RSC compatibility.

### Fixed

- **Next 16 App Router consumers can now import DS exports from Server
  Components.** Before this release, a fresh Next 16 project that did
  `import { Button } from "@studio-manfred/manfred-design-system"` from a
  Server Component crashed at runtime with `TypeError: createContext only
  works in Client Components`. Several components inside the bundle
  (Tabs, Tooltip, Toaster, Dialog, Select, Popover, Sheet, …) call
  `React.createContext` at module load, and the bundled entry shipped
  without a `"use client"` directive.
- The Vite build now prepends `"use client";` to every emitted JS chunk
  via `rollupOptions.output.banner`. Both `dist/index.mjs` and
  `dist/index.cjs` lead with the directive; sourcemaps adjust
  automatically. Consumers can drop their thin client-boundary
  re-export shims (`"use client"; export { … } from "…";`).

### Added

- `scripts/verify-use-client-directive.mjs` — postbuild regression
  guard that asserts both dist entry points start with `"use client";`.
  Wired into the `postbuild` chain locally and a dedicated CI step
  (`Build library and verify RSC "use client" banner`) so a future
  config drift fails the PR, not the publish.

### Notes

- This marks the whole library client-side (Option 1 in STU-169 —
  matching the shadcn/ui, MUI, Mantine convention). Every DS import
  contributes to the consumer's client bundle even when the imported
  component has no client behaviour; the simplicity trade-off is
  acceptable for a UI component library where most exports already use
  Radix and need the boundary anyway.
- Additive — no consumer migration required. Existing client-component
  consumers (anywhere `"use client"` is already declared at the
  call-site) continue to work unchanged.

## [0.22.0] - 2026-05-25

Closes [STU-443](https://linear.app/studio-manfred/issue/STU-443).

### Added

- **Link tokens** (Layer 2 semantic). Four new tokens carry the brand link
  treatment so consumers stop re-deriving it surface by surface:
  - `--color-text-link` — default link colour on white/cream surfaces
    (brand-blue; rebinds to `--blue-300` under dark mode).
  - `--color-text-link-hover` — hover (`--blue-600`; `--blue-200` dark).
  - `--color-text-link-on-brand` — link colour on brand-blue surfaces
    (peach, identity-fixed across themes).
  - `--color-text-link-on-brand-hover` — on-brand hover (white).
- **`.manfred-prose` wrapper class.** Plain-CSS class shipped in
  `dist/style.css`. Applied to any wrapper, it gives every nested `<a>` the
  brand link colour + underline + 4px offset. Add `manfred-prose--on-brand`
  alongside it on brand-blue surfaces to switch the palette.
  - Scoped to `<a>` for v1 (anchor-only — YAGNI on headings/lists).
  - The only solution that reaches `<a>` tags inside CMS HTML rendered
    through React's raw-HTML escape hatch; a JSX `<Link>` primitive cannot
    touch that content.
- Storybook stories under **Foundation / Tokens / Links** demonstrating both
  surfaces with computed-style `play` assertions. Tokens.mdx grows a new
  "Links" subsection in the Layer 2 walk-through.

### Notes

- Additive change — no consumer migration required to retain current
  behaviour. Existing consumers can opt in by wrapping prose surfaces with
  `manfred-prose` and replacing hex literals with the new tokens.

## [0.21.1] - 2026-05-18

Closes [STU-168](https://linear.app/studio-manfred/issue/STU-168).

### Changed

- **10 components now forward native HTML attributes.** `TypographyProps`,
  `BadgeProps`, `LogoProps`, `SpinnerProps`, `IconProps`, `ProgressBarProps`,
  `AlertProps`, `BreadcrumbProps`, `FormFieldProps`, and `SearchBarProps` now
  extend the appropriate `React.HTMLAttributes<…>` (or `SVGAttributes` for
  Icon). Consumers can now pass `role`, `aria-*`, `id`, `data-*`, `onClick`,
  `title`, etc. directly to these components.
  - **Headline use case**: `<Typography role="alert" aria-live="polite">…
    </Typography>` for inline form errors — no more wrapping `<div
    role="alert">`. The text element itself can carry the live-region.
  - **Curated ARIA semantics preserved.** Logo (`role="img"`), Spinner
    (`role="status"`), Icon (`role`/`aria-label`/`aria-hidden` derived from
    `label`), and Alert (`role="alert"`) `Omit` the props the component owns
    by contract — consumers can't accidentally break the semantic contract.
  - Already-extended (no change): Button, Label, Kbd, Avatar, Separator,
    Accordion, Card, Checkbox, Dialog, NavBar, NavigationMenu, Radio,
    Select, Sheet, Switch, Tabs, Textarea, TextInput, Toast (sonner-backed).
  - Out of scope: Chart sub-components and DatePicker — both already
    expose curated ARIA props (`ariaLabel`, `aria-labelledby`, etc.) via
    explicit API; widening to HTMLAttributes would conflict with that
    contract.

### Fixed

- **`.storybook/vitest.setup.ts`** reverted to the single-arg
  `setProjectAnnotations(projectAnnotations)` form. The array form
  (`[a11yAddonAnnotations, projectAnnotations]`) double-loads addon-a11y
  under `@storybook/addon-vitest@^10.4.0` and shallow-merges its default
  `parameters.a11y = { test: 'todo' }` over our `preview.ts` config,
  causing `region` / `landmark-one-main` / `color-contrast` rules to fire
  on stories where they're meant to be disabled. The single-arg form
  relies on Storybook's auto-composition of addon previews — same path
  established in STU-131. Inline NOTE comment now warns future maintainers
  not to re-introduce the array form.

### Added

- **`Typography` "Live region (inline form error)" story** under the
  Accessibility section — demonstrates the new pattern with a play
  function asserting `role`, `aria-live`, and `data-*` reach the rendered
  `<p>`.
- **Unit tests** asserting attribute forwarding on Typography (role +
  aria-live + id + data-testid + onClick) and Badge (id + title +
  data-testid).

### Verified

- 234/234 component plays pass `npm run test:storybook`.
- 428/428 unit tests pass `npm run test`.
- 37/37 components pass `npm run lint:play-tiers`.
- Library build clean (`vite build` + `vite-plugin-dts`).
- Resolves 2 pre-existing tsc errors in `Landing.stories.tsx` (the exact
  bug STU-168 was filed for — `id` prop not accepted on Typography).

## [0.21.0] - 2026-05-15

Closes [STU-266](https://linear.app/studio-manfred/issue/STU-266). Fixes shadcn-shape Tailwind utilities being dead classes in downstream consumers.

### Added

- **New `./tokens.css` export** for Tailwind v4 consumers. Add
  `@import "@studio-manfred/manfred-design-system/tokens.css";` to your
  Tailwind input CSS (alongside `@import "tailwindcss";`) to make
  `bg-muted`, `text-muted-foreground`, `bg-accent`, `bg-card`,
  `bg-popover`, `bg-destructive`, `border-border`, `ring-ring`, and the
  rest of the shadcn-shape contract emit real utility rules in your
  build. The bundled `./styles` stylesheet is the compiled component
  CSS; `./tokens.css` is the source of `@theme inline` declarations your
  Tailwind generator needs to see.
- **`scripts/build-tokens-export.mjs`** runs as a `postbuild` step,
  copies `src/tokens/tokens.css` → `dist/tokens.css`, and strips the
  DS-internal `@import "tailwindcss"` and `@import "tw-animate-css"`
  lines so consumers don't inherit those peer requirements.

### Why this fix

The DS source CSS has always declared the shadcn-shape names inside
`@theme inline { … }`, but `@tailwindcss/vite` consumes that block at
DS build time — it uses the names to generate utilities for the DS's
own source and removes the directive from `dist/style.css`. Downstream
consumers' Tailwind never saw `@theme`, so `bg-muted` and friends
compiled to nothing. The new `./tokens.css` export carries the
`@theme` block into the consumer's Tailwind input untouched.

### Verified

- Clean Tailwind v4 consumer (`tailwindcss` only — no `tw-animate-css`
  installed) compiles `bg-muted`, `text-muted-foreground`, `bg-accent`,
  `bg-card`, `bg-popover`, `bg-destructive`, `text-destructive-foreground`,
  `border-border`, `ring-ring`, `bg-primary`, `bg-secondary`,
  `hover:bg-accent` to real rules referencing the correct `var(--*)`
  custom properties.
- 425 of 425 unit tests pass `npm run test`.

## [0.20.2] - 2026-05-11

Closes [STU-131](https://linear.app/studio-manfred/issue/STU-131). The
last outstanding follow-up from the STU-127 play-functions epic.

### Changed

- **addon-a11y posture flipped to `'error'`.** `.storybook/preview.ts`
  was `a11y.test: 'todo'` — axe violations surfaced in the test UI but
  didn't block CI. Now they fail `test:storybook` per-story. Strongest
  a11y posture this repo has had; the standalone runtime scan
  (`scripts/a11y-runtime-scan.mjs`) was already green so no rules
  needed tightening.

### Added

- **`.storybook/vitest.setup.ts`** — explicit
  `setProjectAnnotations(preview)` bridge. Without it,
  `@storybook/addon-vitest@10.3.5`'s auto-provisioning of preview
  annotations propagates the top-level `parameters.a11y.test` flag but
  drops `parameters.a11y.config.rules` — leaving `region` /
  `landmark-one-main` rules firing against component-in-iframe
  previews where they don't apply. With the bridge, all 233 plays pass
  under the new error posture without modifying a single story.

### Verified

- 233 of 233 component plays pass `npm run test:storybook` in headless
  Chromium with `a11y.test: 'error'`.
- 425 of 425 unit tests pass `npm run test`.
- 37 of 37 components pass `npm run lint:play-tiers`.

## [0.20.1] - 2026-05-11

Originally tracked as v0.18.1 in v0.18.0's CHANGELOG. Renamed at release
to continue linear semver from v0.20.0.

### Fixed

- **`npm run test:storybook` hang.** Root cause: upstream Storybook
  issue [#33347](https://github.com/storybookjs/storybook/issues/33347)
  — vitest 4 + @vitest/browser-playwright + @storybook/addon-vitest
  RPC closure under default file parallelism. Workaround: add
  `fileParallelism: false` to the storybook test project block in
  `vitest.config.ts`. The unit project keeps full parallelism. The
  workaround scope is documented inline with the issue link so future
  maintainers can lift it when an addon-vitest patch ships.

### Changed

- **`.github/workflows/ci.yml`** now runs `npm run test:storybook` as
  a required PR gate. New step sits between Playwright Chromium
  install and the Storybook build, before the runtime a11y scan.
  Failure blocks merge.
- **6 component plays adjusted** for runtime correctness (lint-regex
  passed but the actual play either crashed the iframe or queried
  the wrong shape):
  - **Accordion** — no change; the pilot play was already correct.
  - **NavigationMenu** — replaced `userEvent.click` on a hash anchor
    with `userEvent.tab()` + focus assertion. Anchor click in vitest
    browser-mode changes the iframe URL and aborts the file.
  - **NavBar** — same anchor pattern as NavigationMenu; replaced
    click with `hover` + `focus()` + `toHaveFocus()`.
  - **Breadcrumb** — same anchor pattern; replaced click with
    `focus()` + `toHaveFocus()`.
  - **Checkbox** — `userEvent.tab()` after an earlier click moved
    focus to the next focusable, not back to the checkbox. Replaced
    with `checkbox.focus()` for determinism.
  - **Toast** — Sonner's region uses `aria-live` on a `<section>`
    but not `role="status"`. Replaced `findByRole('status')` with
    `findByText('<message>')` + `.closest('[aria-live]')` for the
    region check.
  - **Kbd** — dropped a gratuitous `getByRole('generic')` assertion
    that was ambiguous against multiple aria-hidden wrappers; the
    existing `getByText('⌘')` carries the smoke contract.

### Added

- **`engines.node: ">=22"`** in `package.json`. Aligns the
  consumer-facing constraint with what CI uses (`actions/setup-node@v6`
  with `node-version: '22'`) and what `publish.yml` ships with.

### Verified

- 233 / 233 play assertions pass in headless Chromium (44 test
  files, ~20s wall-clock).
- 425 unit tests still pass.
- `npm run lint:play-tiers` still reports 37 / 37 components green.

### Notes

- **Spec:** `docs/superpowers/specs/2026-05-10-storybook-play-functions-design.md`.
- **Plan:** `~/.claude/plans/swift-soaring-stroustrup.md`.

## [0.20.0] - 2026-05-10

Wave 3 (final wave) of the **Storybook play functions** epic
(STU-127 / STU-130). Brings the four below-tier components shipped in
v0.18.0 up to spec, then flips `lint:play-tiers` from soft-fail to
required in CI. **Closes the STU-127 epic.** All 37 components now
meet their tier per `scripts/play-tiers.json`.

### Changed

- **Checkbox** (tier B) — added pointer-click toggle exercise alongside
  the existing keyboard Space test. Guards against onCheckedChange
  wiring regressing under Radix's button-with-aria-checked pattern.
- **SearchBar** (tier B) — added explicit `expect(input).toBeInTheDocument()`
  before the type/Enter sequence; the existing `findByText` assertion
  remains as the implicit signal that Enter fires `onSearch`.
- **Sheet** (tier C) — added Escape-closes-the-sheet keyboard
  regression. Sheet shares Dialog's primitive, so the keyboard contract
  is identical.
- **Tooltip** (tier C) — added pointer-event parity (`userEvent.hover`
  also opens the tooltip) plus an `aria-describedby` assertion on the
  trigger — the screen-reader contract Radix wires when the tooltip
  is open.
- **`.github/workflows/ci.yml`** — `lint:play-tiers` is now a required
  gate (`continue-on-error: true` removed). New components added to
  `src/components/` must be assigned a tier in `scripts/play-tiers.json`
  or added to the exclusion list, otherwise the PR fails CI.

### Notes

- **Closes STU-127 epic.** Three minor releases shipped on 2026-05-10:
  v0.18.0 (foundation + lint + CI), v0.19.0 (23-component coverage
  fill), v0.20.0 (4-component consistency sweep).
- **Lint baseline:** ✓ 37 of 37 components pass.
- **`test:storybook` CI gate is still deferred** to v0.18.1 — see
  [docs/PLAY-FUNCTIONS.md](docs/PLAY-FUNCTIONS.md) "Troubleshooting"
  for the open vitest-browser-mode hang.
- **Spec:** `docs/superpowers/specs/2026-05-10-storybook-play-functions-design.md`.

## [0.19.0] - 2026-05-10

Wave 2 of the **Storybook play functions** epic (STU-127 / STU-129). Adds
play functions to the 23 interactive components that were missing them,
each meeting its tier per the contract introduced in v0.18.0. Brings
`lint:play-tiers` from 27 failures down to 4 (the Wave 3 tier-mismatches
on Checkbox, SearchBar, Sheet, Tooltip). No new runtime APIs, no
breaking changes.

### Added

- **Tier A — smoke (10 components):** Avatar, Badge, Icon, Kbd, Label,
  Logo, ProgressBar, Separator, Spinner, Typography. Each play asserts
  the primary affordance renders with the expected role and accessible
  name.
- **Tier B — smoke + interaction (6 components):** Alert, Button, Card,
  FormField, Radio, Switch. Each play exercises a state-changing user
  interaction (`click` / `hover` / `type`) and verifies the resulting
  state via `expect()`.
- **Tier C — full (7 components):** Accordion, Breadcrumb, Chart,
  NavBar, NavigationMenu, Tabs, Toast. Each play covers a keyboard
  regression and asserts on an `aria-*` attribute. Notable specimens:
  - Accordion verifies the single-collapsible auto-close invariant
    (opening item 2 must close item 1) plus Radix roving tabindex
    (`ArrowDown` shifts focus to the next trigger).
  - Toast queries the Sonner status region via `within(document.body)`
    since the live region portals outside `canvasElement`.

### Notes

- **Behaviour unverified at runtime in this release.** Story files
  pass `lint:play-tiers` (regex-based tier compliance), but the
  headless `npm run test:storybook` runner is still deferred to v0.18.1
  — see [docs/PLAY-FUNCTIONS.md](docs/PLAY-FUNCTIONS.md) "Troubleshooting"
  for the open issue. Plays render correctly in the Storybook UI
  during dev; the CI gate will go strict once v0.18.1 lands the runner
  fix and Wave 3 (STU-130) brings the remaining 4 components to tier.
- **Spec:** `docs/superpowers/specs/2026-05-10-storybook-play-functions-design.md`.

## [0.18.0] - 2026-05-10

Wave 1 of the **Storybook play functions** epic (STU-127 / STU-128).
Establishes the tier contract, ships the lint that enforces it, and
wires unit tests + runtime a11y scan + tier lint into the PR pipeline.
**No new component play coverage** — that's Wave 2 (STU-129). Pure
infra release; no runtime API changes; no breaking changes.

### Added

- **`scripts/play-tiers.json`** — tier mapping for all 37 components.
  Every component is in exactly one of tier A (smoke), B (smoke +
  interaction), C (full keyboard + ARIA), or `excluded` (layout
  primitives: Container, Grid, PageBackground, PageShell, Stack).
  This is the single source of truth for the lint.
- **`scripts/lint-play-tiers.mjs`** — Node ESM lint, zero deps.
  Exports `lintComponent(...)` (pure function, 18 unit tests) and
  `lintAll()` (filesystem walker over `src/components/`). CLI entry
  point with `--report` mode that writes `docs/PLAY-AUDIT.md`.
  Hardened against nested-destructure params, comment-injected
  tokens, malformed mappings, non-string sources, and duplicate-tier
  membership.
- **`npm run lint:play-tiers`** — invokes the lint. Exits 1 on any
  failure. Used by CI.
- **`npm run test:storybook`** — `vitest run --project storybook`.
  Headless Chromium play execution. **Local use only in v0.18.0**;
  the CI gate is deferred to v0.18.1 pending vitest browser-mode
  setup verification.
- **`npm run test:all`** — chains `test` (unit) + `test:storybook`
  for local pre-push.
- **`docs/PLAY-FUNCTIONS.md`** — authoring guide. Tier definitions,
  conventions (`storybook/test` imports, portal queries via
  `within(document.body)`, `findByRole` for async, no style
  assertions), per-tier templates, troubleshooting.
- **`.github/workflows/ci.yml`** — first PR-trigger workflow in this
  repo. Runs `lint:play-tiers` (soft-fail until Wave 2 fills
  coverage), unit tests, Storybook build, and the runtime a11y scan.
- **AGENTS.md / CLAUDE.md** — short links to the new authoring
  guide and tier mapping.

### Notes

- **Lint baseline:** 27 of 37 components currently fail
  `lint:play-tiers` — 23 missing play, 4 below tier (Checkbox,
  SearchBar, Sheet, Tooltip). The lint is wired as soft-fail in CI;
  Wave 2 fills coverage and Wave 3 brings the existing 4 to tier.
- **Scope correction during Wave 1:** the original epic plan
  assumed 22 existing play functions. The real count is 9 — earlier
  inventory used a `grep -l "play:"` that false-matched
  `display: 'flex'`. Wave 2 / Wave 3 ticket scopes have been
  re-baselined on the [STU-127 epic](https://linear.app/studio-manfred/issue/STU-127).
- **Spec:** `docs/superpowers/specs/2026-05-10-storybook-play-functions-design.md`.
  **Plan:** `docs/superpowers/plans/2026-05-10-play-functions-wave-1.md`.

## [0.17.0] - 2026-05-10

Wave 3 (final wave) of the **AI/agent-friendly Storybook surface**
epic (STU-113). Adds machine-readable artifacts so AI agents can
discover the design system from a single well-known URL on the
deployed Storybook, plus cleaner JSX source emission across every
component story for both AI scrapers and human copy-paste consumers.
**Closes the STU-113 epic.** Pure documentation / tooling release —
no runtime API changes, no breaking changes.

### Added

- **`public/llms.txt`** — top-level index of agent-discoverable URLs,
  served at `https://studio-manfred.github.io/manfred-design-system/llms.txt`
  after deploy. Points at the Storybook root, the MCP endpoint, the
  components-index (`index.json`), the component-registry
  (`registry.json`), AGENTS.md, CLAUDE.md, and the install-setup
  pointer. Single well-known URL means any agent can bootstrap the
  whole DS surface from one HTTP GET. (STU-124)
- **`registry.json`** — shadcn-shape component registry emitted
  alongside Storybook's auto-emitted `index.json`. 37 entries — every
  public-barrel component grouping (32 components + 5 layout
  primitives), each with `name`, `type` (`"component"` | `"layout"`),
  primary `story` ID (cross-checked against `index.json`), and
  external-package `dependencies`. New `scripts/build-registry.mjs`
  (Node ESM, no extra deps) wired into the `build-storybook` script.
  Idempotent. JSON-validated in-process before writing. (STU-125)
- **`public/`** added to `staticDirs` in `.storybook/main.ts` —
  separates repo-root machine-readable artifacts (llms.txt, future
  additions) from build-time `src/assets/` (favicon, fonts).

### Changed

- **`docs.source.type`** in `.storybook/preview.ts` flipped from
  `'auto'` to `'code'` — autodocs **Show code** blocks now show the
  literal story body instead of an args-synthesised flat tag. Better
  for AI agents reading the source field via MCP, and for humans
  copy-pasting examples. Args-only Playground stories (Button, Badge,
  Alert, Avatar, Checkbox, Icon, Kbd, Logo, ProgressBar, Spinner,
  Switch, SearchBar, Textarea, TextInput, Typography) all emit clean
  flat-tag JSX under `'code'` — Storybook still synthesises from args
  when no `render` body is provided, so no fixes needed. (STU-123)

### Fixed

- 4 DatePicker Range stories (RangePlayground, RangeWithConstraints,
  RangePartialState, RangeKeyboardInteraction) get a per-story
  `parameters.docs.source.type: 'auto'` override. Their
  `(args) => <DatePicker {...(args as DatePickerRangeProps)} />`
  render bodies use a TypeScript cast on the spread expression that
  breaks Storybook's args-inliner AST recognizer — keeping `'auto'`
  on those stories preserves them as argTypes-driven Controls
  sandboxes.

### Notes for consumers

- Documentation-only release at the source level. The published npm
  tarball is functionally identical except for the Storybook docs
  site (cleaner copy-paste source blocks + new `llms.txt` /
  `registry.json` artifacts at the deploy root).
- AI agents now have **three discovery paths**:
  - `https://studio-manfred.github.io/manfred-design-system/llms.txt`
    (single-URL bootstrap)
  - `…/registry.json` (machine-readable component inventory)
  - `…/index.json` (Storybook story metadata, auto-emitted)
  - Plus the live Storybook MCP at `http://localhost:6006/mcp` when
    Storybook is running locally.

### STU-113 epic closeout

This release closes the **AI/agent-friendly Storybook surface** epic.
Total delivery: **3 minor releases (v0.15.0 / v0.16.0 / v0.17.0)** +
**1 patch (v0.15.1, DatePicker popover bg hotfix)** across **12
PRs**, **zero breaking changes**.

What shipped, in arc order:

- **Wave 1 — Onramp + autodocs substance (v0.15.0).** AGENTS.md
  pointer at the repo root for any non-Claude agent. README refresh
  with the stale "17 components" → "30+" + new `## AI agents`
  section. JSDoc on every component + ~60 compound sub-parts
  (rendered into autodocs via `react-docgen-typescript`). Per-prop
  JSDoc on every Props interface. Expanded `argTypes` + per-story
  descriptions on every story file.
- **Wave 2 — Foundations & narrative (v0.16.0).** 5 narrative MDX
  foundation pages — Tokens, Theming, Accessibility, Motion,
  FormPatterns. 6 new token-group stories under `Foundation/Tokens`
  (Typography, Spacing, Radius, Motion, Effects, ChartPalette).
  Refreshed Welcome story wiring the new pages into the on-ramp.
- **Wave 3 — Machine-readable artifacts (v0.17.0, this release).**
  llms.txt + registry.json deploy artifacts. Cleaner JSX source
  emission across every component story.

The Storybook MCP at `http://localhost:6006/mcp` was already shipping
before this epic; the epic's job was to put **substance** behind that
surface so agents querying it get fully-described props, narrative
foundations, and a single-URL bootstrap.

## [0.16.0] - 2026-05-10

Wave 2 of the **AI/agent-friendly Storybook surface** epic (STU-113).
Pure documentation release — no runtime API changes, no breaking
changes. Adds the narrative MDX foundation pages that autodocs
cannot generate, polishes the Foundation/Tokens story coverage so
every primitive group is browseable, and refreshes the Welcome
story into a current AI on-ramp.

### Added

- **`Foundation/Tokens` narrative** — new `src/tokens/Tokens.mdx`
  page bound to the existing tokens.stories.tsx via
  `<Meta of={...} />`. Documents the three-layer token model
  (primitives → semantic → shadcn contract → `@theme`), the
  authoring rule "never hardcode hex in components", and embeds
  10 token-stories canvases. (STU-120)
- **6 new token-group stories** under `Foundation/Tokens`, using
  the existing `Section` / `SwatchRow` / `ScaleRow` helpers (no new
  helpers reinvented):
  - `TypographyTokens` — font-size, line-height, font-weight scales
  - `SpacingTokens` — `--space-*` scale
  - `RadiusTokens` — `--radius-*` scale
  - `MotionTokens` — `--duration-*` and `--ease-*` scales
  - `EffectTokens` — `--shadow-*` and overlay tokens
  - `ChartPalette` — `--chart-1..5`, `--chart-axis`, `--chart-grid`

  Existing stories (BrandPalette, ColorScales, SemanticTokens,
  SizingTokens) preserved with new per-story descriptions added.
- **4 new Foundation MDX pages** under `src/tokens/`, sibling to
  Tokens.mdx (STU-121):
  - **`Foundation/Theming`** — three-state theme toggle (system / light
    / dark), `withThemeByClassName` decorator, dark mode rebinds only
    layer-2 semantic tokens, `:where(body)` baseline rule.
  - **`Foundation/Accessibility`** — non-negotiable that a11y is
    product-level, the 4 globally disabled axe rules in `preview.ts`
    and their rationale (stories render in isolation), the runtime axe
    scan workflow.
  - **`Foundation/Motion`** — the `motion-safe:` Tailwind v4 gating
    convention; lists the 4 components currently using it; documents
    what NOT to wrap; embeds 2 canvases (Accordion, Sheet).
  - **`Foundation/FormPatterns`** — compositional doc around `FormField`
    + `Label` + input; three patterns (text input / textarea / Select)
    plus the DatePicker range special case (`name_from` / `name_to`
    serialisation); 5 embedded canvases.
- **storySort updated** in `.storybook/preview.ts` — Foundation entry
  extended with the new MDX pages:
  ```diff
  - 'Foundation', ['Tokens', 'Typography', 'Logo'],
  + 'Foundation', ['Tokens', 'Typography', 'Logo', 'Theming',
  +   'Accessibility', 'Motion', 'FormPatterns'],
  ```
- **Welcome refresh** (STU-122):
  - Version badge bumped from `v0.10.1` → `v0.16.0`.
  - Foundation card expanded with all 7 entries: Tokens, Typography,
    Logo, Theming, Accessibility, Motion, Form patterns. The Tokens
    link now points at the Docs-tab URL so consumers land on the
    Tokens.mdx narrative by default.
  - New "Where to start (for AI agents)" section between the
    theme toggle section and the existing "Working with the system"
    section: links AGENTS.md, CLAUDE.md, the Storybook MCP endpoint,
    `.mcp.json`, and the non-negotiable rule.

### Notes for consumers

- Documentation-only release at the source level. The published npm
  tarball is functionally identical except for the Storybook docs site
  (now ~5 new MDX pages, 6 new token stories, refreshed Welcome).
- The `Foundation/*` MDX corpus is now the canonical narrative
  surface. AI agents querying via the Storybook MCP see all 5
  Foundation pages alongside the component autodocs.

### Wave 2 of 3

Wave 1 closed the on-ramp + autodocs-substance gap. **Wave 2 (this
release)** closes the foundations + narrative gap. **Wave 3 (target
v0.17.0)** adds machine-readable artifacts (`llms.txt`, augmented
`registry.json`, cleaner JSX source emission via
`docs.source.type: 'code'`).

## [0.15.1] - 2026-05-10

Hotfix release. Pure visual bug fix; no API changes.

### Fixed

- **`DatePicker` popover background was transparent** — the popover
  content panel referenced `--color-bg-surface`, a token that does
  not exist in `tokens.css`. Tailwind emitted
  `background-color: var(--color-bg-surface)` → undefined → fell
  back to the parent, so calendar cells, the underlying page, and
  any sibling content bled through the popover. Bug pre-dated Wave 1
  (introduced in commit `54396b3 refactor(date-picker)…`); surfaced
  visually after v0.15.0 made the calendar more browseable.
  Fix: swap to the canonical shadcn `bg-popover` Tailwind utility,
  which sources from the `--popover` token at `tokens.css:271` and
  flips correctly under dark mode. (STU-126)
- **`Switch` story** had the same broken token reference in an
  inline style — same fix applied (`var(--popover)`).

## [0.15.0] - 2026-05-10

Wave 1 of the **AI/agent-friendly Storybook surface** epic (STU-113).
Pure documentation release — no runtime API changes, no breaking
changes. Lands an `AGENTS.md` on-ramp at the repo root, refreshes
the stale README, and adds JSDoc + story-description coverage
across the entire component surface so the autodocs prop-table
description column populates and the Storybook MCP
`get-documentation` tool returns rich metadata.

### Added

- **`AGENTS.md`** at the repo root — generic agent on-ramp for
  Cursor / Copilot / Windsurf / Cline / generic MCP clients.
  Documents the Storybook MCP endpoint at
  `http://localhost:6006/mcp`, the five tools every agent needs
  (`list-all-documentation`, `get-documentation`,
  `get-storybook-story-instructions`, `run-story-tests`,
  `preview-stories`), the non-negotiable "never invent props"
  rule, and points at `CLAUDE.md` as the canonical engineering
  guide. (STU-114)
- **JSDoc on every component + sub-part** — 36 components and
  ~60 compound sub-parts now have component-level JSDoc rendered
  in the autodocs Description block. Per-prop JSDoc on every
  Props interface renders in the autodocs prop-table description
  column via `react-docgen-typescript`. Compound components
  (Card, Dialog, Sheet, Tabs, Tooltip, NavigationMenu, Select,
  Accordion, Radio, etc.) have JSDoc on each exported sub-part.
  (STU-115..119)
- **Expanded `argTypes` and per-story descriptions** on every
  story file — meta-level `parameters.docs.description.component`,
  `argTypes` with `description` strings on every entry, and
  per-story `parameters.docs.description.story` on every named
  story. Storybook autodocs and the public Storybook on GitHub
  Pages now ship a fully-described component surface.
- README — top-of-file 🤖 AI agents pointer and an `## AI agents`
  section above `## Local development` linking AGENTS.md /
  CLAUDE.md / the MCP endpoint.

### Changed

- README — refreshed component count from "17" to "30+",
  refreshed the inline component list (added Avatar, Card, Chart,
  Kbd, NavBar, Select, Tabs that were exported from the barrel
  but missing from the list; added a separate line for the 5
  layout primitives Container / Grid / PageBackground / PageShell
  / Stack).

### Notes for consumers

- Documentation-only release at the source level — no runtime
  API changes. The published npm tarball is functionally
  identical except that consumers of the Storybook MCP server (or
  the public Storybook on GitHub Pages) will now see
  fully-populated prop tables and story descriptions.
- The AGENTS.md / CLAUDE.md / Storybook MCP contract is now
  formalised for AI agents working in consumer codebases that
  import `@studio-manfred/manfred-design-system`. Point your
  agent at the MCP endpoint when running Storybook locally.

### Surface coverage

After this release, every component in the public barrel
(`src/index.ts`) and every layout primitive has:

1. Component-level JSDoc (visible to MCP `get-documentation` and
   the autodocs Description block).
2. Per-prop JSDoc on the Props interface (rendered in the
   autodocs prop-table description column).
3. Meta-level `parameters.docs.description.component`.
4. `argTypes` with `description` strings (or, for compound-only
   APIs like NavigationMenu and RadioGroup, intentional omission
   documented in the meta).
5. Per-story `parameters.docs.description.story` on every named
   story.

### Wave 1 of 3

Wave 1 closes the on-ramp + autodocs-substance gap. **Wave 2**
adds narrative MDX foundations (Tokens, Theming, Accessibility,
Motion, Form Patterns) — target v0.16.0. **Wave 3** adds
machine-readable artifacts (`llms.txt`, augmented `registry.json`,
cleaner JSX source emission via `docs.source.type: 'code'`) —
target v0.17.0.

## [0.14.0] - 2026-05-09

Wave 3 (final wave) of the intranet-adoption epic (STU-79). Adds the
last component, **NavigationMenu**, completing the seven-component
program. No breaking changes.

### Added

- **`NavigationMenu`** — top-level navigation menu with sub-menu support,
  built on `@radix-ui/react-navigation-menu`. 8 sub-parts:
  `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`,
  `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink`,
  `NavigationMenuViewport`, `NavigationMenuIndicator`. Plus the
  `navigationMenuTriggerStyle` cva helper so plain `NavigationMenuLink`s
  can reuse the trigger look. Active-link styling driven by tokens
  (`data-[active]:bg-accent/50`). Keyboard navigation (Tab / Arrow keys /
  Escape) provided by Radix. Animations (chevron rotation, content slide,
  viewport zoom, indicator fade) all wrapped in `motion-safe:` so they
  respect `prefers-reduced-motion`. (STU-95)

### Dependencies

- New runtime dependency (already external in the build, so the bundled
  `dist/` size is unchanged):
  - `@radix-ui/react-navigation-menu@^1.2.14`

### Notes for consumers

- Use `NavigationMenu` for top-bar menus that have sub-menu dropdowns.
  Use the existing `NavBar` for flat horizontal navigation bars without
  sub-menus — they coexist deliberately.
- `navigationMenuTriggerStyle()` is exported as a cva so consumers can
  apply the same visual treatment to a plain `NavigationMenuLink`
  (matches the shadcn upstream pattern).
- The `<NavigationMenuViewport>` is auto-rendered inside the root
  `<NavigationMenu>`; the named export is for advanced cases where a
  consumer wants to place the viewport outside the nav for overflow
  reasons.

### Epic closeout

This release closes the **Add missing components for intranet adoption**
epic (STU-79). The intranet (and other Manfred apps) can now drop their
local copies of Sheet, NavigationMenu, Separator, Label, Textarea,
Switch, and Accordion in favour of the shared DS components.

Total epic delivery: 7 components across 3 minor releases (v0.12.0,
v0.13.0, v0.14.0), no breaking changes to existing API.

## [0.13.0] - 2026-05-09

Wave 2 of the intranet-adoption epic (STU-79). Two new overlay/disclosure
components ship together. No breaking changes — pure additions.

### Added

- **`Sheet`** — side-drawer / bottom-sheet overlay built on
  `@radix-ui/react-dialog`. 8 sub-parts: `Sheet`, `SheetTrigger`,
  `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`,
  `SheetFooter`, `SheetClose` (plus `SheetPortal` and `SheetOverlay`
  re-exports for advanced cases). `side="top" | "right" | "bottom" | "left"`,
  default `right`. All slide animations gated behind `motion-safe:` so
  they respect `prefers-reduced-motion`. (STU-94)
- **`Accordion`** — collapsible content section built on
  `@radix-ui/react-accordion`. 4 sub-parts: `Accordion`,
  `AccordionItem`, `AccordionTrigger`, `AccordionContent`. Single + multiple
  open modes via Radix `type="single" | "multiple"` passthrough. Chevron
  rotates 180° on open via `data-[state=open]` selector; expand/collapse
  animations use `tw-animate-css` `accordion-up`/`accordion-down` utilities,
  gated behind `motion-safe:`. (STU-100)

### Dependencies

- New runtime dependency (already external in the build, so the bundled
  `dist/` size is unchanged):
  - `@radix-ui/react-accordion@^1.2.12`
- `@radix-ui/react-dialog` (already installed for `Dialog`) is reused by
  `Sheet`.

### Notes for consumers

- Both components are token-driven and rebind in dark mode automatically.
  No new tokens introduced; reused `bg-background`, `text-foreground`,
  `text-muted-foreground`, `border-border`, `--color-bg-overlay`,
  `--shadow-focus`.
- Sheet overlay animation is wrapped in `motion-safe:` (Dialog's overlay
  is not — that's a future polish opportunity).
- Use `Sheet` for mobile-friendly side panels (board sidebars, comment
  threads, detail panels). Use `Accordion` for FAQs, info-page sections,
  and sidebar groupings.
- One sub-ticket remains in epic STU-79: NavigationMenu (STU-95) → v0.14.0.

## [0.12.0] - 2026-05-09

Wave 1 of the intranet-adoption epic (STU-79). Four new form-layer
components ship together so the intranet (and other Manfred apps)
can drop their local copies. No breaking changes — pure additions.

### Added

- **`Separator`** — horizontal/vertical divider wrapping
  `@radix-ui/react-separator`. `orientation="horizontal" | "vertical"`,
  default border from `--color-border-default`, `decorative` prop to
  remove from the a11y tree. (STU-96)
- **`Label`** — accessible form label wrapping
  `@radix-ui/react-label`. `required` prop renders an `aria-hidden`
  red asterisk; pairs naturally with `TextInput`, `Checkbox`,
  `Switch`. Coexists with the existing `FormField` label rendering
  — use `Label` for manual form-row composition, `FormField` for
  the wrapped pattern. (STU-97)
- **`Textarea`** — multi-line input that reuses the
  `inputLikeVariants` shared CVA so it stays visually locked with
  `TextInput`. Sizes `sm | md | lg`, statuses
  `default | error | success`, `fullWidth`, `resize-y` for native
  vertical resize. `autoResize` deferred to v2. (STU-98)
- **`Switch`** — boolean toggle wrapping
  `@radix-ui/react-switch`. Sizes `sm | md | lg`, optional inline
  `label` prop (mirrors `Checkbox` pattern), `loading` shows a
  centered Spinner inside the track and sets `aria-busy="true"`,
  `error` sets `aria-invalid` and a red border. Visually distinct
  from `Checkbox` — use `Switch` for binary settings, `Checkbox`
  for selection. (STU-99)

### Tests / fixes

- Anchored DatePicker range-mode "first click" test to April 2026
  via `vi.setSystemTime` so it stops failing once the system date
  moves past April. The empty-range case opens the calendar to the
  current month, and the day-cell aria-label regex needed the
  visible month to be deterministic.

### Dependencies

- New runtime dependencies (already external in the build, so the
  bundled `dist/` size is unchanged):
  - `@radix-ui/react-separator@^1.1.8`
  - `@radix-ui/react-label@^2.1.8`
  - `@radix-ui/react-switch@^1.2.6`

### Notes for consumers

- All four components are token-driven and rebind in dark mode
  automatically. No new tokens were introduced; reused
  `--color-border-default`, `--color-bg-brand`, `--color-border-strong`,
  `--color-feedback-error-fg`, `--color-feedback-success-fg`, and
  `--shadow-focus`.
- All four export both runtime and types from the package barrel.
  `Textarea` additionally exports `TextareaSize` and `TextareaStatus`
  type helpers for downstream code that wraps it.
- Three sub-tickets remain in epic STU-79 for follow-up waves:
  Sheet (STU-94), Accordion (STU-100), NavigationMenu (STU-95).

## [0.11.0] - 2026-04-29

Storybook-only release — **no public API changes**. The published
`dist/` is byte-equivalent to v0.10.1; this release adds developer-
experience improvements to the Storybook itself plus one new demo.

### Added

- **Storybook Welcome page** — a dedicated landing page so designers
  and consumers no longer drop into `Components/Alert` when opening
  the deployed Storybook. Hero with Logo + version Badge, four
  section nav Cards (Foundation / Layout / Components / Examples),
  and a getting-started snippet pointing at the Consuming guide.
  Lives at `src/Welcome.stories.tsx`; sidebar order locked via
  `options.storySort` in `.storybook/preview.ts`.
- **Storybook autodocs + "Show code" toggle** — `tags: ['autodocs']`
  enabled globally so every component story file gets a Docs entry
  with a Story block + Source block per export. Click the
  "Show code" toggle under any rendered story to reveal the JSX.
  Welcome page opted out via `tags: ['!autodocs']`. Index now has
  ~35 docs entries on top of stories. (STU-55)
- **`Examples/AdvancedForm`** — a "Create project" form that
  exercises every form component the DS ships (FormField, TextInput,
  Select, Checkbox, RadioGroup, DatePicker) together with cross-
  field state (start/due dates), inline validation, and an action
  bar. Four story states: HappyPath / Empty / Loading / Error.

### Tooling

- **GitHub Pages auto-deploy** — `.github/workflows/deploy-storybook.yml`
  builds and deploys Storybook to GitHub Pages on every push to
  main. Public Storybook is now at
  https://studio-manfred.github.io/manfred-design-system/.
- **Storybook MCP server** — `@storybook/addon-mcp` registered in
  `.storybook/main.ts` and `.mcp.json` committed. Exposes the
  design system's component documentation as MCP tools so AI agents
  can query real props instead of hallucinating from naming
  conventions. Documented in CLAUDE.md.
- Production base path for Storybook set via `viteFinal` in
  `.storybook/main.ts` so GitHub Pages serves correctly under the
  repo subpath.

### Documentation

- README links to the public Storybook URL.
- `package.json` `homepage` points at the public Storybook URL.
- CLAUDE.md documents the Storybook MCP workflow (always query
  `list-all-documentation` / `get-documentation` before naming any
  DS component prop; never hallucinate from naming conventions).

### Notes for consumers

- `src/Welcome.stories.tsx`, `src/examples/`, and `.mcp.json` are
  not exported from `src/index.ts`. They live inside `src/` so
  Storybook + the runtime axe scan pick them up, but they are not
  part of the public API.
- `npm install @studio-manfred/manfred-design-system` resolves to
  the same components as v0.10.1.

## [0.10.1] - 2026-04-26

`Examples/` epic (STU-49). Storybook-only release — **no public API
changes**. The published library tarball at `dist/` is byte-equivalent
to v0.10.0; this release only adds internal showcase stories and
developer tooling.

### Added (Storybook only — not exported)

- **`Examples/Dashboard`** — KPI grid + charts + recent-activity list
  in `PageShell` composition. Four story states: `HappyPath`, `Empty`,
  `Loading`, `Error`. Studio-Manfred-flavoured fixtures (Mitt
  Intranat-style copy, Swedish names). (STU-50)
- **`Examples/Settings`** — sidebar nav + form panels (account,
  notifications, theme, sessions, action bar) demonstrating
  FormField + TextInput + Select + Checkbox + RadioGroup composition
  inside `PageShell`. Four story states. (STU-51)
- **`Examples/Landing`** — `PageBackground` + non-sticky marketing
  header + hero + features Grid + CTA banner + footer. Heading
  hierarchy h1 → h2 → h3 verified clean by axe. Four story states.
  (STU-52)
- **`Examples/Login`** — small centred auth Card on `PageBackground`,
  using `as="main"` on the background to keep one landmark without
  nesting. Four story states. (STU-53)
- `src/examples/_shared/content.ts` — shared brand / mock-user / nav
  fixtures reused across all four demos.

### Tooling

- `@storybook/addon-mcp` devDependency + `.mcp.json` registration —
  exposes the design system as an MCP server through Storybook on
  `localhost:6006/mcp`.
- `scripts/a11y-runtime-scan.mjs` — `landmark-one-main` rule re-enabled
  for `examples-*` story IDs (mirroring the v0.10.0 carve-out for
  `layout-pageshell--*`). Whole-page demos now enforce the single-main
  contract instead of being globally suppressed alongside isolated
  component previews.

### Notes for consumers

- `src/examples/` is **not exported** from `src/index.ts`. The fixtures
  and demo stories live inside `src/` so Storybook + the runtime axe
  scan pick them up, but they are not part of the public API.
- The published `dist/` is unchanged. `npm install
  @studio-manfred/manfred-design-system` resolves to the same components
  as v0.10.0.

## [0.10.0] - 2026-04-26

Layout primitives epic (STU-43). Five new components address the
"DS has zero page-layout primitives" gap surfaced while building the
first consumer app on v0.9.1. All additive — no breaking changes.

### Added

- **`Stack` / `VStack` / `HStack`** — sibling spacing primitive.
  Flex container with token-driven gap (`1`/`2`/`3`/`4`/`6`/`8`/`12`),
  `direction` (`vertical`/`horizontal`), `align`, `justify`, optional
  `wrap` and `fullWidth`. Polymorphic `as` (closed enum: `div` |
  `section` | `nav` | `ul` | `ol` | `li`). `VStack` / `HStack` are
  thin re-exports with the direction baked in. (STU-44)
- **`Container`** — centred max-width wrapper. `size` of `sm` /
  `md` / `lg` (default) / `xl` / `full` mapping to `--size-container-*`
  tokens. `padded` (default `true`) applies responsive horizontal
  padding (`px-4 sm:px-6 lg:px-8`). `as`: `div` | `main` | `section`
  | `article`. (STU-45)
- **`Grid`** — CSS-grid wrapper with token-driven gap and responsive
  column counts. `cols` accepts a number `1`–`12` or a responsive
  object `{ base?, sm?, md?, lg?, xl? }`. Same `gap` scale as
  `Stack`. `as`: `div` | `ul` | `section`. `align` / `justify`
  pass through to `align-items` / `justify-items`. (STU-45)
- **`PageShell` + `PageHeader` + `PageBody` + `PageFooter`** —
  shadcn-style page composition. `PageShell` is `min-h-screen
  flex flex-col`. `PageHeader` renders `<header>` with sticky-top
  by default. `PageBody` is locked to `<main>` (one landmark per
  page is the contract) and ships built-in horizontal padding via
  `padded` (default `true`). `PageFooter` renders `<footer>` and
  pins to viewport bottom for short content. A skip-link to the
  main content is included by default; visible on keyboard focus
  only. (STU-46)
- **`PageBackground`** — token-driven full-page background switcher.
  `variant`: `default` | `warm` | `warm-muted` | `accent` |
  `inverse`. Renders a `min-h-screen` wrapper with the chosen
  surface token applied; SSR-safe. Variants flip correctly under
  `<html class="dark">` because the underlying tokens already
  rebind. (STU-47)

### Tooling

- `scripts/a11y-runtime-scan.mjs` — re-enables `landmark-one-main`
  per-story for `layout-pageshell--*` stories, so the whole-page
  contract gets verified by the runtime axe scan instead of being
  globally suppressed alongside isolated component previews.

## [0.9.1] - 2026-04-25

Three small follow-ups from the v0.9.0 release sweep. All additive
or maintenance — no breaking changes.

### Added

- `SearchBar` `trailing?: ReactNode` prop. Composes content (typical:
  a `<Kbd>` shortcut hint) into the input's right edge. When the
  input has a value, the Clear button renders to the **left** of
  trailing — closest to the input text. The trailing element is
  rendered as-is; consumers control its a11y semantics. Updated the
  `Kbd` `NextToSearchBar` story to use the new prop instead of an
  absolute-positioned overlay. (STU-20)

### Changed

- Repo `.npmrc`: scope route updated from the legacy `@jens-wedin`
  to `@studio-manfred`. Stale leftover from before the v0.5.0 scope
  rename. (STU-21)

### Security

- Bumped transitive `postcss` to 8.5.10 via `npm audit fix` (lockfile
  only). Clears [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93)
  (XSS via unescaped `</style>` in CSS Stringify). `postcss` is a
  build-only devDep of `vite`; never shipped to consumers. (STU-22)

## [0.9.0] - 2026-04-25

Seven new components closing the gaps surfaced by the Mitt Intranat
dashboard build. Adds the first `--chart-*` token slice. Three new
peer dependencies. Fully additive — no breaking changes.

### Added

- **`Avatar`** — circular identity indicator with image src or
  derived-initials fallback. `role="img"` + required `alt` so screen
  readers announce the user; child `<img>` is `aria-hidden`. Initials
  derive from `name` (or alt), capped at 2 chars; explicit `initials`
  prop overrides. `onError` flips back to initials. Sizes `sm` / `md`
  (default) / `lg`. `brand` variant for inverted brand-blue surface.
- **`Card`** — bordered surface with shadcn-style composition slots:
  `Card` + `CardHeader` + `CardTitle` + `CardDescription` +
  `CardContent` + `CardFooter`. Token-only styling (`bg-card`,
  `text-card-foreground`, `border-border`). Padding `sm` / `md`
  (default) / `lg`. `as` closed-enum (`div` | `article` | `section` |
  `aside`) for landmarks; `CardTitle` has its own `as` for heading
  level. Optional `interactive` prop adds hover/focus styling.
- **`Chart` primitives** — `ChartContainer`, `BarChart`, `DonutChart`,
  `LineChart`, `ChartLegend`, `ChartTooltip`. Thin wrappers around
  Recharts with DS-themed defaults. Built-in a11y: `role="img"` on the
  wrapper with auto-derived `aria-label` summary, visually-hidden
  `<table>` data fallback for screen-reader and keyboard users.
  Honours `prefers-reduced-motion` (disables Recharts animations).
- **`Kbd`** — keyboard-shortcut hint chips. `keys` array renders one
  `<kbd>` per key with a `+` separator (configurable). Decorative by
  default (`aria-hidden="true"`); opt-in announce via
  `aria-hidden={false}` for help-page contexts. Sizes `sm` (default)
  / `md`.
- **`NavBar` + `NavItem`** — app-shell primary navigation. `NavBar`
  wraps a `<nav>` landmark with default `aria-label="Primary"`.
  `NavItem` renders `<a>` by default or any element via the
  polymorphic `as` prop (designed for React Router / Next Link /
  TanStack Router which all spread arbitrary props). Active state
  applies `text-foreground` + 2px underline indicator and auto-sets
  `aria-current="page"`.
- **`Select`** — token-styled dropdown built on
  `@radix-ui/react-select`. Trigger reuses `inputLikeVariants` for
  visual parity with TextInput (sizes `sm` / `md` (default) / `lg`).
  Composition: `Select` + `SelectTrigger` + `SelectValue` +
  `SelectContent` + `SelectItem` + `SelectGroup` + `SelectLabel` +
  `SelectSeparator`. Full WAI-ARIA Listbox pattern (arrow keys, Home /
  End, type-ahead, Escape). `FormField` integration via `id`,
  `aria-invalid`, `aria-describedby` forwarding. Optional
  `leadingIcon` prop. `status="error"` propagates error visuals.
- **`Tabs` / `SegmentedControl`** — built on `@radix-ui/react-tabs`
  (full WAI-ARIA Tabs pattern: roving tabindex, arrow / Home / End,
  `aria-selected`, `aria-controls`). Two visual variants:
  `segmented` (pill switcher with inverted active state) and
  `underline` (2px bottom-border indicator). Sizes `sm` / `md`
  (default). Variant + size live on the root `Tabs` and propagate via
  context to `TabsList` / `TabsTrigger`.
- **Categorical chart palette tokens** — `--chart-1` … `--chart-5`,
  `--chart-axis`, `--chart-grid` at all four token layers (semantic,
  shadcn contract, dark `@media`, dark `:root.dark`, `@theme inline`).
  chart-2 + chart-3 alias the existing feedback success/warning fg
  vars (auto-flip in dark); chart-1 / chart-4 / chart-5 have explicit
  dark overrides. Tuned for 3:1 minimum contrast against background
  (WCAG 1.4.11) and CVD-safe (no red/green pairings).
- New peer dependencies (`peerDependencies` in `package.json`):
  `@radix-ui/react-select` (^2.x), `@radix-ui/react-tabs` (^1.x),
  `recharts` (^3.x). Externalised in `vite.config.ts`; consumers must
  install these in their own tree.

### Notes

- Runtime axe scan (`scripts/a11y-runtime-scan.mjs`): **0 violations
  across 106 stories in both light and dark modes** at release time.
- 60+ new unit tests; full unit suite: 255 tests across 26 files,
  all green.

## [0.8.0] - 2026-04-24

Extends `DatePicker` with a **range mode** for selecting a `from` / `to`
pair in the same popover. Fully backwards-compatible: the existing
single-date API is unchanged and remains the default.

### Added

- `DatePicker` **range mode** via `mode="range"`. Pick a `from` and
  `to` date in the same popover; the trigger renders a single
  arrow-separated value (`2026-04-01 – 2026-04-15`) and shows a
  partial-range display during selection (`2026-04-01 – …`). When
  `name` is provided, the component renders two hidden inputs with
  `_from` / `_to` suffixes so native `<form>` submits get a
  predictable, timezone-neutral ISO pair.
- New type exports: `DatePickerSingleProps`, `DatePickerRangeProps`,
  and `DateRange` (re-exported from `react-day-picker`).

### Changed

- Internal refactor of `DatePicker`: state management extracted into a
  `useDatePickerState` hook with `buildSingleState` / `buildRangeState`
  pure builders. **No breaking changes** — existing `<DatePicker>`
  usage (default `mode="single"`) is fully backwards-compatible.

## [0.7.0] - 2026-04-24

Adds the `DatePicker` component — a single-date picker with a
TextInput-styled popover trigger, localized calendar selection,
`minDate`/`maxDate` constraints, and native form-submit friendliness.
Two new peer dependencies ship with it.

### Added

- `DatePicker` — single-date picker built on `@radix-ui/react-popover`
  and `react-day-picker` v9. Renders a TextInput-styled `<button>`
  trigger (shared `inputLikeVariants` CVA with TextInput) that opens a
  popover calendar. Features:
  - `value` / `defaultValue` / `onValueChange` controlled and
    uncontrolled patterns; `open` / `onOpenChange` mirror the same
    split.
  - `locale` prop accepting a `date-fns` `Locale` (default `sv`).
    `formatValue` callback for custom display formatting (default
    `format(value, 'P', { locale })`).
  - `minDate` and `maxDate` constraints disable out-of-range days in
    both mouse and keyboard navigation.
  - Optional `Today` (jumps the visible month; does not auto-select)
    and `Clear` (clears value + closes) footer actions — both default
    on, both opt-out via `showTodayButton={false}` / `clearable={false}`.
  - `name` prop renders a hidden `<input type="hidden">` sibling
    carrying the ISO `yyyy-MM-dd` string, so native `<form>` submits
    get a predictable, timezone-neutral value regardless of the
    display locale.
  - WAI-ARIA Date Picker Dialog pattern: `role="combobox"` trigger
    with `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`,
    fallback accessible name; `ArrowDown` / `ArrowUp` open the
    popover from a focused trigger; Radix handles focus-into-dialog
    and Escape-to-close.

### Changed

- Internal: extracted `wrapperVariants` from `TextInput.tsx` into the
  shared `src/lib/inputLikeVariants.ts`. `TextInput` imports from the
  new location and continues to export `TextInputSize` /
  `TextInputStatus` derived from the shared variants. No behavior
  change for TextInput consumers — all existing unit tests pass
  verbatim. The new shared CVA is what `DatePicker`'s trigger
  consumes, guaranteeing visual lockstep between the two components.

### Peer dependencies

- Added `react-day-picker` (`^9.0.0`) and `date-fns` (`^4.1.0`) to
  `peerDependencies`. Consumers upgrading to 0.7.0 must install both.
  `react-day-picker` is the canonical shadcn backing for date
  selection; `date-fns` provides the `Locale` type and formatting.
  Both are marked external in the library's Rollup build so they
  stay out of the published bundle.

## [0.6.0] - 2026-04-24

Audit-cleanup release: introduces the brand-logo semantic tokens,
restores the three-layer token contract across all feature files, adds
keyboard-path play functions to the interactive components, and silences
known axe false positives so the Storybook a11y panel stays actionable.
No public component API changed.

### Added

- Brand-logo semantic tokens at the semantic layer (in `./styles`):
  `--color-brand-logo-blue`, `--color-brand-logo-ink`,
  `--color-brand-logo-paper`. Intentionally **not** theme-reactive —
  the logo renders at full-brand fidelity regardless of OS colour
  scheme. Consumers can now reference these directly instead of
  hardcoding the brand hexes.
- A single `--pattern-stripes-overlay` token for the striped
  `ProgressBar` variant, grouped with `--color-bg-overlay` and
  `--shadow-focus` under the new “Effects, overlays & patterns”
  section in `tokens.css`.
- `KeyboardInteraction` stories for `Dialog`, `TextInput`, `Tooltip`,
  and `Checkbox` exercising keyboard and focus paths via
  `storybook/test` (`userEvent` / `within` / `expect`). These run in
  the `storybook` Vitest project and in Storybook’s own test UI.

### Changed

- `Logo` now consumes the new brand-logo tokens instead of the
  hardcoded hex `colorMap`. No public API change.
- Story files (`Spinner`, `Button`, `Logo`) replace inline hex
  backgrounds with semantic tokens — `--color-brand-logo-*` for brand
  demos and `--color-bg-warm` / `--color-bg-warm-muted` for the warm
  surfaces in the Logo background showcase.
- `ProgressBar` references `var(--pattern-stripes-overlay)` via
  Tailwind’s `bg-[image:var(...)]` utility instead of an inline
  `repeating-linear-gradient(...)`.
- Storybook: interactive stories (`Dialog`, `SearchBar`, `TextInput`,
  `Tooltip`, `Checkbox`) re-enable the `region` axe rule locally to
  restore a11y signal that the preview-level global disables
  otherwise hide.
- `vitest.config.ts` path alias unified with `vite.config.ts` — both
  now use `fileURLToPath(new URL('src', import.meta.url))` so the
  `@/*` alias resolves identically in build and test.
- axe false positives silenced in the Storybook a11y panel and the
  runtime scan:
  - `bypass` added to the global disable list (page-level rule,
    same category as the existing `region` /
    `landmark-one-main` / `page-has-heading-one` disables).
  - `aria-valid-attr-value` and `aria-hidden-focus` disabled on the
    `Dialog` meta with inline comments — both are Radix portal /
    focus-guard artefacts, not real defects.
- CI: bumped `actions/checkout` v4 → v6 and `actions/setup-node`
  v4 → v6 to move off the deprecated Node 20 action runtime. Build
  Node bumped 20 → 22 (Node 20 leaves active LTS on 2026-04-30).
  No change to the published package; runs on this release.

### Fixed

- `Checkbox` `KeyboardInteraction` play function now uses
  `userEvent.tab()` for focus and raw `' '` for the Space keypress.
  `'{Space}'` is not a reserved user-event key descriptor and was
  being dispatched as a literal string, so `aria-checked` never
  flipped under the `storybook` (Playwright) test project.

## [0.5.0] - 2026-04-24

**Breaking: package scope and repository owner changed.** The repo moved
to the `Studio-Manfred` GitHub organisation. GitHub Packages requires
the npm scope to match the owner, so the package scope moves from
`@jens-wedin` to `@studio-manfred`. The code, API, and component surface
are unchanged — only the install identifier, scope, and repo URL move.

### Changed

- **Package renamed**: `@jens-wedin/manfred-design-system` →
  `@studio-manfred/manfred-design-system`. Consumers must update their
  `dependencies`, import paths, `.npmrc`, and any CI `setup-node` scope
  to `@studio-manfred`.
- **Repo moved**: `jens-wedin/manfred-design-system` →
  `Studio-Manfred/manfred-design-system`. GitHub auto-redirects the old
  URL, but collaborators should run
  `git remote set-url origin https://github.com/Studio-Manfred/manfred-design-system.git`.
- `publish.yml` `setup-node` scope updated to `@studio-manfred`.
- `package.json` `repository.url` and `homepage` updated to the new
  org URL.
- `README.md` and `docs/CONSUMING.md` install instructions, `.npmrc`
  examples, CI snippet, and troubleshooting all reference the new
  scope and org.

### Migration

Consumers need to update their `package.json`:

```diff
-    "@jens-wedin/manfred-design-system": "^0.4.0"
+    "@studio-manfred/manfred-design-system": "^0.5.0"
```

Imports:

```diff
-import { Button } from '@jens-wedin/manfred-design-system';
+import { Button } from '@studio-manfred/manfred-design-system';
-import '@jens-wedin/manfred-design-system/styles';
+import '@studio-manfred/manfred-design-system/styles';
```

`.npmrc`:

```diff
-@jens-wedin:registry=https://npm.pkg.github.com
+@studio-manfred:registry=https://npm.pkg.github.com
 //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then `npm install`.

The old package (`@jens-wedin/manfred-design-system`) remains published
up to 0.4.0 but will not receive further updates.

## [0.4.0] - 2026-04-24

**Breaking: package and repository renamed.** The code, API, and component
surface are unchanged — only the install identifier and repo URL move.

### Changed

- **Package renamed**: `@jens-wedin/design-system` →
  `@jens-wedin/manfred-design-system`. The `@jens-wedin` scope stays, so
  `.npmrc` and auth setup don't need to change — only the package name
  in `dependencies` (and any import paths) needs updating on consumers.
- **Repo renamed**: `jens-wedin/manfred-design_system` →
  `jens-wedin/manfred-design-system` (underscore replaced with hyphen to
  match the new package name and fit the rest of the GitHub ecosystem's
  conventions). GitHub auto-redirects the old URL, so existing clones
  keep working, but `git remote set-url origin …` is recommended.
- Added `repository` and `homepage` fields to `package.json`.

### Migration

Consumers need to update two lines in their own `package.json`:

```diff
-    "@jens-wedin/design-system": "^0.3.3"
+    "@jens-wedin/manfred-design-system": "^0.4.0"
```

And any imports:

```diff
-import { Button } from '@jens-wedin/design-system';
+import { Button } from '@jens-wedin/manfred-design-system';
-import '@jens-wedin/design-system/styles';
+import '@jens-wedin/manfred-design-system/styles';
```

Then `npm install`.

The old package (`@jens-wedin/design-system`) remains published up to
0.3.3 but will not receive further updates.

## [0.3.3] - 2026-04-24

Documentation-only release. No code or API changes.

### Added

- `docs/CONSUMING.md` — full onboarding walkthrough for teammates who
  want to use the design system in a separate project. Covers
  classic-PAT creation, shell and project setup, a working `.npmrc`,
  CI integration, and troubleshooting for the common 401 / 403 / 404
  install failures.
- README links to `docs/CONSUMING.md` from the Install section.

## [0.3.2] - 2026-04-19

Documentation-only release. No code or API changes.

### Changed

- README restructured around install + use: opens with what the
  library is, how to authenticate to GitHub Packages and install,
  how to import the stylesheet, and a single end-to-end usage
  example. Component reference, token architecture, and v0.1.x →
  v0.2.0 migration details now live in Storybook and the
  changelog.

### Added

- Project guide (`CLAUDE.md`) checked into the repo so contributors
  pick up the conventions (commands, token architecture, test
  setup, a11y policy, publishing flow).
- Session resume point (`MEMORY.md`) at the repo root.
- Historical accessibility audit reports (`A11Y-AUDIT.md`,
  `A11Y-COLOR-AUDIT.md`) from the v0.1.2 era are now tracked.

## [0.3.1] - 2026-04-19

Follow-up polish from the v0.3.0 code review. No API or visual changes.

### Added

- `Dialog.Opened` story: the `play` function now awaits the portaled
  dialog content before completing, preventing flaky axe/coverage
  scans of the opening-animation state on slow CI.
- README: documented that named-colour utilities (`bg-business-blue`,
  `bg-almost-black`, etc.) are brand primitives and do not flip under
  dark — use semantic utilities for theme-reactive surfaces.
- `Logo.tsx`: inline comment explaining that `colorMap` is
  intentionally literal; consumers pick a variant per surface.

### Changed

- Cross-reference comments between `.storybook/preview.ts` and
  `scripts/a11y-runtime-scan.mjs`, so future edits to the axe
  suppression policy stay in sync between the addon panel and the CLI
  scan.

## [0.3.0] - 2026-04-18

Adds dark mode support across the whole component library. Non-breaking:
existing APIs and light-theme visuals are unchanged.

### Added

- Dark mode for every component. Activates from the OS preference
  (`prefers-color-scheme: dark`) by default and can be overridden by an
  explicit `.dark` or `.light` class on `<html>`. Only layer-2 semantic
  tokens rebind; primitives stay put and the shadcn contract flips
  automatically via `var()` indirection. Brand blue shifts from
  `--blue-500` to `--blue-400` on dark for legibility; warm surfaces
  collapse to neutral dark equivalents; feedback colours pair a darker
  background with a lighter foreground to keep the pair ≥4.5:1.
- `--color-bg-overlay` token for modal scrims (50% black in light, 70% in
  dark).
- `:where(body)` baseline — zero-specificity background and foreground so
  icons and controls using `currentColor` inherit the active theme.
- Storybook theme toolbar via `@storybook/addon-themes` with three options:
  System (no class, OS preference wins), Light, and Dark.
- Color Scales page now also lists the warm palette (`--pink`, `--beige`,
  `--beige-light`, `--white`) and the six feedback tokens alongside the blue
  and neutral scales.
- Coverage stories that exercise previously-uncovered branches:
  `Button.AsChild`, `Checkbox.Standalone`, `Dialog.Opened` (with a `play`
  function that clicks the trigger so `DialogContent`/`Overlay`/`Header`/
  `Footer`/`Title`/`Description` mount), `Icon.Labelled`,
  `Radio.StandaloneItems`. Two `SearchBar` unit tests for `fullWidth` and
  `className` pass-through.
- `scripts/a11y-runtime-scan.mjs` — CLI axe-core scan across every story
  via Playwright. Supports `--dark` to run under the dark colour scheme.

### Changed

- `Checkbox` and `Radio` — disabled styling: the opacity-50 fade now
  applies to the control only, so disabled label text stays readable
  (previously 3.22:1 on white).
- `Dialog` overlay — now `bg-[var(--color-bg-overlay)]` instead of a
  hardcoded `bg-black/50`, so it darkens correctly in dark mode.
- `Checkbox` — hardcoded `text-white` in the checked/indeterminate states
  replaced with the `--color-text-on-brand` token.
- Token showcase stories use semantic colour tokens for chrome (labels,
  section headings, swatch borders) so they render correctly in both
  themes.
- Storybook preview removes the `initialGlobals.backgrounds.value: 'white'`
  default so the body background flows from the active theme; alternate
  backgrounds (light beige, pink, brand blue, etc.) can still be selected
  from the toolbar.

### Fixed

- `ProgressBar` `Interactive` story: the range input driving the bar now
  has an `aria-label` (previously reported as a critical axe violation).
- Storybook a11y rule config: `region`, `landmark-one-main`, and
  `page-has-heading-one` disabled globally for isolated story iframes;
  `color-contrast` disabled per-story on the token and typography colour
  showcase stories. Result: **0 runtime axe violations across all 84
  stories in both light and dark modes.**

## [0.2.0] - 2026-04-18

Breaking release: every component is now built on [shadcn/ui](https://ui.shadcn.com)
(Tailwind CSS v4 + Radix UI primitives). See the README for the v0.1.x → v0.2.0
migration table.

### Changed

- **Breaking:** Rebuilt all 17 components on shadcn/ui + Tailwind v4. The CSS
  Modules layer has been removed.
- **Breaking:** Reshaped public APIs for `Modal` → `Dialog`, `Tooltip` (now
  composable with `TooltipProvider`/`TooltipTrigger`/`TooltipContent`),
  `ToastContainer` + `useToast` → `Toaster` + `toast()` (sonner), and `Radio`
  → `RadioGroup` + `RadioGroupItem`.
- **Breaking:** `Checkbox` now forwards `onCheckedChange(state)` (Radix idiom)
  instead of the native `onChange(event)`.
- **Breaking:** Consumers must import the stylesheet explicitly:
  `import '@jens-wedin/manfred-design-system/styles'`.

### Added

- shadcn/ui + Tailwind CSS v4 build foundation, including a three-layer token
  architecture (primitives → semantic → shadcn contract) wired through
  `@theme inline { … }` — no `tailwind.config.js` required.
- jsdom-based unit-test suite with 100% line coverage.

### Removed

- `node_modules/` and `storybook-static/` are no longer tracked in the
  repository.

## [0.1.2] and earlier

See `git log` for the history prior to this changelog.

[0.5.0]: https://github.com/Studio-Manfred/manfred-design-system/releases/tag/v0.5.0
[0.4.0]: https://github.com/Studio-Manfred/manfred-design-system/releases/tag/v0.4.0
[0.3.3]: https://github.com/Studio-Manfred/manfred-design-system/releases/tag/v0.3.3
[0.3.2]: https://github.com/Studio-Manfred/manfred-design-system/releases/tag/v0.3.2
[0.3.1]: https://github.com/Studio-Manfred/manfred-design-system/releases/tag/v0.3.1
[0.3.0]: https://github.com/Studio-Manfred/manfred-design-system/releases/tag/v0.3.0
[0.2.0]: https://github.com/Studio-Manfred/manfred-design-system/releases/tag/v0.2.0
