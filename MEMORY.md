# Session memory

Snapshot of where the repo stands. Update this file at the end of each
working session so the next one picks up cleanly (see `CLAUDE.md` →
Memory).

## Current state — 2026-05-09 (v0.14.0 shipped, STU-79 epic closed)

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
