# Session memory

Snapshot of where the repo stands. Update this file at the end of each
working session so the next one picks up cleanly (see `CLAUDE.md` →
Memory).

## Current state — 2026-04-25 (overnight unattended)

Six new component branches ready for review. None pushed.

| ticket | branch | priority |
|---|---|---|
| STU-14 Select | `jens-wedin/stu-14-add-select-component` | Urgent |
| STU-19 Kbd | `jens-wedin/stu-19-add-kbd-component` | Medium |
| STU-13 Avatar | `jens-wedin/stu-13-add-avatar-component` | High |
| STU-16 Card | `jens-wedin/stu-16-add-card-surface-component` | High |
| STU-15 Tabs | `jens-wedin/stu-15-add-tabs-segmentedcontrol-component` | High |
| STU-18 NavBar | `jens-wedin/stu-18-add-navbar-navitem-components` | High |

All six: unit tests pass, `tsc --noEmit -p tsconfig.build.json` clean,
runtime axe 0 violations in both light + dark, exports added to
`src/index.ts`, dashboard-sketch story present. Linear status moved to
**In Review** with summary comments.

**STU-17 Chart primitives** intentionally left untouched (sibling
under epic STU-12). Reason: requires new `--chart-*` tokens in
`tokens.css` plus Recharts integration — systemic change deserving
user judgment. Tackle in a fresh session.

Suggested push order: STU-14 first (urgent + adds
`@radix-ui/react-select` dep), STU-15 next (adds
`@radix-ui/react-tabs`), then the four dep-free branches in any order.

**Follow-up niggles surfaced (not in scope, worth tracking):**
- `SearchBar` has no `trailing` slot — Kbd story works around it; consider
  adding `trailing?: ReactNode` for native composition.
- `.npmrc` still routes the old `@jens-wedin` scope to GitHub Packages —
  harmless one-line cleanup to `@studio-manfred:registry=...`.
- Storybook's Vite story-index does NOT auto-recover when branch
  switching removes a `*.stories.tsx`; symptom is a vite-error-overlay
  injected into every page that trips axe's
  `scrollable-region-focusable`. Always kill + restart Storybook between
  branch switches.

---

## Previous state — 2026-04-19

- **Release:** `v0.3.1` (published via `.github/workflows/publish.yml`
  to GitHub Packages when a release/tag is pushed)
- **Branch:** `main` at `ca88d65` — synced with `origin/main`, clean
  working tree (only unrelated untracked files, see below)
- **Tests:** 156/156 unit tests pass; 84/84 Storybook browser tests
  pass; runtime axe scan reports **0 violations** in both light and
  dark modes across all 84 stories; `npm audit` **0 vulnerabilities**

## Package

- `@studio-manfred/manfred-design-system` — 17 components on shadcn/ui + Tailwind
  v4 + Radix UI primitives
- Peer deps: React 18+, React-DOM 18+
- Public exports: `.` (barrel) + `./styles` (single CSS bundle)
- 6 npm scripts — **no `lint`, no `dev`**:
  `storybook`, `build`, `build-storybook`, `test`, `test:watch`,
  `test:coverage`

## Recent work (this multi-session sweep)

Most-recent-first, grouped by release:

**v0.3.1 — review polish**
- Dialog.Opened `play` awaits `findByRole('dialog')` so axe doesn't
  scan mid-animation
- Logo.tsx `colorMap` has an explainer comment (brand literals,
  intentionally non-theme-reactive)
- Cross-reference comments between `.storybook/preview.ts` and
  `scripts/a11y-runtime-scan.mjs` to keep the axe-suppression policy
  in sync
- README caveat: named-colour utilities
  (`bg-business-blue`, `bg-almost-black`, `bg-human-pink`, `bg-beige`,
  `bg-light-beige`) don't flip under dark

**v0.3.0 — dark mode**
- Token architecture in `src/tokens/tokens.css` (470 lines) — dark
  block duplicated across `@media (prefers-color-scheme: dark)
  :root:not(.light)` + `:root.dark`; baseline `:where(body)` sets
  background/foreground so `currentColor` icons inherit the theme
- `@storybook/addon-themes` with 3-state toolbar (System/Light/Dark);
  `defaultTheme: 'system'` → empty class → OS preference wins
- Dialog overlay via `--color-bg-overlay` token (0.5 light / 0.7 dark)
- Checkbox checked state uses `--color-text-on-brand` token
- Color Scales story lists warm palette + feedback tokens
- `scripts/a11y-runtime-scan.mjs` — Playwright CLI that scans every
  story via `/index.json`; accepts `--dark` via `colorScheme`
  emulation

**v0.2.0 — shadcn/ui migration** (was before this sweep but informs
current architecture)

## Ongoing / untracked

Files sitting in the working tree that aren't release-scoped:

- `CLAUDE.md` — project rules; should be committed (teammates need it)
- `A11Y-AUDIT.md`, `A11Y-COLOR-AUDIT.md` — audit reports from v0.1.2
  era; most findings are now resolved, but historical record is useful
- `.claude/settings.json` — project-shared Claude Code config (likely
  safe to commit)
- `.claude/settings.local.json` — personal overrides, should be
  gitignored (Claude Code convention)
- `pencil/images/`, `pencil/landing pages.pen` — in-progress design
  files; `pencil/` is already tracked so these are additions

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

## Useful entry-points for next session

- Tokens: `src/tokens/tokens.css` (the source of truth; 470 lines)
- Component authoring: `src/components/*/` — each folder has
  `Component.tsx` + `Component.stories.tsx` + `Component.test.tsx`
- Storybook config: `.storybook/main.ts` + `.storybook/preview.ts`
- Publishing pipeline: `.github/workflows/publish.yml`
- Runtime a11y audit: `node scripts/a11y-runtime-scan.mjs [--dark]`
  (needs Storybook running on :6006)
