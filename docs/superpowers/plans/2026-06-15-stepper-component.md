# Stepper Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a generic, accessible `Stepper` component to the Manfred Design System — a data-driven progress indicator for multi-step flows.

**Architecture:** A single `React.forwardRef` `<nav>` → `<ol>`/`<li>` component (the same idiom as `NavBar`). State is fully consumer-controlled: the caller passes a `steps` array where each step declares its own `status` (`complete` / `current` / `upcoming` / `error`). `cva()` maps status → indicator-circle classes that reference DS contract tokens only. No find-a-time process steps are baked in — the component renders whatever array it is handed.

**Tech Stack:** React 19, TypeScript, `class-variance-authority`, Tailwind v4 (token utilities), the DS `Icon` component, Vitest + Testing Library (unit), Storybook 10 (stories + play functions).

**Spec:** [docs/superpowers/specs/2026-06-15-stepper-component-design.md](../specs/2026-06-15-stepper-component-design.md)

**Branch:** `feat/stepper-component` (already created; the design spec is committed there).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/components/Stepper/Stepper.tsx` | The component, its types (`StepStatus`, `StepperStep`, `StepperProps`), and the `cva` variant maps. One focused file (~150 lines). |
| `src/components/Stepper/index.ts` | Re-export the component + public types. |
| `src/components/Stepper/Stepper.test.tsx` | Unit tests (jsdom, `unit` project). |
| `src/components/Stepper/Stepper.stories.tsx` | Storybook stories + play functions. |
| `src/index.ts` | Barrel: add runtime + type exports (modify). |
| `scripts/play-tiers.json` | Add `"Stepper"` to tier `B` (modify). |
| `README.md` | Add `Stepper` to the component list (modify). |
| `CHANGELOG.md` | New `## [0.30.0]` entry (modify). |
| `package.json` | Version `0.29.0` → `0.30.0` (modify). |

**Out of scope for this plan:** the find-a-time consumer migration (deleting its local `step-indicator.tsx`, mapping `WizardStep` → `StepperStep[]`). That is a separate follow-up ticket, per the spec.

---

## Task 1: Stepper component + unit tests

**Files:**
- Create: `src/components/Stepper/Stepper.tsx`
- Create: `src/components/Stepper/index.ts`
- Create: `src/components/Stepper/Stepper.test.tsx`
- Modify: `src/index.ts` (barrel)

- [ ] **Step 1: Write the failing test file**

Create `src/components/Stepper/Stepper.test.tsx` with the complete suite:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Stepper, type StepperStep } from './Stepper';

const STEPS: StepperStep[] = [
  { label: 'Dates', status: 'complete' },
  { label: 'Times', status: 'current', description: 'Pick slots' },
  { label: 'Share', status: 'upcoming' },
];

describe('Stepper', () => {
  it('renders a nav landmark with the default "Progress" label', () => {
    render(<Stepper steps={STEPS} />);
    expect(screen.getByRole('navigation', { name: 'Progress' })).toBeInTheDocument();
  });

  it('accepts a custom aria-label', () => {
    render(<Stepper steps={STEPS} aria-label="Checkout progress" />);
    expect(
      screen.getByRole('navigation', { name: 'Checkout progress' }),
    ).toBeInTheDocument();
  });

  it('renders every step label', () => {
    render(<Stepper steps={STEPS} />);
    for (const { label } of STEPS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('renders an optional description under the label', () => {
    render(<Stepper steps={STEPS} />);
    expect(screen.getByText('Pick slots')).toBeInTheDocument();
  });

  it('announces position for screen readers', () => {
    render(<Stepper steps={STEPS} />);
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
  });

  it('marks only the current step with aria-current="step"', () => {
    render(<Stepper steps={STEPS} />);
    const items = screen.getAllByRole('listitem');
    const current = items.filter((li) => li.getAttribute('aria-current') === 'step');
    expect(current).toHaveLength(1);
    expect(items[1]).toHaveAttribute('aria-current', 'step');
  });

  it('shows an icon for complete steps and a number for current/upcoming', () => {
    render(<Stepper steps={STEPS} />);
    const items = screen.getAllByRole('listitem');
    // complete step: no visible index number, has an svg icon
    expect(within(items[0]).queryByText('1')).toBeNull();
    expect(items[0].querySelector('svg')).toBeTruthy();
    // current step: shows its number
    expect(within(items[1]).getByText('2')).toBeInTheDocument();
  });

  it('renders an error step with an icon and an sr-only "error" announcement', () => {
    render(
      <Stepper
        steps={[
          { label: 'Dates', status: 'complete' },
          { label: 'Times', status: 'error' },
        ]}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items[1].querySelector('svg')).toBeTruthy();
    expect(within(items[1]).getByText(/, error/)).toBeInTheDocument();
  });

  it('renders no buttons when onStepClick is not provided', () => {
    render(<Stepper steps={STEPS} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('renders eligible steps as buttons and fires onStepClick with index + step', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    render(<Stepper steps={STEPS} onStepClick={onStepClick} />);
    await user.click(screen.getByRole('button', { name: /Dates/ }));
    expect(onStepClick).toHaveBeenCalledWith(0, expect.objectContaining({ label: 'Dates' }));
  });

  it('does not render upcoming steps as buttons (cannot jump ahead)', () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={STEPS} onStepClick={onStepClick} />);
    expect(screen.queryByRole('button', { name: /Share/ })).toBeNull();
  });

  it('does not render disabled steps as buttons', () => {
    const onStepClick = vi.fn();
    render(
      <Stepper
        steps={[{ label: 'Dates', status: 'complete', disabled: true }]}
        onStepClick={onStepClick}
      />,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders the vertical orientation container', () => {
    const { container } = render(<Stepper steps={STEPS} orientation="vertical" />);
    expect(container.querySelector('ol')?.className).toContain('flex-col');
  });

  it('merges an external className onto the nav', () => {
    render(<Stepper steps={STEPS} className="custom-x" />);
    expect(screen.getByRole('navigation').className).toContain('custom-x');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run --project unit src/components/Stepper/Stepper.test.tsx`
Expected: FAIL — `Failed to resolve import "./Stepper"` (file does not exist yet).

- [ ] **Step 3: Implement the component**

Create `src/components/Stepper/Stepper.tsx`:

```tsx
import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/Icon';

/**
 * Status of a single step. The consumer owns each step's state — the
 * component does not derive completion from an active index.
 */
export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error';

/**
 * A single step descriptor passed to {@link Stepper}.
 */
export interface StepperStep {
  /** Visible label for the step. */
  label: string;
  /** Explicit state for this step. */
  status: StepStatus;
  /** Optional secondary line rendered under the label. */
  description?: string;
  /** Block interaction even when `onStepClick` is set (escape hatch). */
  disabled?: boolean;
}

/**
 * Props for the {@link Stepper} component.
 *
 * Inherits every native `<nav>` attribute via
 * `React.HTMLAttributes<HTMLElement>` — pass `id`, `data-*`, etc. directly.
 */
export interface StepperProps extends React.HTMLAttributes<HTMLElement> {
  /** Ordered steps. The consumer supplies the full list and each step's status. */
  steps: StepperStep[];
  /** Layout direction. Default `'horizontal'`. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * When provided, eligible steps render as buttons and call this on
   * activation. Eligible = status `'complete' | 'current' | 'error'` and not
   * `disabled`. `'upcoming'` steps are never interactive (can't jump ahead).
   */
  onStepClick?: (index: number, step: StepperStep) => void;
  /** Names the `<nav>` landmark. Default `'Progress'`. */
  'aria-label'?: string;
}

const indicatorVariants = cva(
  'flex size-7 items-center justify-center rounded-full border text-sm font-medium',
  {
    variants: {
      status: {
        complete: 'border-transparent bg-primary text-primary-foreground',
        current: 'border-transparent bg-primary text-primary-foreground',
        upcoming: 'border-border bg-card text-muted-foreground',
        error: 'border-transparent bg-destructive text-destructive-foreground',
      },
    },
  },
);

const labelVariants = cva('text-sm', {
  variants: {
    status: {
      complete: 'text-muted-foreground',
      current: 'font-semibold text-foreground',
      upcoming: 'text-muted-foreground',
      error: 'font-medium text-destructive',
    },
  },
});

/** Renders the inside of the indicator circle: a check / x-circle icon, or the 1-based step number. */
function StepIndicatorContent({ step, index }: { step: StepperStep; index: number }) {
  if (step.status === 'complete') return <Icon name="check" size="sm" />;
  if (step.status === 'error') return <Icon name="x-circle" size="sm" />;
  return <>{index + 1}</>;
}

/**
 * Generic, data-driven progress indicator for multi-step flows (wizards,
 * checkouts, onboarding). The consumer supplies a `steps` array and each
 * step's `status`; the component renders whatever it is handed — there is no
 * built-in step list.
 *
 * Distinct visual states: `complete` (filled + check), `current` (filled +
 * number, bold label), `upcoming` (outlined + muted number), `error` (filled
 * destructive + x-circle). Optional per-step `description` and optional
 * click-to-navigate via `onStepClick`.
 *
 * Accessibility:
 * - Renders `<nav aria-label>` → `<ol>`/`<li>`; set `aria-label` when more
 *   than one nav landmark exists on the page (default `"Progress"`).
 * - The `current` step's `<li>` gets `aria-current="step"`.
 * - Each step has an sr-only `"Step N of M"`; `error` steps add `", error"` so
 *   the state is announced, not conveyed by colour alone.
 * - Interactive steps are real `<button>`s; non-interactive markup is inert.
 *
 * @example Horizontal wizard
 * ```tsx
 * <Stepper
 *   steps={[
 *     { label: 'Dates', status: 'complete' },
 *     { label: 'Times', status: 'current' },
 *     { label: 'Share', status: 'upcoming' },
 *   ]}
 * />
 * ```
 */
export const Stepper = React.forwardRef<HTMLElement, StepperProps>(function Stepper(
  {
    steps,
    orientation = 'horizontal',
    onStepClick,
    className,
    'aria-label': ariaLabel = 'Progress',
    ...rest
  },
  ref,
) {
  const isVertical = orientation === 'vertical';
  const contentClass = cn('flex gap-2', isVertical ? 'items-start' : 'items-center');

  return (
    <nav ref={ref} aria-label={ariaLabel} className={className} {...rest}>
      <ol className={cn('flex', isVertical ? 'flex-col' : 'items-center')}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const interactive = !!onStepClick && step.status !== 'upcoming' && !step.disabled;

          const inner = (
            <>
              <span aria-hidden="true" className={indicatorVariants({ status: step.status })}>
                <StepIndicatorContent step={step} index={index} />
              </span>
              <span className="sr-only">
                {`Step ${index + 1} of ${steps.length}`}
                {step.status === 'error' ? ', error' : ''}
              </span>
              <span className="flex flex-col">
                <span className={labelVariants({ status: step.status })}>{step.label}</span>
                {step.description && (
                  <span className="text-xs text-muted-foreground">{step.description}</span>
                )}
              </span>
            </>
          );

          return (
            <li
              key={index}
              aria-current={step.status === 'current' ? 'step' : undefined}
              className={isVertical ? 'relative pb-8 last:pb-0' : 'flex items-center gap-2'}
            >
              {interactive ? (
                <button
                  type="button"
                  onClick={() => onStepClick?.(index, step)}
                  className={cn(
                    contentClass,
                    'rounded-[var(--radius-sm)] text-left motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  {inner}
                </button>
              ) : (
                <span className={contentClass}>{inner}</span>
              )}

              {!isLast &&
                (isVertical ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-border"
                  />
                ) : (
                  <span aria-hidden="true" className="h-px w-8 bg-border" />
                ))}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
Stepper.displayName = 'Stepper';
```

Then create `src/components/Stepper/index.ts`:

```ts
export { Stepper } from './Stepper';
export type { StepperProps, StepperStep, StepStatus } from './Stepper';
```

- [ ] **Step 4: Add the barrel exports**

In `src/index.ts`, locate the other `S`-component exports (e.g. `Spinner` / `SplitButton`) and add, keeping alphabetical order:

```ts
export { Stepper } from './components/Stepper';
export type { StepperProps, StepperStep, StepStatus } from './components/Stepper';
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run --project unit src/components/Stepper/Stepper.test.tsx`
Expected: PASS — all 14 tests green.

- [ ] **Step 6: Typecheck the build surface**

Run: `npm run build`
Expected: succeeds; `dist/index.d.ts` includes `Stepper`, `StepperProps`, `StepperStep`, `StepStatus` (rolled-up types). If the build fails on an unknown token utility, re-check the variant class strings against existing usages — every token utility used here (`bg-primary`, `text-primary-foreground`, `border-border`, `bg-card`, `text-muted-foreground`, `text-foreground`, `bg-destructive`, `text-destructive-foreground`, `ring-ring`, `rounded-[var(--radius-sm)]`) is already used elsewhere in the DS.

- [ ] **Step 7: Commit**

```bash
git add src/components/Stepper src/index.ts
git commit -m "feat: add generic Stepper component

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Storybook stories + play-tier coverage

**Files:**
- Create: `src/components/Stepper/Stepper.stories.tsx`
- Modify: `scripts/play-tiers.json`

- [ ] **Step 1: Write the stories file**

Create `src/components/Stepper/Stepper.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, userEvent, fn } from 'storybook/test';
import { Stepper, type StepperStep } from './Stepper';

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Generic, data-driven progress indicator for multi-step flows ' +
          '(wizards, checkouts, onboarding). The consumer supplies a `steps` ' +
          "array and each step's `status` (`complete` / `current` / " +
          '`upcoming` / `error`). Horizontal or vertical, optional per-step ' +
          'descriptions, and optional click-to-navigate via `onStepClick` ' +
          '(only `complete` / `current` / `error` steps are interactive — you ' +
          'can never jump ahead).',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction.',
      table: { defaultValue: { summary: 'horizontal' } },
    },
    steps: { control: 'object', description: 'Ordered step descriptors.' },
    // Display-only stories must NOT receive a handler, or every step becomes a
    // button. Keep onStepClick out of the auto-controls; pass it explicitly in
    // the Clickable story only.
    onStepClick: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const WIZARD: StepperStep[] = [
  { label: 'Dates', status: 'complete' },
  { label: 'Times', status: 'current' },
  { label: 'Share', status: 'upcoming' },
];

export const Playground: Story = {
  args: { steps: WIZARD, orientation: 'horizontal' },
  parameters: {
    docs: {
      description: {
        story: 'Interactive sandbox — edit the steps array and orientation via the Controls panel.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('navigation', { name: 'Progress' })).toBeInTheDocument();
  },
};

export const Horizontal: Story = {
  args: { steps: WIZARD },
  parameters: {
    docs: {
      description: {
        story:
          'Default horizontal layout. Completed steps show a check; the current ' +
          'step shows its number with a bold label; upcoming steps are muted.',
      },
    },
  },
};

export const Vertical: Story = {
  args: { steps: WIZARD, orientation: 'vertical' },
  parameters: {
    docs: {
      description: {
        story: 'Vertical layout for sidebars and mobile flows — the connector becomes a vertical line.',
      },
    },
  },
};

export const WithDescriptions: Story = {
  args: {
    steps: [
      { label: 'Dates', status: 'complete', description: 'Pick candidate days' },
      { label: 'Times', status: 'current', description: 'Set time slots' },
      { label: 'Share', status: 'upcoming', description: 'Send the poll link' },
    ],
    orientation: 'vertical',
  },
  parameters: {
    docs: {
      description: {
        story: 'Optional per-step `description` renders under the label — most legible in the vertical layout.',
      },
    },
  },
};

export const ErrorState: Story = {
  args: {
    steps: [
      { label: 'Dates', status: 'complete' },
      { label: 'Times', status: 'error', description: 'Fix the overlapping slots' },
      { label: 'Share', status: 'upcoming' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'A step in the `error` state shows the destructive token + an x-circle ' +
          'icon and adds an sr-only ", error" so the state is announced, not ' +
          'conveyed by colour alone.',
      },
    },
  },
};

export const Clickable: Story = {
  args: { steps: WIZARD, onStepClick: fn() },
  parameters: {
    docs: {
      description: {
        story:
          'When `onStepClick` is set, completed and current steps become ' +
          'keyboard-focusable buttons. Upcoming steps stay non-interactive — ' +
          'you cannot jump ahead.',
      },
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Dates/ }));
    expect(args.onStepClick).toHaveBeenCalled();
    expect(canvas.queryByRole('button', { name: /Share/ })).toBeNull();
  },
};
```

- [ ] **Step 2: Add the play tier**

In `scripts/play-tiers.json`, add `"Stepper"` to the `"B"` array (alphabetical — after `"SearchBar"`, before `"Switch"`):

```json
    "B": [
      "Alert",
      "AppHeader",
      "Button",
      "Card",
      "Checkbox",
      "FormField",
      "Radio",
      "SearchBar",
      "Stepper",
      "Switch",
      "Textarea",
      "TextInput"
    ],
```

- [ ] **Step 3: Verify tier compliance**

Run: `npm run lint:play-tiers`
Expected: PASS — `Stepper` is recognised as tier B and its stories file has play functions (Playground + Clickable).

- [ ] **Step 4: Verify stories render + a11y is clean**

Start Storybook and run the runtime a11y scan in both themes (the project's a11y gate):

```bash
npm run storybook &        # wait until :6006 is up
node scripts/a11y-runtime-scan.mjs
node scripts/a11y-runtime-scan.mjs --dark
```

Expected: no axe violations on any `Components/Stepper/*` story in light or dark. If the auto-controls inject `onStepClick` into the display-only stories (a global `argTypesRegex` in `.storybook/preview.ts`), the `Horizontal`/`Vertical` stories will render unexpected buttons — verify by checking those stories show no `<button>`s; if they do, the `onStepClick: { control: false }` override needs to also be set per-story. (Then stop the Storybook background process.)

- [ ] **Step 5: Commit**

```bash
git add src/components/Stepper/Stepper.stories.tsx scripts/play-tiers.json
git commit -m "test(stepper): add Storybook stories and play-tier coverage

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Documentation + version bump

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `package.json`

- [ ] **Step 1: Add Stepper to the README component list**

In `README.md`, in the `### Components` list, insert `Stepper` alphabetically between `Spinner` and `Switch`. The relevant line currently reads:

```
ProgressBar · RadioGroup · SearchBar · Select · Separator · Sheet ·
Spinner · Switch · Tabs · TextInput · Textarea · Toaster · Tooltip ·
Typography.
```

Change the second line to:

```
Spinner · Stepper · Switch · Tabs · TextInput · Textarea · Toaster · Tooltip ·
```

- [ ] **Step 2: Add the CHANGELOG entry**

In `CHANGELOG.md`, insert a new version section between `## [Unreleased]` and `## [0.29.0] - 2026-06-08`:

```markdown
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
```

- [ ] **Step 3: Commit the docs (separate from the version bump, per the split-by-concern convention)**

```bash
git add README.md CHANGELOG.md
git commit -m "docs: document the Stepper component (README + CHANGELOG)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 4: Bump the package version**

In `package.json`, change `"version": "0.29.0"` to `"version": "0.30.0"`.

- [ ] **Step 5: Commit the version bump**

```bash
git add package.json
git commit -m "chore: bump version to 0.30.0

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

> **Release is a separate, user-confirmed step — NOT part of plan execution.** Pushing the branch, merging the PR, tagging, and creating the GitHub Release (which triggers `publish.yml` → GitHub Packages) all require explicit user confirmation per project convention. The implementer must stop after Step 5.

---

## Final verification (after all tasks)

- [ ] `npm run test` — full unit suite green (the Stepper tests run under the `unit` project).
- [ ] `npm run lint:play-tiers` — green.
- [ ] `npm run build` — library build succeeds; `Stepper` present in `dist/index.d.ts`.
- [ ] Runtime a11y scan clean for `Components/Stepper/*` in light + dark.

---

## Self-Review (plan author)

**1. Spec coverage** — every spec requirement maps to a task:
- Generic `steps[]` API, no baked-in process → Task 1 component (types + render).
- Explicit per-step `status` (`complete`/`current`/`upcoming`/`error`) → Task 1 `indicatorVariants` + `StepIndicatorContent`.
- Horizontal + vertical → Task 1 `orientation` branch (+ vertical test).
- Completed checkmark / error x-circle / current+upcoming number → Task 1 `StepIndicatorContent` (+ icon tests).
- Optional descriptions → Task 1 (+ description test).
- Clickable navigation, upcoming non-interactive, `disabled` escape hatch → Task 1 `interactive` guard (+ 3 click tests).
- a11y (`<nav>`/`<ol>`/`<li>`, `aria-current="step"`, sr-only position + error) → Task 1 (+ tests) and the Task 2 a11y scan.
- Stories (Horizontal, Vertical, WithDescriptions, Clickable+play, ErrorState, Controls) + Tier B → Task 2.
- Publishing (CHANGELOG, README, version) → Task 3; release gated/confirmed.
- find-a-time adoption → explicitly out of scope (separate ticket).

**2. Placeholder scan** — no TBD/TODO/"handle edge cases"; every code step shows complete code and exact commands with expected output.

**3. Type consistency** — `StepStatus`, `StepperStep`, `StepperProps`, the `status` keys (`complete`/`current`/`upcoming`/`error`), `onStepClick(index, step)`, and the export names are identical across the component, tests, stories, and barrel.
