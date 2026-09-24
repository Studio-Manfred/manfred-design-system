# Session memory

Snapshot of where the repo stands. Update this file at the end of each
working session so the next one picks up cleanly (see `CLAUDE.md` →
Memory).

## 2026-09-24 — FormField context wiring (STU-888)

Branch `feat/stu-888-formfield-context`. New `src/components/FormField/FormFieldContext.ts` (internal, not exported from the barrel): `useFormFieldControl` (single controls) + `useFormFieldGroup` (RadioGroup, registers so the label renders as `<span id>`). Wired: TextInput, Textarea, SelectTrigger, DatePicker, Checkbox, Switch, RadioGroup. Decisions (Jens, 2026-09-24): automatic context, field `status="error"` → control invalid incl. styling (own prop wins), auto `<span>` label for groups. Verified: unit 855/855, coverage 93.71/96.22/94.53/94.63, storybook 268/268 with axe=error, play-tiers ok, build + use-client ok; tsc errors == main (20, all in stories). Not done: VoiceOver spot check (manual), exporting the hooks for custom consumer controls (possible follow-up). Note: AGENTS.md lists MCP tool names (`get-documentation`, `list-all-documentation`, `run-story-tests`) that the servers don't expose; the real ones are `docs-list`, `docs-show`, `test-run`, … Worth a docs fix.

## 2026-09-24 — CI enforces the coverage floor (STU-889)

Branch `ci/stu-889-enforce-coverage-floor`. The CI "Unit tests" step now runs `npm run test:coverage` (unit project + v8 coverage), so the v0.34.0 thresholds (lines 93 / branches 95 / functions 93 / statements 92) gate the required `test` job. Local main: 837 tests, 93.44 / 96.05 / 94.32 / 94.4. Headroom is thin (~0.4 on lines/stmts), so a PR adding untested code will now go red; that's intended. Unreleased (dev tooling only, no version bump needed). Also filed STU-888 (FormField can't label/describe a RadioGroup; message not wired via aria-describedby).

## Current state — 2026-09-23 (test coverage work + STU-875..879 fixes)

- **Latest release:** v0.33.1. Everything below sits under `[Unreleased]`
  in CHANGELOG.md; nothing is published.
- **PR #84 (merged):** branded `npm run test:all` report with the Manfred M
  (`scripts/test-all.mjs`, `scripts/test-report/`).
- **PR #86 (open, pushed) — `test/coverage-gaps`:** coverage config now
  includes `.ts` hooks, tokens and scripts (honest baseline was 71% lines /
  79% branches, now 94.3% / 96.0%); ~220 new unit tests; token drift guard
  `src/tokens/tokens.test.ts`; coverage thresholds in `vitest.config.ts`;
  release scripts refactored to pure functions + `invokedDirectly` guard.
- **`fix/stu-875-879-coverage-bugs` (local, NOT pushed, stacked on #86):**
  fixes for the five bugs the coverage work found, all TDD, reviewed.
  STU-875 useThemeToggle storage best-effort · STU-876 AppHeader dropdown
  aria-current · STU-877 Radio aria-invalid · STU-878 DatePicker end-only
  range · STU-879 tokens export import stripping. 1,138 tests green in
  `npm run test:all`; build clean.
- **Next:** review/merge #86, then push the fix branch and open its PR
  (retarget to main after #86 merges). Then cut a release (fixes are
  consumer-visible → minor or patch; no breaking changes).
- **Open decisions for the user:** RadioGroup group-level invalid prop?
  Wire `test:coverage` into CI? Alert always `role="alert"` (interrupts
  even for info/success); all toasts polite; Button has no default
  `type`; SplitButton group and popover panels unnamed.
- **Needs play functions (jsdom can't):** focus-ring visibility, Tooltip
  hover delay, Radio arrows with real key timing, Stepper name spacing.
- **Env gotcha:** after a Playwright bump run `npx playwright install
  chromium` — otherwise the storybook project "passes" with 0 tests (the
  branded runner now flags this red).

## Previous state — 2026-05-10 (v0.17.0 shipped, STU-113 epic closed)

- **Release:** `v0.17.0` — Wave 3 (final wave) of the
  AI/agent-friendly Storybook surface epic. Published to GitHub
  Packages via `.github/workflows/publish.yml`; Storybook auto-deployed
  to GitHub Pages.
- **Branch:** `main` — clean working tree.
- **Epic STU-113 — AI/agent-friendly Storybook surface — DONE.**
  12 PRs across 3 minor releases (v0.15.0, v0.16.0, v0.17.0) plus
  1 patch (v0.15.1). Zero breaking changes.

### What shipped during the STU-113 epic

**v0.15.0 — Wave 1 (Onramp + autodocs substance, PRs #19–#25)**
- `AGENTS.md` at the repo root — generic on-ramp for non-Claude
  agents (Cursor, Copilot, Windsurf, Cline).
- README refresh — bumped stale "17 components" to "30+", added
  `## AI agents` section.
- JSDoc on every component + ~60 compound sub-parts — rendered into
  autodocs Description blocks via `react-docgen-typescript`.
- Per-prop JSDoc on every Props interface — autodocs prop-table
  description column populated.
- Expanded `argTypes` + per-story descriptions on every story file.

**v0.15.1 — DatePicker popover bg hotfix (PR #26, STU-126)**
- `bg-[var(--color-bg-surface)]` (phantom token) →  `bg-popover`
  (canonical shadcn). Lesson saved to
  [`reference_phantom_token_pitfall`](memory).

**v0.16.0 — Wave 2 (Foundations & narrative, PRs #27–#30)**
- 5 narrative MDX foundation pages — Tokens, Theming, Accessibility,
  Motion, FormPatterns. All under `Foundation/*` in the sidebar.
- 6 new token-group stories — TypographyTokens, SpacingTokens,
  RadiusTokens, MotionTokens, EffectTokens, ChartPalette.
- Refreshed Welcome story with v0.16.0 badge, expanded Foundation
  card (7 links), new "Where to start (for AI agents)" section.

**v0.17.0 — Wave 3 (Machine-readable artifacts, PRs #31–#34)**
- `/llms.txt` at the deploy root — single-URL bootstrap for AI
  agents.
- `/registry.json` at the deploy root — shadcn-shape, 37 entries
  emitted by `scripts/build-registry.mjs` on every build.
- `docs.source.type: 'code'` in `.storybook/preview.ts` — autodocs
  Show-code blocks emit literal story bodies. 4 DatePicker Range
  stories got per-story `'auto'` overrides
  ([reference_source_type_code_spread_cast](memory)).

### Conventions surfaced or reinforced this epic

- **Pilot-then-parallel-batches** for repo-wide template work (see
  [`procedure_pilot_then_parallel_batches`](memory)) — Wave 1
  applied the Button JSDoc template across 36 components in
  ~25 min wall-clock via 4 parallel subagents.
- **Integration-preview branch** for multi-PR waves (see
  [`procedure_integration_preview_branch`](memory)) — local-only
  three-way merge so the user reviews combined state in Storybook
  before merging upstream PRs.
- **Storybook MDX binding patterns** — `<Meta of={...} />` for
  pages with sibling stories, `<Meta title="..." />` for
  narrative-only. Both used in the Foundation/* corpus.

---

## Previous state — 2026-05-09 (v0.14.0 shipped, STU-79 epic closed)

- **Release:** `v0.14.0` — published to GitHub Packages via
  `.github/workflows/publish.yml`. Wave 3 (final wave) of the
  intranet-adoption epic.
- **Branch:** `main` at `8bc2c50` — merged
  `wave/intranet-wave-3` (PR #18). Working tree clean.
- **Epic STU-79 — Add missing components for intranet adoption — DONE.**
  7 components shipped across 3 minor releases (v0.12.0, v0.13.0,
  v0.14.0), zero breaking changes.

### What shipped since the last MEMORY.md snapshot (was 2026-04-25 / v0.9.1)

**v0.10.0 + v0.10.1** (mid-sweep, before STU-79 kickoff)
- `Examples/` epic demo pages (Dashboard, Settings, Landing, Login)
  — HappyPath / Empty / Loading / Error states each (STU-50–STU-53)
- `@storybook/addon-mcp` wired up — Storybook MCP server at
  `localhost:6006/mcp`. CLAUDE.md documents the mandatory workflow.

**v0.11.0** — Storybook polish
- `Welcome` landing story + `storySort` ordering (STU-?)
- Storybook autodocs enabled, "Show code" Source blocks visible
  (STU-55)
- GitHub Pages deploy at
  https://studio-manfred.github.io/manfred-design-system/
  via `.github/workflows/deploy-storybook.yml` (PR #15)
- `Examples/AdvancedForm` — Create-project form demo

**v0.12.0 — Wave 1** (STU-79 epic, branch `wave/intranet-wave-1`)
- `Separator` (STU-96)
- `Label` (STU-97)
- `Textarea` (STU-98)
- `Switch` (STU-99)
- Plus two test fixes: textarea LongContent labelling, datepicker
  empty-range anchoring to April 2026.

**v0.13.0 — Wave 2** (branch `wave/intranet-wave-2`)
- `Sheet` (STU-94)
- `Accordion` (STU-100)

**v0.14.0 — Wave 3** (branch `wave/intranet-wave-3`)
- `NavigationMenu` (STU-95) — 8 sub-parts +
  `navigationMenuTriggerStyle` cva helper. Coexists with `NavBar`
  (NavBar = flat horizontal nav; NavigationMenu = top-bar with
  dropdowns).

### Backlog state

All STU- tickets up through STU-100 are Done. STU-79 epic closed.
No open PRs. No active branches.

### Conventions surfaced or reinforced this sweep

- **Wave-based epic delivery** — multi-component epics are shipped as
  groups of 2–4 components per wave, each wave its own
  `wave/<epic>-wave-N` branch + minor release. Keeps PR diffs small
  and consumer upgrades incremental. Used for STU-79; consider for
  future epics, but ask before defaulting.
- **`motion-safe:` Tailwind gating** — every animated component
  (NavigationMenu, Accordion, Sheet, DatePicker) wraps motion classes
  in `motion-safe:` so `prefers-reduced-motion` kills the animation
  but keeps the state change. Apply to all new animated components.
- **Compound-component cva helper export** — when a compound
  component has a "trigger" sub-part with distinctive styling
  (NavigationMenu's `navigationMenuTriggerStyle`), export the cva so
  consumers can apply the same look to plain links. Matches shadcn
  upstream pattern.

## Package

- `@studio-manfred/manfred-design-system` — 24 components +
  Examples on shadcn/ui + Tailwind v4 + Radix UI primitives
- Peer deps: React 18+, React-DOM 18+
- Public exports: `.` (barrel) + `./styles` (single CSS bundle)
- 6 npm scripts — **no `lint`, no `dev`**:
  `storybook`, `build`, `build-storybook`, `test`, `test:watch`,
  `test:coverage`

## Conventions (inherited from CLAUDE.md)

- Conventional commits (`feat:`/`fix:`/`chore:`/`docs:`/`test:`) —
  breaking changes marked with `!`
- Accessibility is product-level: every new component needs stories
  covering keyboard interaction + screen-reader semantics and must
  clear the runtime a11y scan in both light and dark modes
- Three-layer tokens — never hardcode hex in components; add primitive
  → alias semantic → surface in shadcn contract, then optionally in
  `@theme inline` for Tailwind utilities
- Tests live next to components (`Component.test.tsx`); unit project
  is jsdom, storybook project runs stories in Chromium via Playwright
- `src/test/setup.ts` polyfills Radix-required browser APIs for jsdom
  — don't remove
- New exports must be added to the top-level `src/index.ts` barrel
  (runtime + type export)
- **Storybook MCP first** — query
  `mcp__manfred-design-system__list-all-documentation` /
  `get-documentation` before naming any DS component prop. Never
  hallucinate from naming patterns.

## Useful entry-points for next session

- Tokens: `src/tokens/tokens.css` (the source of truth)
- Component authoring: `src/components/*/` — each folder has
  `Component.tsx` + `Component.stories.tsx` + `Component.test.tsx`
- Storybook config: `.storybook/main.ts` + `.storybook/preview.ts`
- Storybook MCP: `.mcp.json` + `@storybook/addon-mcp`; needs
  Storybook on :6006
- Publishing pipeline: `.github/workflows/publish.yml`
- Public Storybook: https://studio-manfred.github.io/manfred-design-system/
  (auto-deploys on push to main via deploy-storybook.yml)
- Runtime a11y audit: `node scripts/a11y-runtime-scan.mjs [--dark]`
  (needs Storybook running on :6006)

---

## Previous state — 2026-04-25 (v0.9.1 shipped)

- **Release:** `v0.9.1` — published to GitHub Packages via
  `.github/workflows/publish.yml` (run 24926416371, completed
  success).
- **Branch:** `main` at `288d9f1` — synced with `origin/main`, clean
  working tree.
- **Tests:** 258/258 unit tests pass; runtime axe scan **0
  violations** across 142 stories in both light and dark modes; `npm
  audit` 0 vulnerabilities.

### What shipped that day

**v0.9.0** — STU-12 epic closed. Seven new components from the Mitt
Intranat dashboard build:
- Avatar, Card, Chart primitives (Donut/Bar/Line/Legend/Tooltip),
  Kbd, NavBar + NavItem, Select, Tabs / SegmentedControl
- New tokens `--chart-1..5`, `--chart-axis`, `--chart-grid` at all
  four token layers
- New peer deps: `@radix-ui/react-select`, `@radix-ui/react-tabs`,
  `recharts`

**v0.9.1** — three follow-ups:
- STU-20: SearchBar `trailing?: ReactNode` slot (replaces the v0.9.0
  Kbd story's absolute-positioning workaround)
- STU-21: `.npmrc` scope rename `@jens-wedin` → `@studio-manfred`
- STU-22: transitive `postcss` 8.5.6 → 8.5.10 (clears
  GHSA-qx2v-qp2m-jg93)

### Useful gotchas surfaced that session

- Storybook's Vite story-index does NOT auto-recover when branch
  switching removes a `*.stories.tsx`; symptom is a vite-error-overlay
  injected into every page that trips axe's
  `scrollable-region-focusable`. Always kill + restart Storybook between
  branch switches.
