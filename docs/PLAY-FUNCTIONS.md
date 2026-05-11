# Storybook Play Functions

Play functions are the design system's interaction tests. They run inside Storybook (visible in the UI) and headlessly under `npm run test:storybook` (Chromium via Playwright). Both `lint:play-tiers` (regex tier compliance) and `test:storybook` (runtime execution) are required PR gates as of v0.20.1.

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

Prefer `findByRole` over `getByRole` when the change is async (portal mount, transition). `findByRole` retries; `getByRole` doesn't.

### Comment every assertion

Each `expect()` line gets a one-sentence comment explaining what regression it catches. This is the design-system equivalent of a runbook.

```ts
// Tab count (3) mirrors the dialog's focusable elements: close, Cancel, Confirm.
// Update if the dialog render changes.
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
    // Wait for portal — guards against asserting on the opening-animation state.
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
# Inside Storybook UI (preferred during dev — fast feedback, retry-able):
npm run storybook

# Headless Chromium, all stories (CI-gated since v0.20.1):
npm run test:storybook

# One component:
npm run test:storybook -- src/components/Dialog
```

## Lint: tier compliance

```bash
# Reports failures and exits 1 if any component is missing or below its tier.
npm run lint:play-tiers

# Generate docs/PLAY-AUDIT.md instead of failing — used during consistency sweeps.
npm run lint:play-tiers -- --report
```

The mapping lives in `scripts/play-tiers.json`. To add a new component, place it in tier A/B/C or in the excluded list. Otherwise the lint will fail.

The lint matches assertion patterns via regex on the comment-stripped story source. False positives in JSX render bodies (e.g., a static `aria-hidden` attribute satisfying tier C's ARIA check) are a known approximation — see the inline comment on `ARIA_ATTR_RE` in `scripts/lint-play-tiers.mjs`. The intent is captured by the tier contract; the lint is the cheap automation, not the truth.

## Troubleshooting

### "Cannot find module 'storybook/test'"
You're on Storybook < 10.3. Upgrade, or import from `@storybook/test` if pre-10.

### "Element not found" but it's clearly there in the Storybook UI
The element is portaled. Use `within(document.body)` instead of `within(canvasElement)`.

### Test passes locally, fails in CI
Likely a race against an animation. Replace `getByRole` with `findByRole` to wait for the post-animation state.

### Test passes in jsdom, fails in browser project
The unit project (`src/**/*.test.tsx`) runs in jsdom with polyfills from `src/test/setup.ts` (`ResizeObserver`, `PointerEvent`, etc.). The storybook project runs in real Chromium without those polyfills — but Chromium has the real APIs natively. If something breaks here, it's usually because the jsdom test was relying on a polyfill stub instead of the real behavior.

### `npm run test:storybook` hangs or fails with "Browser connection was closed"
Resolved in v0.20.1 via `fileParallelism: false` on the storybook test project in `vitest.config.ts` — see [Storybook #33347](https://github.com/storybookjs/storybook/issues/33347). If the hang reappears with a future vitest upgrade, confirm the workaround is still in place; if so, check the upstream issue for a maintainer fix and remove the workaround once a vitest-side RPC fix is shipped.

### Anchor clicks abort vitest with `[birpc] rpc is closed`
Clicking `<a href="#whatever">` in a play function changes the iframe URL hash, which under vitest browser-mode aborts the file. Replace `userEvent.click(link)` with `link.focus(); expect(link).toHaveFocus()` to verify reachability without navigating. See NavBar/NavigationMenu/Breadcrumb plays for the pattern.

### `getByRole('generic')` finds multiple elements
Decorative wrappers stack `aria-hidden="true"` spans; `getByRole('generic')` is ambiguous when multiple match. Prefer `getByText` against visible content for smoke assertions on decorative components (Kbd, Separator).
