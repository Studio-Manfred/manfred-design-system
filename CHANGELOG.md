# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
