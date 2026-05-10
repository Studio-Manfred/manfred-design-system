# Play Functions Wave 1 — Foundation + CI Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Storybook play functions into the PR CI gate, document the tier contract, and stabilize the existing 22 play functions in headless Chromium — without adding any new component coverage.

**Architecture:** Add three npm scripts (`test:storybook`, `test:all`, `lint:play-tiers`). Build a Node.js lint script that reads a single source-of-truth tier mapping (`scripts/play-tiers.json`) and verifies every component story file meets its tier or is on the exclusion list. Add a single GitHub Actions workflow (`.github/workflows/ci.yml`) that runs unit tests, the runtime a11y scan, the headless Storybook play run, and the tier lint on every PR. Stabilize any flake surfaced by the headless run before shipping v0.18.0.

**Tech Stack:** Node.js 22 (ESM, native), Vitest 4 + `@vitest/browser-playwright` 4, `@storybook/addon-vitest` 10.3.5 (already wired), Storybook 10.3.5, GitHub Actions, Playwright Chromium.

**Linear:** STU-128 (this wave) under STU-127 (epic). Spec: `docs/superpowers/specs/2026-05-10-storybook-play-functions-design.md`.

**Companion Linear tickets to create at execution time:**
- One sub-issue per flake fix surfaced by Task 7 (the audit).

---

## File Structure

**Created:**
- `scripts/play-tiers.json` — tier mapping (37 components → A/B/C, plus exclusion list of 5).
- `scripts/lint-play-tiers.mjs` — Node.js ESM lint script (no deps, pure stdlib).
- `scripts/__tests__/lint-play-tiers.test.mjs` — vitest tests for the lint logic.
- `scripts/__tests__/fixtures/` — synthetic stories files used by the lint tests (one per tier × pass/fail).
- `docs/PLAY-FUNCTIONS.md` — authoring guide.
- `.github/workflows/ci.yml` — PR job.

**Modified:**
- `package.json` — add 3 scripts, bump version to `0.18.0`.
- `vitest.config.ts` — extend unit project `include` to pick up `scripts/__tests__/*.test.mjs`.
- `AGENTS.md` — link to PLAY-FUNCTIONS.md.
- `CLAUDE.md` — short paragraph linking to PLAY-FUNCTIONS.md.
- `CHANGELOG.md` — v0.18.0 entry.
- `src/components/<X>/<X>.stories.tsx` — only those flagged flaky/failing by the audit (number unknown until Task 7 runs).

---

## Task 1: Inspect existing CI surface

**Files:**
- Read: `.github/workflows/publish.yml`, `.github/workflows/deploy-storybook.yml`
- Read: `package.json`
- Read: `vitest.config.ts`

- [ ] **Step 1: Read both existing workflows**

```bash
cat .github/workflows/publish.yml
cat .github/workflows/deploy-storybook.yml
```

Confirm there is no `ci.yml` / `pr.yml` / `test.yml` already running on PRs. If one exists, the plan must extend it instead of creating `ci.yml` — capture its filename and skip Task 9's "create new file" pattern in favor of editing the existing file.

- [ ] **Step 2: Confirm vitest project shape**

```bash
cat vitest.config.ts | grep -A 5 "name: 'storybook'"
```

Expected: `name: 'storybook'` block with `browser.enabled: true`, `playwright({})`, `chromium`. If absent or different, this plan's `npm run test:storybook` command will not work — stop and re-plan.

- [ ] **Step 3: Confirm existing play import path**

```bash
head -10 src/components/Dialog/Dialog.stories.tsx
```

Expected: imports from `'storybook/test'`. If imports are from `'@storybook/test'`, the convention in PLAY-FUNCTIONS.md (Task 8) must be `@storybook/test` instead.

No commit. This task is read-only verification.

---

## Task 2: Create `scripts/play-tiers.json`

**Files:**
- Create: `scripts/play-tiers.json`

- [ ] **Step 1: Write the tier mapping**

```json
{
  "$schema": "./play-tiers.schema.json",
  "tiers": {
    "A": [
      "Avatar",
      "Badge",
      "Icon",
      "Kbd",
      "Label",
      "Logo",
      "ProgressBar",
      "Separator",
      "Spinner",
      "Typography"
    ],
    "B": [
      "Alert",
      "Button",
      "Card",
      "Checkbox",
      "FormField",
      "Radio",
      "SearchBar",
      "Switch",
      "Textarea",
      "TextInput"
    ],
    "C": [
      "Accordion",
      "Breadcrumb",
      "Chart",
      "DatePicker",
      "Dialog",
      "NavBar",
      "NavigationMenu",
      "Select",
      "Sheet",
      "Tabs",
      "Toast",
      "Tooltip"
    ]
  },
  "excluded": [
    "Container",
    "Grid",
    "Stack",
    "PageShell",
    "PageBackground"
  ]
}
```

- [ ] **Step 2: Verify counts match the spec**

```bash
node -e "const m=require('./scripts/play-tiers.json'); console.log('A=' + m.tiers.A.length, 'B=' + m.tiers.B.length, 'C=' + m.tiers.C.length, 'excluded=' + m.excluded.length, 'total=' + (m.tiers.A.length+m.tiers.B.length+m.tiers.C.length+m.excluded.length))"
```

Expected output exactly: `A=10 B=10 C=12 excluded=5 total=37`

- [ ] **Step 3: Verify against the filesystem**

```bash
ls src/components | wc -l
```

Expected: `37`. If the count differs, reconcile — every directory under `src/components/` must appear exactly once across the mapping or the exclusion list.

- [ ] **Step 4: Commit**

```bash
git add scripts/play-tiers.json
git commit -m "chore(play): add tier mapping for play-functions lint"
```

---

## Task 3: Write failing lint test for "missing component is rejected"

**Files:**
- Create: `scripts/__tests__/lint-play-tiers.test.mjs`
- Create: `scripts/__tests__/fixtures/.gitkeep`

- [ ] **Step 1: Add fixture skeleton**

```bash
mkdir -p scripts/__tests__/fixtures
touch scripts/__tests__/fixtures/.gitkeep
```

- [ ] **Step 2: Extend vitest unit project to include scripts tests**

Edit `vitest.config.ts`. In the `unit` project block, change:

```ts
include: ['src/**/*.test.{ts,tsx}'],
```

to:

```ts
include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs'],
```

- [ ] **Step 3: Write the first failing test**

Create `scripts/__tests__/lint-play-tiers.test.mjs`:

```js
import { describe, it, expect } from 'vitest';
import { lintComponent } from '../lint-play-tiers.mjs';

describe('lintComponent — unmapped component', () => {
  it('rejects a component not in mapping or exclusion list', () => {
    const result = lintComponent({
      component: 'Mystery',
      storySource: 'export const Default = {};',
      mapping: { tiers: { A: [], B: [], C: [] }, excluded: [] },
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/not in tier mapping or exclusion list/);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

```bash
npx vitest run --project unit scripts/__tests__/lint-play-tiers.test.mjs
```

Expected: FAIL with `Cannot find module '../lint-play-tiers.mjs'` or similar.

No commit yet — TDD red phase.

---

## Task 4: Implement minimum lint logic to pass Task 3

**Files:**
- Create: `scripts/lint-play-tiers.mjs`

- [ ] **Step 1: Write the minimum module**

```js
// scripts/lint-play-tiers.mjs
// Pure ESM, Node.js 22+, no dependencies.

/**
 * Lint a single component's stories source against the tier contract.
 * @param {{component: string, storySource: string, mapping: object}} input
 * @returns {{ok: boolean, tier?: 'A'|'B'|'C'|'excluded', reason?: string}}
 */
export function lintComponent({ component, storySource, mapping }) {
  if (mapping.excluded.includes(component)) {
    return { ok: true, tier: 'excluded' };
  }
  let tier;
  if (mapping.tiers.A.includes(component)) tier = 'A';
  else if (mapping.tiers.B.includes(component)) tier = 'B';
  else if (mapping.tiers.C.includes(component)) tier = 'C';
  if (!tier) {
    return {
      ok: false,
      reason: `Component "${component}" is not in tier mapping or exclusion list. Add it to scripts/play-tiers.json.`,
    };
  }
  return { ok: true, tier };
}
```

- [ ] **Step 2: Run test to verify it passes**

```bash
npx vitest run --project unit scripts/__tests__/lint-play-tiers.test.mjs
```

Expected: PASS (1 test).

- [ ] **Step 3: Commit**

```bash
git add scripts/lint-play-tiers.mjs scripts/__tests__/lint-play-tiers.test.mjs scripts/__tests__/fixtures/.gitkeep vitest.config.ts
git commit -m "feat(play): add lintComponent with mapping check"
```

---

## Task 5: Add tier-A, tier-B, tier-C assertion checks

**Files:**
- Modify: `scripts/__tests__/lint-play-tiers.test.mjs`
- Modify: `scripts/lint-play-tiers.mjs`

- [ ] **Step 1: Add failing tests for all three tiers**

Append to `scripts/__tests__/lint-play-tiers.test.mjs`:

```js
const mapping = {
  tiers: { A: ['Atom'], B: ['Widget'], C: ['Compound'] },
  excluded: ['Layout'],
};

const NO_PLAY = `
import type { Meta } from '@storybook/react-vite';
const meta = {} satisfies Meta<typeof X>;
export default meta;
export const Default = {};
`;

const TIER_A_PLAY = `
import { within, expect } from 'storybook/test';
export const Default = {
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).getByRole('button')).toBeInTheDocument();
  },
};
`;

const TIER_B_PLAY = `
import { within, userEvent, expect } from 'storybook/test';
export const Default = {
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button');
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('data-state', 'on');
  },
};
`;

const TIER_C_PLAY = `
import { within, userEvent, expect } from 'storybook/test';
export const Default = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
`;

describe('lintComponent — excluded component', () => {
  it('passes regardless of source', () => {
    const r = lintComponent({ component: 'Layout', storySource: NO_PLAY, mapping });
    expect(r.ok).toBe(true);
    expect(r.tier).toBe('excluded');
  });
});

describe('lintComponent — tier A', () => {
  it('rejects when no play function present', () => {
    const r = lintComponent({ component: 'Atom', storySource: NO_PLAY, mapping });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/no play function/i);
  });

  it('passes with smoke play (getByRole + expect)', () => {
    const r = lintComponent({ component: 'Atom', storySource: TIER_A_PLAY, mapping });
    expect(r.ok).toBe(true);
    expect(r.tier).toBe('A');
  });
});

describe('lintComponent — tier B', () => {
  it('rejects tier-A-only play (no userEvent)', () => {
    const r = lintComponent({ component: 'Widget', storySource: TIER_A_PLAY, mapping });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/userEvent/);
  });

  it('passes with click + expect', () => {
    const r = lintComponent({ component: 'Widget', storySource: TIER_B_PLAY, mapping });
    expect(r.ok).toBe(true);
    expect(r.tier).toBe('B');
  });
});

describe('lintComponent — tier C', () => {
  it('rejects tier-B-only play (no keyboard)', () => {
    const r = lintComponent({ component: 'Compound', storySource: TIER_B_PLAY, mapping });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/keyboard/);
  });

  it('rejects keyboard play with no ARIA assertion', () => {
    const noAria = TIER_C_PLAY.replace(`'aria-expanded'`, `'data-state'`);
    const r = lintComponent({ component: 'Compound', storySource: noAria, mapping });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/ARIA/);
  });

  it('passes with click + keyboard + ARIA', () => {
    const r = lintComponent({ component: 'Compound', storySource: TIER_C_PLAY, mapping });
    expect(r.ok).toBe(true);
    expect(r.tier).toBe('C');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run --project unit scripts/__tests__/lint-play-tiers.test.mjs
```

Expected: 1 PASS (the original), 8 FAIL.

- [ ] **Step 3: Extend `lintComponent` to enforce tier rules**

Replace the whole file `scripts/lint-play-tiers.mjs` with:

```js
// scripts/lint-play-tiers.mjs
// Pure ESM, Node.js 22+, no dependencies.

const ARIA_ATTR_RE = /\baria-[a-z]+\b/;
const PLAY_BLOCK_RE = /play\s*:\s*async\s*\(\s*\{[^}]*\}\s*\)\s*=>\s*\{/;
const ROLE_QUERY_RE = /(?:get|find|query)ByRole\s*\(/;
const USER_EVENT_INTERACTION_RE = /userEvent\.(click|type|selectOptions|hover|paste|clear)\b/;
const USER_EVENT_KEYBOARD_RE = /userEvent\.(keyboard|tab)\b/;
const EXPECT_RE = /\bexpect\s*\(/;

/**
 * Lint a single component's stories source against the tier contract.
 * @param {{component: string, storySource: string, mapping: {tiers: {A: string[], B: string[], C: string[]}, excluded: string[]}}} input
 * @returns {{ok: boolean, tier?: 'A'|'B'|'C'|'excluded', reason?: string}}
 */
export function lintComponent({ component, storySource, mapping }) {
  if (mapping.excluded.includes(component)) {
    return { ok: true, tier: 'excluded' };
  }
  let tier;
  if (mapping.tiers.A.includes(component)) tier = 'A';
  else if (mapping.tiers.B.includes(component)) tier = 'B';
  else if (mapping.tiers.C.includes(component)) tier = 'C';
  if (!tier) {
    return {
      ok: false,
      reason: `Component "${component}" is not in tier mapping or exclusion list. Add it to scripts/play-tiers.json.`,
    };
  }

  if (!PLAY_BLOCK_RE.test(storySource)) {
    return {
      ok: false,
      tier,
      reason: `Component "${component}" (tier ${tier}) has no play function in its stories file.`,
    };
  }

  // Tier A: must have a role query + expect.
  if (!(ROLE_QUERY_RE.test(storySource) && EXPECT_RE.test(storySource))) {
    return {
      ok: false,
      tier,
      reason: `Component "${component}" (tier ${tier}) play function missing role query + expect.`,
    };
  }

  if (tier === 'A') {
    return { ok: true, tier };
  }

  // Tier B: A + userEvent interaction.
  if (!USER_EVENT_INTERACTION_RE.test(storySource)) {
    return {
      ok: false,
      tier,
      reason: `Component "${component}" (tier ${tier}) play function missing userEvent interaction (click/type/selectOptions).`,
    };
  }

  if (tier === 'B') {
    return { ok: true, tier };
  }

  // Tier C: B + keyboard + ARIA assertion.
  if (!USER_EVENT_KEYBOARD_RE.test(storySource)) {
    return {
      ok: false,
      tier,
      reason: `Component "${component}" (tier ${tier}) play function missing keyboard regression (userEvent.keyboard or userEvent.tab).`,
    };
  }
  if (!ARIA_ATTR_RE.test(storySource)) {
    return {
      ok: false,
      tier,
      reason: `Component "${component}" (tier ${tier}) play function missing ARIA assertion (e.g. aria-expanded, aria-checked).`,
    };
  }

  return { ok: true, tier };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run --project unit scripts/__tests__/lint-play-tiers.test.mjs
```

Expected: 9 PASS, 0 FAIL.

- [ ] **Step 5: Commit**

```bash
git add scripts/lint-play-tiers.mjs scripts/__tests__/lint-play-tiers.test.mjs
git commit -m "feat(play): enforce tier A/B/C assertion patterns"
```

---

## Task 6: Add filesystem driver + CLI to `lint-play-tiers.mjs`

**Files:**
- Modify: `scripts/lint-play-tiers.mjs`
- Modify: `scripts/__tests__/lint-play-tiers.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add a failing test for `lintAll`**

Append to `scripts/__tests__/lint-play-tiers.test.mjs`:

```js
import { lintAll } from '../lint-play-tiers.mjs';

describe('lintAll — repository walker', () => {
  it('runs against the real repo and returns a result per component', async () => {
    const results = await lintAll();
    // 37 components should produce 37 results.
    expect(results.length).toBe(37);
    // All results must have ok set.
    expect(results.every((r) => typeof r.ok === 'boolean')).toBe(true);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
npx vitest run --project unit scripts/__tests__/lint-play-tiers.test.mjs
```

Expected: 1 NEW FAIL with `lintAll is not a function` or similar.

- [ ] **Step 3: Add `lintAll` and a CLI entry point**

Append to `scripts/lint-play-tiers.mjs`:

```js
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const COMPONENTS_DIR = resolve(REPO_ROOT, 'src/components');
const MAPPING_PATH = resolve(__dirname, 'play-tiers.json');

/**
 * Walk every component directory and lint its stories file.
 * @returns {Promise<Array<{component: string, ok: boolean, tier?: string, reason?: string}>>}
 */
export async function lintAll() {
  const mapping = JSON.parse(await readFile(MAPPING_PATH, 'utf8'));
  const entries = await readdir(COMPONENTS_DIR, { withFileTypes: true });
  const components = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  const results = [];
  for (const component of components) {
    const storyPath = resolve(COMPONENTS_DIR, component, `${component}.stories.tsx`);
    let storySource = '';
    try {
      storySource = await readFile(storyPath, 'utf8');
    } catch {
      results.push({
        component,
        ok: false,
        reason: `No stories file at ${storyPath}.`,
      });
      continue;
    }
    const r = lintComponent({ component, storySource, mapping });
    results.push({ component, ...r });
  }
  return results;
}

/**
 * CLI: prints a one-line summary per failure, exits 1 on any failure.
 * `--report` mode writes docs/PLAY-AUDIT.md and exits 0 even on failures.
 */
async function main() {
  const reportMode = process.argv.includes('--report');
  const results = await lintAll();
  const failures = results.filter((r) => !r.ok);
  const passes = results.filter((r) => r.ok);

  if (reportMode) {
    const lines = [
      '# Play Functions Audit',
      '',
      `Generated by \`npm run lint:play-tiers -- --report\` on ${new Date().toISOString()}.`,
      '',
      `Total: ${results.length}. Passing: ${passes.length}. Failing: ${failures.length}.`,
      '',
      '## Failing components',
      '',
    ];
    for (const f of failures) {
      lines.push(`- **${f.component}** (tier ${f.tier ?? '?'}) — ${f.reason}`);
    }
    if (failures.length === 0) lines.push('_None._');
    lines.push('');
    lines.push('## Passing components');
    lines.push('');
    for (const p of passes) {
      lines.push(`- ${p.component} — tier ${p.tier}`);
    }
    const auditPath = resolve(REPO_ROOT, 'docs/PLAY-AUDIT.md');
    const { writeFile } = await import('node:fs/promises');
    await writeFile(auditPath, lines.join('\n') + '\n', 'utf8');
    console.log(`Wrote ${auditPath} (${failures.length} failing, ${passes.length} passing).`);
    process.exit(0);
  }

  for (const f of failures) {
    console.error(`✗ ${f.component}: ${f.reason}`);
  }
  if (failures.length > 0) {
    console.error(`\n${failures.length} of ${results.length} components failed lint:play-tiers.`);
    process.exit(1);
  }
  console.log(`✓ ${results.length} components pass lint:play-tiers.`);
}

const invokedDirectly = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (invokedDirectly) {
  main().catch((e) => {
    console.error(e);
    process.exit(2);
  });
}
```

- [ ] **Step 4: Add the `lint:play-tiers` script to `package.json`**

In `package.json`, in the `scripts` block, add:

```json
"lint:play-tiers": "node scripts/lint-play-tiers.mjs"
```

- [ ] **Step 5: Run tests + the CLI manually**

```bash
npx vitest run --project unit scripts/__tests__/lint-play-tiers.test.mjs
```

Expected: 10 PASS.

```bash
npm run lint:play-tiers
```

Expected: lists every component currently missing play (the 10 from Wave 2 + any others), exits 1. The list MUST match the spec's Wave 2 component set: Avatar, Kbd, Separator, Card, Accordion, Breadcrumb, Chart, NavBar, NavigationMenu, Tabs. Plus possibly any tier-mismatch issues among the existing 22.

- [ ] **Step 6: Capture the failure list to a worksheet**

```bash
npm run lint:play-tiers 2>&1 | tee /tmp/play-tiers-baseline.txt
```

Save this for reference at the start of Wave 2 — it's the baseline gap.

- [ ] **Step 7: Commit**

```bash
git add scripts/lint-play-tiers.mjs scripts/__tests__/lint-play-tiers.test.mjs package.json
git commit -m "feat(play): add lintAll repo walker + CLI with --report mode"
```

---

## Task 7: Add `test:storybook` and `test:all` scripts; run the headless audit

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add the two scripts**

In `package.json`, in `scripts`, add:

```json
"test:storybook": "vitest run --project storybook",
"test:all": "npm run test && npm run test:storybook"
```

Final `scripts` block must include:

```json
"build": "vite build",
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build && node scripts/build-registry.mjs",
"test": "vitest run --project unit",
"test:watch": "vitest --project unit",
"test:coverage": "vitest run --project unit --coverage",
"test:storybook": "vitest run --project storybook",
"test:all": "npm run test && npm run test:storybook",
"lint:play-tiers": "node scripts/lint-play-tiers.mjs"
```

- [ ] **Step 2: Install Playwright Chromium if not already present**

```bash
npx playwright install chromium
```

Expected: either "Chromium ... is already installed" or a fresh download. Either is fine.

- [ ] **Step 3: Run the headless audit**

```bash
npm run test:storybook 2>&1 | tee /tmp/storybook-audit.txt
```

This is the load-bearing audit step. Expected outcomes:

- **Best case:** all 22 existing play functions pass. Move to Step 4.
- **Likely case:** between 1 and 5 stories fail or are flaky in headless Chromium. Capture each failure: file path, story name, error message. For each, file a Linear sub-issue under STU-128 titled `flake — <Component>.<Story>` and continue this task with one Step-3.x per fix.
- **Bad case:** more than 5 failures. STOP. The wave 1 escape hatch in the spec applies — ship the lint + CI infrastructure as v0.18.0-rc.1 without `test:storybook` in CI, then triage the flake separately as v0.18.1.

- [ ] **Step 3.x (REPEAT for each failure surfaced):** Fix one flaky / failing play function

For each failure in `/tmp/storybook-audit.txt`:

  - [ ] Open `src/components/<Component>/<Component>.stories.tsx`
  - [ ] Identify the cause. Common causes (check in this order):
    1. Portal queried via `within(canvasElement)` instead of `within(document.body)` — Radix portals mount outside the canvas.
    2. `getByRole` used where `findByRole` is needed — async render not awaited.
    3. Animation in flight when assertion runs — wait for an end state (`findByRole` on the post-animation element) rather than a fixed timeout.
    4. jsdom-only API call leaked into a play (e.g., relying on `ResizeObserver` polyfill from `src/test/setup.ts`, which doesn't run in the browser project).
  - [ ] Apply the minimal fix.
  - [ ] Re-run only the failing project: `npx vitest run --project storybook src/components/<Component>/<Component>.stories.tsx`
  - [ ] Expected: PASS.
  - [ ] Add a one-sentence comment above the assertion explaining the regression caught:
    ```ts
    // Wait for portal to mount in document.body before asserting — guards against axe scanning the opening-animation state on slow CI.
    ```
  - [ ] Commit per fix:
    ```bash
    git add src/components/<Component>/<Component>.stories.tsx
    git commit -m "fix(<component>): stabilize play under headless chromium"
    ```

- [ ] **Step 4: Re-run the full audit**

```bash
npm run test:storybook
```

Expected: all stories pass.

- [ ] **Step 5: Commit `package.json`**

```bash
git add package.json
git commit -m "chore(scripts): add test:storybook and test:all"
```

---

## Task 8: Write `docs/PLAY-FUNCTIONS.md`

**Files:**
- Create: `docs/PLAY-FUNCTIONS.md`

- [ ] **Step 1: Write the authoring guide**

Create `docs/PLAY-FUNCTIONS.md`:

```markdown
# Storybook Play Functions

Play functions are the design system's interaction tests. They run inside Storybook (visible in the UI) and headlessly in CI under `npm run test:storybook` (Chromium via Playwright). A failing play fails the PR check.

## Tier contract

Every component story file in `src/components/<X>/` has at least one play function. The highest-tier story must satisfy that component's tier from `scripts/play-tiers.json`.

| Tier | Required assertions |
|---|---|
| **A — Smoke** | Component renders. Primary affordance is in the DOM with the expected `role` and accessible name. |
| **B — Smoke + interaction** | A + at least one user interaction (`click`, `type`, `selectOptions`) producing a state change verified via `expect()`. |
| **C — Smoke + interaction + keyboard + ARIA** | B + one keyboard regression (`userEvent.tab` / `userEvent.keyboard`) + one ARIA assertion (`aria-expanded`, `aria-checked`, `role="dialog"`, etc.). |

Layout primitives (`Container`, `Grid`, `Stack`, `PageShell`, `PageBackground`) are explicitly excluded. They appear under `excluded` in `scripts/play-tiers.json`.

## Conventions

### Imports

Always from `storybook/test`. Never from `@storybook/test` — that path is removed in Storybook 10.

```ts
import { within, userEvent, expect } from 'storybook/test';
```

### Querying portaled content

Radix portals (Dialog, Sheet, Select, DatePicker calendar, Tooltip, popovers) mount in `document.body`, not inside `canvasElement`. Use:

```ts
const dialog = await within(document.body).findByRole('dialog');
```

### Async assertions

Prefer `findByRole` over `getByRole` when the change is async (portal mount, transition, network call — though our components don't fetch). `findByRole` retries; `getByRole` doesn't.

### Comment every assertion

Each `expect()` line gets a one-sentence comment explaining what regression it catches. This is the design-system equivalent of a runbook.

```ts
// Tab count (3) mirrors the dialog's focusable elements: close, Cancel, Confirm. Update if the dialog render changes.
await userEvent.tab();
await userEvent.tab();
await userEvent.tab();
```

### No style assertions

Tailwind v4 silently compiles missing token references to `transparent`, so `expect(el).toHaveStyle({ background: 'rgb(...)' })` can pass against the wrong color. Style is the runtime axe scan's job (`scripts/a11y-runtime-scan.mjs`). Play asserts behavior: `role`, `aria-*`, text, focus.

## Per-tier templates

### Tier A (smoke)

```ts
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Component renders with the right role + accessible name.
    expect(canvas.getByRole('img', { name: /studio manfred/i })).toBeInTheDocument();
  },
};
```

### Tier B (smoke + interaction)

```ts
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('switch');
    // Click flips state — guards against onChange handler regression.
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-checked', 'true');
  },
};
```

### Tier C (smoke + interaction + keyboard + ARIA)

```ts
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /open/i });
    // Click opens the portal.
    await userEvent.click(trigger);
    // Wait for the portal — guards against asserting on the opening-animation state.
    const dialog = await within(document.body).findByRole('dialog');
    expect(dialog).toBeVisible();
    // Tab through to confirm the focus trap is wired.
    await userEvent.tab();
    await userEvent.tab();
    // Escape closes — guards against Radix dismissable layer regression.
    await userEvent.keyboard('{Escape}');
    expect(within(document.body).queryByRole('dialog')).toBeNull();
    // Trigger restored to closed state.
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
```

## Running play tests

```bash
# Headless Chromium, all stories
npm run test:storybook

# One component
npm run test:storybook -- src/components/Dialog

# Watch mode (open in Storybook UI instead — interactive runner is faster)
npm run storybook
```

## Lint: tier compliance

```bash
# Fails the build if any component is missing or below its tier.
npm run lint:play-tiers

# Generate docs/PLAY-AUDIT.md instead of failing — used during consistency sweeps.
npm run lint:play-tiers -- --report
```

The mapping lives in `scripts/play-tiers.json`. To add a new component, place it in tier A/B/C or in the excluded list. Otherwise the lint will fail.

## Troubleshooting

### "Cannot find module 'storybook/test'"
You're on Storybook < 10.3. Upgrade, or import from `@storybook/test` if pre-10.

### "Element not found" but it's clearly there in the Storybook UI
The element is portaled. Use `within(document.body)` instead of `within(canvasElement)`.

### Test passes locally, fails in CI
Likely a race against an animation. Replace `getByRole` with `findByRole` to wait for the post-animation state.

### Test passes in jsdom, fails in browser project
The unit project (`src/**/*.test.tsx`) runs in jsdom with polyfills from `src/test/setup.ts` (`ResizeObserver`, `PointerEvent`, etc.). The storybook project runs in real Chromium without those polyfills — but Chromium has the real APIs natively. If something breaks here, it's usually because the jsdom test was relying on a polyfill stub instead of the real behavior.
```

- [ ] **Step 2: Verify the file renders cleanly**

```bash
head -20 docs/PLAY-FUNCTIONS.md
```

Expected: H1 + first table row visible.

- [ ] **Step 3: Commit**

```bash
git add docs/PLAY-FUNCTIONS.md
git commit -m "docs(play): add play-functions authoring guide"
```

---

## Task 9: Create `.github/workflows/ci.yml`

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v6
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            playwright-${{ runner.os }}-

      - name: Install Playwright Chromium
        run: npx playwright install chromium --with-deps

      - name: Lint play tiers
        run: npm run lint:play-tiers

      - name: Unit tests
        run: npm run test

      - name: Build Storybook
        run: npm run build-storybook

      - name: Storybook play tests
        run: npm run test:storybook

      - name: Runtime a11y scan
        run: |
          npx http-server storybook-static -p 6006 --silent &
          SERVER_PID=$!
          # Wait for the static server to come up.
          for i in $(seq 1 20); do
            if curl -sf http://localhost:6006 > /dev/null; then break; fi
            sleep 0.5
          done
          node scripts/a11y-runtime-scan.mjs
          kill $SERVER_PID || true
```

- [ ] **Step 2: Confirm `http-server` is available or install it**

```bash
node -e "console.log(require.resolve('http-server'))" 2>/dev/null || echo "missing"
```

If `missing`, the runtime a11y scan step won't work. Either:

- Install `http-server` as a devDependency: `npm install --save-dev http-server`, then commit the `package.json` + `package-lock.json` change.
- Or check if the existing a11y scan setup uses a different server. Read `scripts/a11y-runtime-scan.mjs` — if it expects `localhost:6006` to already be live (Storybook in dev mode), the workflow needs `npm run storybook &` instead of `build-storybook` + http-server. **Read the script before committing this workflow.**

If the script expects dev Storybook, replace the `Build Storybook` + `Runtime a11y scan` steps with:

```yaml
      - name: Start Storybook
        run: npm run storybook &
      - name: Wait for Storybook
        run: npx wait-on http://localhost:6006 --timeout 60000
      - name: Runtime a11y scan
        run: node scripts/a11y-runtime-scan.mjs
```

- [ ] **Step 3: Verify the workflow YAML parses**

```bash
node -e "const yaml=require('js-yaml'); const fs=require('fs'); yaml.load(fs.readFileSync('.github/workflows/ci.yml', 'utf8')); console.log('OK')"
```

If `js-yaml` is unavailable, run any YAML-aware tool (`actionlint`, `yamllint`, or even `python -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"`). Expected: `OK`.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add PR workflow with unit + storybook + a11y + lint"
```

---

## Task 10: Update `AGENTS.md` and `CLAUDE.md`

**Files:**
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Read both files to find the right insertion points**

```bash
grep -n "test\|a11y\|story" AGENTS.md | head
grep -n "test\|a11y\|story" CLAUDE.md | head
```

Find the section that already documents test commands. Insert the new paragraph adjacent to it.

- [ ] **Step 2: Add a paragraph to `AGENTS.md`**

Add (under the existing test/commands section):

```markdown
### Storybook play functions

Every interactive component has a play function asserting at least its tier baseline (A: smoke, B: smoke + interaction, C: full keyboard + ARIA). The mapping lives in [scripts/play-tiers.json](scripts/play-tiers.json) and is enforced by `npm run lint:play-tiers`. Play tests run in CI under `npm run test:storybook` (headless Chromium). Authoring conventions: [docs/PLAY-FUNCTIONS.md](docs/PLAY-FUNCTIONS.md).
```

- [ ] **Step 3: Add a paragraph to `CLAUDE.md`**

Add (alongside the existing `test:storybook` mention if there is one — otherwise under the "Commands" section):

```markdown
### Play functions and the tier lint

`npm run test:storybook` runs every story's `play` function in headless Chromium (Playwright). `npm run lint:play-tiers` enforces a presence + tier check from `scripts/play-tiers.json`. Both run on every PR via [.github/workflows/ci.yml](.github/workflows/ci.yml). Authoring guide: [docs/PLAY-FUNCTIONS.md](docs/PLAY-FUNCTIONS.md). When adding a new component to `src/components/`, you must either assign it a tier or add it to the exclusion list — otherwise the lint fails.
```

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md CLAUDE.md
git commit -m "docs: link play-functions guide from AGENTS.md and CLAUDE.md"
```

---

## Task 11: Update `CHANGELOG.md` and bump version

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `package.json`

- [ ] **Step 1: Read the top of CHANGELOG.md**

```bash
head -40 CHANGELOG.md
```

Note the existing format (Keep-a-Changelog or simple). Match it.

- [ ] **Step 2: Add the v0.18.0 entry**

Insert a new section at the top (under the H1, above the previous version):

```markdown
## [0.18.0] - 2026-05-10

### Added
- Storybook play functions now run on every PR via headless Chromium (`npm run test:storybook`).
- New tier lint (`npm run lint:play-tiers`) enforces that every component story file meets its A/B/C tier per [scripts/play-tiers.json](scripts/play-tiers.json) or is on the exclusion list.
- Authoring guide at [docs/PLAY-FUNCTIONS.md](docs/PLAY-FUNCTIONS.md) — tier contract, conventions, per-tier templates, troubleshooting.
- New PR workflow at [.github/workflows/ci.yml](.github/workflows/ci.yml) running unit, play, lint, and runtime a11y checks.

### Changed
- Stabilized N existing play functions for headless Chromium (see commits in this release for the per-component fixes).

### Notes
- This release adds no new component coverage. Component coverage fill ships in v0.19.0 (Wave 2 of [STU-127](https://linear.app/studio-manfred/issue/STU-127)).
- Spec: `docs/superpowers/specs/2026-05-10-storybook-play-functions-design.md`.
```

Replace `N` with the actual count of stabilization fixes from Task 7. If zero fixes were needed, drop the "Changed" section entirely.

- [ ] **Step 3: Bump `version` in `package.json`**

Change `"version": "0.17.0"` to `"version": "0.18.0"`. If the current version is something other than `0.17.0`, use the next minor from whatever is current.

- [ ] **Step 4: Verify the bump**

```bash
node -e "console.log(require('./package.json').version)"
```

Expected: `0.18.0`.

- [ ] **Step 5: Commit (separately, per project convention)**

User memory: "Split release commits by concern, not by file." Two commits:

```bash
git add CHANGELOG.md
git commit -m "docs(changelog): v0.18.0 — play functions in CI"

git add package.json
git commit -m "chore(release): v0.18.0"
```

---

## Task 12: Final pre-PR verification

**Files:** none modified — read-only.

- [ ] **Step 1: Clean working tree check**

```bash
git status
```

Expected: `nothing to commit, working tree clean`.

- [ ] **Step 2: Full local CI dry-run**

```bash
npm run lint:play-tiers
npm run test
npm run test:storybook
```

All three must exit 0. If `lint:play-tiers` fails, it means there is currently a Wave-2 component (Avatar/Kbd/Separator/Card/Accordion/Breadcrumb/Chart/NavBar/NavigationMenu/Tabs) without play — that is **expected** at the end of Wave 1 and indicates that the lint catches gaps as designed. **In that case, leave them failing — Wave 2 fills them.** But this means we cannot merge `ci.yml` to main with `lint:play-tiers` as a blocking step yet, because main itself would fail.

**Decision point:** at the end of Wave 1, the CI workflow includes the lint step but it is **expected to fail on `main` until Wave 2 ships**. Two options:

**Option A (recommended):** ship Wave 1 with `lint:play-tiers` set to `continue-on-error: true` in the workflow, with a comment pointing to STU-129 (Wave 2). Flip it to required at the end of Wave 2.

**Option B:** ship Wave 1 with `lint:play-tiers` enforcing only **presence**, not tier (i.e., a `--lenient` flag that skips the tier-assertion checks). Flip to strict at the end of Wave 3.

Pick A. Edit `ci.yml` to add `continue-on-error: true` on the `Lint play tiers` step:

```yaml
      - name: Lint play tiers
        run: npm run lint:play-tiers
        # Strict tier enforcement is gated by Wave 2 (STU-129) coverage.
        # Flip continue-on-error to false once Wave 2 merges.
        continue-on-error: true
```

Commit:

```bash
git add .github/workflows/ci.yml
git commit -m "ci: lint:play-tiers as soft-fail until Wave 2 (STU-129) lands"
```

- [ ] **Step 3: Re-run dry-run with all gates expected to pass**

```bash
npm run test
npm run test:storybook
```

Both must pass. (`lint:play-tiers` will still fail locally — that's expected and gated.)

- [ ] **Step 4: Push the branch and open the PR**

```bash
git push -u origin wave/play-functions-wave-1
env -u GITHUB_TOKEN gh pr create \
  --base main \
  --title "Wave 1 — Storybook play functions: foundation + CI gate (v0.18.0)" \
  --body "$(cat <<'EOF'
Closes STU-128. Part of STU-127.

Spec: \`docs/superpowers/specs/2026-05-10-storybook-play-functions-design.md\`

## What ships in v0.18.0

- \`npm run test:storybook\` runs all play functions headlessly in CI.
- \`npm run lint:play-tiers\` enforces presence + tier per \`scripts/play-tiers.json\`. **Soft-fail until Wave 2 (STU-129) fills coverage gaps.**
- New PR workflow at \`.github/workflows/ci.yml\` runs unit + play + lint + runtime a11y.
- Authoring guide at \`docs/PLAY-FUNCTIONS.md\`.
- Stabilization fixes for N existing play functions under headless Chromium.

## Out of scope (deliberately)

- New component play coverage — Wave 2 (STU-129).
- Consistency sweep on existing 22 — Wave 3 (STU-130).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**Confirm with user before pushing.** Memory: user wants to be asked before push and tag actions even when the answer is yes.

---

## Self-Review

Spec coverage check:

- ✅ §"Tier contract" → Task 2 (mapping JSON) + Task 5 (assertion patterns).
- ✅ §"Excluded" → Task 2 mapping + Task 5 short-circuit.
- ✅ §"Authoring conventions" → Task 8 (PLAY-FUNCTIONS.md).
- ✅ §"CI gate / new scripts" → Task 6 + Task 7.
- ✅ §"Workflow integration" → Task 9.
- ✅ §"Audit / lint script" → Tasks 3–6.
- ✅ §"Wave 1 deliverables 1–7" → Tasks 2 (mapping), 3–6 (lint), 7 (scripts + audit), 8 (guide), 9 (workflow), 10 (AGENTS/CLAUDE), 11 (CHANGELOG).
- ✅ §"Wave 1 escape hatch" → Task 7 Step 3 bad-case branch.
- ✅ Spec risk "CI runtime balloon" → Playwright cache step in Task 9.
- ✅ Spec risk "existing 22 flaky" → Task 7 Step 3 mid-case branch + Linear sub-issues.
- ✅ Spec risk "phantom token" → PLAY-FUNCTIONS.md "No style assertions" section.
- ⚠️ Spec risk "tier bikeshedding" — handled by spec process, not by code. No task needed.
- ⚠️ Open question raised but not closed in plan: lint-as-soft-fail until Wave 2 (Task 12). Documented decision.

Placeholder scan: no `TBD`, no `TODO`, no "implement later", no orphan references. The `N` in the CHANGELOG entry is an explicit fill-in, scoped and explained.

Type consistency:
- `lintComponent` signature consistent across Tasks 3, 4, 5, 6.
- `lintAll` signature consistent across Tasks 6 and runtime use.
- Mapping schema (`tiers.{A,B,C}`, `excluded`) consistent across `play-tiers.json` (Task 2) and lint code (Tasks 4–6).
- File path `docs/PLAY-AUDIT.md` consistent between Task 6 (write) and the spec's Wave 3 use.

No issues to fix.

---

## Execution Handoff

Plan complete. Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — execute in this session via `superpowers:executing-plans`, batch with checkpoints.

Wave 1 is sequential infra work — no parallelizable component edits — so subagent-driven mostly buys you fresh context per task, not parallelism. Either works.
