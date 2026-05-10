# Storybook play functions: coverage, consistency, and CI gate

**Date:** 2026-05-10
**Status:** approved (ready for implementation plan)
**Owner:** Jens Wedin (Studio Manfred)
**Linear epic:** to be filed under team "Studio Manfred", project "Studio Manfred Design System"

## Summary

Add `play` functions to every interactive component in the Manfred Design System,
upgrade the existing 22 `play` functions to a shared tier contract, and gate every
PR on a headless run of those tests. Delivered as a three-wave epic following the
STU-113 precedent: foundation+CI first, then coverage fill, then consistency sweep.
No breaking changes — `play` is dev-time only, never enters the published tarball.

## Context

Storybook 10.3.5 is already wired with `@storybook/addon-vitest` and a `storybook`
vitest project that runs play functions in headless Chromium via Playwright. The
config exists; nothing calls it. 22 of 37 components have play functions today,
authored at varying depth (from "trigger renders" to full keyboard regressions).
The remaining 15 split into 10 interactive components needing coverage and 5
layout primitives correctly excluded.

Two constraints from project memory shape this design:

- **Wave-based delivery for >4-component epics** — STU-79 and STU-113 both
  shipped this way with zero breaking changes.
- **Pilot-then-parallel-batches for repo-wide template work** — STU-113 Wave 1
  validated the pattern (36 components in ~25 minutes wall clock).

## Goals and non-goals

### Goals

- Every interactive component has at least one play function meeting its tier.
- Tier assignments are documented and enforced via a permanent CI lint.
- PR pipeline fails on play regression, in the same posture as unit tests.
- Authoring guide exists so future components arrive with play already wired.

### Non-goals

- Visual regression testing (Chromatic, Playwright screenshots) — different
  problem, different tooling.
- Cross-browser play execution — Chromium only, matches existing setup.
- Network mocking in play — none of our components fetch.
- Mobile / touch event simulation — would need a separate tier.
- Coverage % gate — we measure presence per tier, not line %. Story coverage %
  is misleading.
- Gating `publish.yml` (release tag workflow) — PR gate is sufficient.
- Gating `deploy-storybook.yml` (GH Pages deploy) — PR gate is sufficient.

## Tier contract

Every component story file in `src/components/<X>/` must have at least one play
function. The highest-tier story in the file must satisfy that component's tier.

| Tier | Required assertions | Components |
|---|---|---|
| **A — Smoke** | Component renders. Primary affordance is in the DOM with the expected `role` and accessible name. | Avatar, Badge, Icon, Kbd, Label, Logo, ProgressBar, Separator, Spinner, Typography |
| **B — Smoke + interaction** | A + at least one user interaction (click/type/select) producing a state change verified via `expect()`. | Alert, Button, Card, Checkbox, FormField, Radio, SearchBar, Switch, Textarea, TextInput |
| **C — Smoke + interaction + keyboard + ARIA** | B + one keyboard regression (Tab/Escape/Arrow/Space — whichever is natural) + one ARIA assertion (`aria-expanded`, `aria-checked`, `role="dialog"`, etc.). | Accordion, Breadcrumb, Chart, DatePicker, Dialog, NavBar, NavigationMenu, Select, Sheet, Tabs, Toast, Tooltip |

### Excluded (no play required)

Layout primitives whose only contract is CSS layout: **Container, Grid, Stack,
PageShell, PageBackground**. Each gets a comment in its stories file referencing
this exclusion list so future maintainers don't add performative play.

### Tier change process

Tier reassignment requires its own PR updating this spec, before any
implementation PR consumes the new assignment. Reviewers challenge the spec, not
individual story implementations. Prevents bikeshedding mid-wave.

## Authoring conventions

Captured in `docs/PLAY-FUNCTIONS.md`, new in wave 1.

- Imports come from `storybook/test` — the SB10 location. `@storybook/test` is
  removed in this version.
- Portaled content (Dialog, Sheet, Select, Tooltip, DatePicker calendar) is
  queried via `within(document.body)`, not `within(canvasElement)`.
- `findByRole` is preferred over `getByRole` whenever the change is async
  (Radix portal mounting, framer transitions).
- Each `expect()` line gets a one-sentence comment explaining the regression it
  catches — applying the project's a11y-as-product-level philosophy to
  interaction tests.
- **No style assertions in play.** Tailwind v4 silently compiles missing token
  refs to `transparent`, so a `toHaveStyle({ background: ... })` assertion can
  pass against the wrong color. Style is the runtime axe scan's job; play
  asserts behavior (role, aria, text, focus).

## CI gate

### New scripts in `package.json`

```json
"test:storybook": "vitest run --project storybook",
"test:all": "npm run test && npm run test:storybook",
"lint:play-tiers": "node scripts/lint-play-tiers.mjs"
```

### Workflow integration

Extend the existing PR workflow (or add `.github/workflows/ci.yml` if absent)
with a job that runs:

```yaml
- run: npm ci
- uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ hashFiles('package-lock.json') }}
- run: npx playwright install chromium
- run: npm run build-storybook
- run: npm run test:storybook
- run: npm run lint:play-tiers
```

Failure on either step fails the PR check.

### Not gated

- `publish.yml` (release) — assumes PR gates already passed.
- `deploy-storybook.yml` (GH Pages) — same assumption.

## Audit / lint script

`scripts/lint-play-tiers.mjs` is permanent infrastructure (not throwaway). For
each component story file, it parses out `play:` blocks and verifies:

- Component has a play function (or is in the exclusion list).
- The highest-tier story matches the tier contract:
  - **Tier A:** at least one `expect()` involving `getByRole` / `findByRole`.
  - **Tier B:** A + at least one `userEvent.click` / `userEvent.type` /
    `userEvent.selectOptions` followed by an `expect()`.
  - **Tier C:** B + at least one `userEvent.keyboard` or `userEvent.tab` +
    at least one `expect()` referencing an ARIA attribute name.

Tier mapping is read from a single `scripts/play-tiers.json`. Adding a new
component requires either adding it to the mapping or to the exclusion list —
otherwise the lint fails. This is the tripwire for tier drift.

## Wave 1 — Foundation & CI gate

**Branch:** `wave/play-functions-wave-1`
**Release:** v0.18.0
**Coverage delta:** none (no new component play functions).

### Deliverables

1. `package.json` — `test:storybook`, `test:all`, `lint:play-tiers` scripts.
2. `scripts/lint-play-tiers.mjs` + `scripts/play-tiers.json` — tier mapping
   (37 entries) + exclusion list (5 entries) + lint logic.
3. `.github/workflows/ci.yml` — PR job running unit tests, runtime a11y scan
   (existing), `test:storybook`, and `lint:play-tiers`. Playwright cache wired.
4. `docs/PLAY-FUNCTIONS.md` — authoring guide: tier definitions, conventions,
   per-tier templates, troubleshooting (portal queries, async, jsdom-vs-browser).
5. **Audit pass on existing 22 play functions** — run `npm run test:storybook`
   locally, fix anything that fails or is flaky in headless Chromium. Coverage
   is *not* expanded here, only stabilized.
6. `AGENTS.md` + `CLAUDE.md` — short paragraph linking to PLAY-FUNCTIONS.md and
   the new commands.
7. `CHANGELOG.md` v0.18.0 entry — "Storybook play functions now run in CI on
   every PR; tier contract documented."

### Execution model

Sequential — this is infra work, no parallelizable component edits.

### Wave 1 escape hatch

If audit step (5) surfaces more than 5 flaky tests, ship those fixes as a
v0.18.1 patch before starting wave 2. Don't let pre-existing flake bleed into
new coverage work.

## Wave 2 — Coverage fill on missing components

**Branch:** `wave/play-functions-wave-2`
**Release:** v0.19.0
**Coverage delta:** 10 new components.

### Component-tier assignments

| Tier | Components |
|---|---|
| A — smoke | Avatar, Kbd, Separator |
| B — smoke + interaction | Card |
| C — full | Accordion, Breadcrumb, Chart, NavBar, NavigationMenu, Tabs |

### Execution model

Pilot-then-parallel-batches:

1. **Pilot:** Accordion (tier C, hardest case — controlled+uncontrolled,
   keyboard-heavy compound widget). Get user sign-off on the pattern.
2. **Parallel dispatch:** 9 subagents in worktrees, one per remaining
   component. Each writes the play function(s), runs `test:storybook` locally,
   opens a draft PR.
3. **Merge order:** A → B → C — simpler PRs land first, complex ones get more
   review attention.

### Per-PR checklist

- Imports from `storybook/test` (not `@storybook/test`).
- At least one assertion comment explains the regression caught.
- `findByRole` for any portaled / async content.
- `npm run test:storybook -- src/components/<X>` passes locally.
- Storybook UI shows green play indicator on every story.
- `npm run lint:play-tiers` passes.

## Wave 3 — Consistency sweep on existing 22

**Branch:** `wave/play-functions-wave-3`
**Release:** v0.20.0
**Coverage delta:** none — every existing play function brought to its tier.

### Execution model

1. Run `npm run lint:play-tiers --report` to generate `docs/PLAY-AUDIT.md` (a
   transient gap report — deleted at end of wave). For each existing
   component: which tier, which assertions present, which assertions missing.
2. **Pilot** the worst-gap component (likely Toast or Tooltip — both tier C
   portals with thin existing coverage). Get sign-off.
3. **Parallel dispatch in tier batches:** A first, then B, then C. Each
   subagent upgrades its assigned component to its tier — no gold-plating
   beyond tier.
4. End-of-wave: `lint:play-tiers` passes with no warnings; `PLAY-AUDIT.md`
   removed.

### Constraint

No upgrades beyond tier. A tier-A component does not gain keyboard tests
even if "it would be nice" — that's how scope creep ate STU-79's wave 4.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| **CI runtime balloon** — Chromium boot + 37 stories may push PR pipeline past 3 min. | Cache `~/.cache/ms-playwright` keyed on `package-lock.json`. Sharding with `--shard` is a wave-3 contingency, not pre-emptive. |
| **Existing 22 plays flaky in headless Chromium** — they were authored against the SB UI's interactive runner, which is more forgiving than vitest browser mode. | Wave 1 step 5 surfaces this. >5 flakes → v0.18.1 patch before wave 2. |
| **Tier assignment bikeshedding in code review.** | Spec is source of truth. Tier reassignment requires its own PR updating this spec before implementation PR. |
| **Phantom token regression** — `bg-[var(--color-foo)]` compiles to transparent if token is missing. Play could pass against wrong color. | Documented rule in PLAY-FUNCTIONS.md: no style assertions in play. Style is the runtime axe scan's job. |
| **`addon-vitest` stack churn** — vitest 4 + addon-vitest 10.3.5 + browser-playwright 4.0.18 is a stack; SB 11 may move things. | Pin majors in `package.json`. Authoring guide describes intent, not import paths verbatim — survives major bumps. |

## Follow-ups (out of scope, captured for later)

- **Flip `addon-a11y` to `test: 'error'`** — currently `'todo'`. Once play is
  green and stable across waves, a follow-up wave can flip the posture so a11y
  violations also fail PRs. Tracked separately, not part of this epic.
- **Visual regression** — Chromatic or Playwright screenshots. Future epic.
- **Mobile / touch tier** — would need its own wave-shaped epic.

## Linear ticket plan

Filed under team **Studio Manfred**, project **Studio Manfred Design System**:

- **Parent epic** — "Storybook play functions: coverage, consistency, CI gate"
  - Description links to this spec.
  - Sub-tasks: the three wave tickets below.
- **Wave 1 ticket** — "Wave 1 — Play functions: foundation + CI gate (v0.18.0)"
- **Wave 2 ticket** — "Wave 2 — Play functions: coverage fill, 10 components (v0.19.0)"
- **Wave 3 ticket** — "Wave 3 — Play functions: consistency sweep, 22 components (v0.20.0)"

Each wave ticket carries the per-wave deliverables list verbatim from this
spec, the success criteria (release shipped, CI green, lint green), and a
link back to the spec.
