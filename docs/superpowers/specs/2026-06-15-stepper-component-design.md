# Stepper Component — Design

**Date:** 2026-06-15
**Status:** Approved (brainstorming) → ready for implementation plan
**Component:** `Stepper` (new DS core component)

## Goal

Add a generic, accessible **`Stepper`** to `@studio-manfred/manfred-design-system`: a
data-driven progress indicator for multi-step flows (wizards, checkouts, onboarding).
It generalizes the hardcoded `StepIndicator` currently living in `manfred-find-a-time`
so that component — and any future consumer — can delete its local copy and import the
DS one instead.

## Background

`manfred-find-a-time` ships a local `src/components/step-indicator.tsx`: a display-only
horizontal indicator **hardcoded** to three steps (`'dates' | 'times' | 'share'`). Its
README flags the gap explicitly: *"the library has no Stepper/Wizard component."* The
existing implementation has good bones — `<nav aria-label>` → `<ol>`/`<li>`,
`aria-current="step"`, sr-only "Step N of M", DS contract tokens (`primary`, `border`,
`card`, `muted-foreground`) — but it renders completed and current steps identically and
cannot be reused.

The DS already has `ProgressBar` (a determinate/indeterminate bar); there is **no** name
clash and a stepper is a distinct primitive.

## Non-negotiable: the DS component is fully generic

The DS `Stepper` must NOT encode anything about find-a-time's process:

- No `'dates' | 'times' | 'share'` union, no built-in `STEPS` constant, no fixed labels,
  no fixed step count.
- The find-a-time `WizardStep` type and its Dates/Times/Share labels **stay in the app**.
  The DS component never imports or references them.
- The sole input is a `steps` array supplied by the consumer. The component renders
  whatever it is handed — a 2-step checkout, a 6-step onboarding, anything.

find-a-time becomes a *consumer* that maps its own wizard state to `StepperStep[]`; that
mapping lives in the app, not the DS.

## Scope (v1)

Full-featured:

- Configurable steps (data-driven array).
- **Horizontal and vertical** orientation.
- Distinct visual states: `complete` (checkmark), `current` (highlighted + ring),
  `upcoming` (muted number), `error` (destructive + x-circle).
- Optional **clickable navigation** via `onStepClick`.
- Optional per-step **description** sub-text.

Out of scope for v1 (documented as future): controlled/animated step transitions,
managing the step *content* (the component renders the indicator only, not panels),
non-`<nav>` embedding modes, and a `vertical` "active line fill" animation beyond the
static connector.

## Public API

```ts
export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error';

export interface StepperStep {
  /** Visible label for the step. */
  label: string;
  /** Explicit state for this step — the consumer owns all step state. */
  status: StepStatus;
  /** Optional secondary line rendered under the label. */
  description?: string;
  /** Block interaction even when `onStepClick` is set (escape hatch). */
  disabled?: boolean;
}

export interface StepperProps extends React.HTMLAttributes<HTMLElement> {
  /** Ordered steps. The consumer supplies the full list and each step's status. */
  steps: StepperStep[];
  /** Layout direction. Default: 'horizontal'. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * When provided, eligible steps render as buttons and fire this on activation.
   * Eligible = status is 'complete' | 'current' | 'error' AND not `disabled`.
   * 'upcoming' steps are never interactive (can't jump ahead).
   */
  onStepClick?: (index: number, step: StepperStep) => void;
  /** Names the <nav> landmark. Default: "Progress". */
  'aria-label'?: string;
}
```

**State model:** explicit per-step `status` (consumer-controlled). The component does not
derive completion from an active index — each step declares its own state. This supports
non-linear flows and error steps. If a consumer supplies multiple `current` steps, the
component renders them as-is (no runtime guard in v1).

## Visual design (tokens only — no hardcoded hex)

Per-step **indicator circle** (`size-7` rounded-full, matching the original):

| status     | circle                                                            | glyph / content              |
|------------|-------------------------------------------------------------------|------------------------------|
| `complete` | `border-transparent bg-primary text-primary-foreground`           | `<Icon name="check" />`      |
| `current`  | `border-transparent bg-primary text-primary-foreground` + `ring-2 ring-ring ring-offset-2` | step number (`i + 1`)        |
| `upcoming` | `border-border bg-card text-muted-foreground`                     | step number (`i + 1`)        |
| `error`    | `border-transparent bg-destructive text-destructive-foreground`   | `<Icon name="x-circle" />`   |

**Label:** `current` → `font-semibold text-foreground`; `complete`/`upcoming` →
`text-muted-foreground`; `error` → `text-destructive`. Optional `description` renders
smaller and muted beneath the label.

**Connector** between adjacent steps:
- Horizontal: `h-px w-8 bg-border` (the original treatment).
- Vertical: a vertical line in the left gutter aligned under the circle column.
- The exact "completed connector tint" (`bg-primary` for connectors before the current
  step vs. uniform `bg-border`) is a visual detail to settle during Storybook iteration;
  default to uniform `bg-border` if it complicates the markup.

Any state transitions use the `motion-safe:` prefix per the DS animation convention.

## Accessibility

- Root: `<nav aria-label={ariaLabel ?? 'Progress'}>` → `<ol>` → `<li>` per step.
- `aria-current="step"` on the `<li>` whose status is `current`.
- sr-only `"Step {n} of {total}"` text per step (kept from the original).
- `error` steps append an sr-only `", error"` (or equivalent) so the state is announced,
  not conveyed by color alone.
- Decorative elements (`Icon`, connector) are `aria-hidden`.
- Interactive steps are real `<button type="button">` elements (keyboard + focus for
  free). Non-interactive markup has zero focusable surface.
- Must clear the runtime axe scan (`scripts/a11y-runtime-scan.mjs`) in **light and dark**.

## Architecture & files

Standard DS component layout:

- `src/components/Stepper/Stepper.tsx` — the component. Uses `cva()` for the indicator
  variants keyed on `status`, `React.forwardRef`, and `cn()` from `@/lib/utils`. Variant
  classes reference the contract token utilities above. An internal `StepperItem` helper
  (same file) renders one `<li>`; kept private unless it grows.
- `src/components/Stepper/Stepper.stories.tsx`
- `src/components/Stepper/Stepper.test.tsx`
- `src/components/Stepper/index.ts`
- `src/index.ts` — add runtime export + type export (`Stepper`, `StepperProps`,
  `StepperStep`, `StepStatus`).
- `scripts/play-tiers.json` — assign **Tier B**.

## Testing

**Unit (vitest, jsdom — `unit` project):**

1. Renders a `<nav>` with the default `"Progress"` label and a custom label when passed.
2. Renders all supplied steps with their labels (and descriptions when present).
3. Exactly the `current` step's `<li>` has `aria-current="step"`.
4. `complete` steps render the check icon; `error` steps render the x-circle icon and the
   sr-only error text; `upcoming`/`current` render numbers.
5. With `onStepClick`: clicking a `complete` step calls the handler with the right index +
   step; `upcoming` steps render no button and are not focusable; `disabled` steps render
   no button.
6. `orientation="vertical"` renders (smoke: the vertical container class is present).

**Stories + play functions:**

- `Horizontal` (default), `Vertical`, `WithDescriptions`, `Clickable` (play function
  asserts a click navigates / fires), `ErrorState`, and an interactive Controls story.
- All stories clear the a11y scan in light + dark.

## find-a-time adoption (follow-up — NOT part of this build)

After the DS release, in a separate ticket:

1. Bump the DS dependency in `manfred-find-a-time`.
2. Map `WizardStep` → `StepperStep[]` (before current → `complete`, current → `current`,
   after → `upcoming`) in the wizard.
3. Replace `<StepIndicator current={step} />` with `<Stepper steps={…} />`.
4. Delete `src/components/step-indicator.tsx` + its test; update the README "Custom — no
   DS equivalent" note.

## Publishing

New minor version (additive, zero breaking changes): bump `package.json` version, add a
`CHANGELOG.md` entry, update the README component list, and cut a GitHub Release to trigger
`publish.yml`. Per project convention, confirm before pushing tags / creating the release.
