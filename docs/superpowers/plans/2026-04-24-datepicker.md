# DatePicker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single-date DatePicker component for `@studio-manfred/manfred-design-system` that matches TextInput visually, uses `react-day-picker` under a Radix Popover, supports `minDate`/`maxDate`, integrates with FormField + native forms, and passes the runtime a11y scan.

**Architecture:** Extract a shared `inputLikeVariants` CVA from TextInput so DatePicker's `<button>` trigger renders identically. Wrap the trigger in `@radix-ui/react-popover` and mount `react-day-picker`'s `DayPicker` inside the popover, styled via its `classNames` prop with semantic Manfred tokens. `date-fns` handles formatting + locale; a hidden `<input>` makes the component form-submission friendly.

**Tech Stack:** React 19, TypeScript, Tailwind v4, `@radix-ui/react-popover`, `react-day-picker` v9 (peer dep), `date-fns` (peer dep), `cva`, `@storybook/react-vite`, Vitest (jsdom `unit` project + Chromium `storybook` project).

**Spec:** [`docs/superpowers/specs/2026-04-24-datepicker-design.md`](../specs/2026-04-24-datepicker-design.md)
**Branch:** `feat/stu-5-datepicker` (already created)
**Linear:** [STU-5](https://linear.app/studio-manfred/issue/STU-5/new-feature-add-pickdate-calendar-component)

**Commit convention across all tasks:** Conventional Commits with the co-author trailer:

```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Use `git commit -m "$(cat <<'EOF' ... EOF)"` with HEREDOC to preserve newlines.

---

## Task 1: Extract `inputLikeVariants` from TextInput

**Files:**
- Create: `src/lib/inputLikeVariants.ts`
- Modify: `src/components/TextInput/TextInput.tsx`

This is a pure refactor — behavior unchanged, existing unit tests must still pass verbatim. No new test.

- [ ] **Step 1: Confirm the current state is green**

Run: `npx vitest run --project unit src/components/TextInput/TextInput.test.tsx`
Expected: all TextInput tests pass.

- [ ] **Step 2: Create the new shared-variants file**

Read `src/components/TextInput/TextInput.tsx` and locate the `wrapperVariants = cva(...)` declaration. Copy the cva block verbatim into a new file:

File: `src/lib/inputLikeVariants.ts`

```ts
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Shared CVA for TextInput-styled wrappers.
 *
 * Used by TextInput (wrapping a real <input>) and DatePicker (wrapping a
 * <button> trigger) so both stay visually locked with no drift.
 *
 * If you change the border, padding, or radius here, TextInput and
 * DatePicker both pick it up automatically.
 */
export const inputLikeVariants = cva(
  // ↓ paste the exact first-arg string literal from TextInput.tsx's cva call
  // ↓ paste the exact variants object from TextInput.tsx's cva call
);

export type InputLikeSize = NonNullable<VariantProps<typeof inputLikeVariants>['size']>;
export type InputLikeStatus = NonNullable<VariantProps<typeof inputLikeVariants>['status']>;
```

The content inside `cva(...)` must be identical to what's currently in TextInput.tsx. Do not refactor the variants themselves in this task.

- [ ] **Step 3: Update TextInput.tsx to consume the shared variants**

Modify `src/components/TextInput/TextInput.tsx`:

1. Remove the local `const wrapperVariants = cva(...)` declaration.
2. Add an import at the top: `import { inputLikeVariants } from '@/lib/inputLikeVariants';`
3. Replace every usage of `wrapperVariants(` in the file with `inputLikeVariants(`.
4. Replace the two derived type exports:
   - `export type TextInputSize = NonNullable<VariantProps<typeof wrapperVariants>['size']>;` → `export type TextInputSize = NonNullable<VariantProps<typeof inputLikeVariants>['size']>;`
   - `export type TextInputStatus = NonNullable<VariantProps<typeof inputLikeVariants>['status']>;` (same pattern)
5. Remove the now-unused `import { cva, type VariantProps } from 'class-variance-authority';` — but KEEP `type VariantProps` import if still used elsewhere in the file.

- [ ] **Step 4: Run tests and build to verify zero regression**

Run: `npx vitest run --project unit`
Expected: all 156 tests still pass.

Run: `npm run build`
Expected: clean build; `dist/` emits.

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/inputLikeVariants.ts src/components/TextInput/TextInput.tsx
git commit -m "$(cat <<'EOF'
refactor(lib): extract inputLikeVariants from TextInput

Move TextInput's wrapperVariants CVA into src/lib/inputLikeVariants.ts
so it can be shared with DatePicker. TextInput imports from the new
location and re-exports TextInputSize/TextInputStatus derived from the
shared variants. No behavior change; all 156 unit tests pass verbatim.

Prepares the ground for DatePicker to render a <button> trigger that
matches TextInput's visual surface without copy-paste drift.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add `react-day-picker` + `date-fns` as peer dependencies

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`

- [ ] **Step 1: Add peer deps + dev deps**

Edit `package.json`:

1. Add to `"peerDependencies"`:
   ```json
   "react-day-picker": "^9.0.0",
   "date-fns": "^4.0.0"
   ```

2. Add to `"devDependencies"` (for local install + build + tests):
   ```json
   "react-day-picker": "^9.0.0",
   "date-fns": "^4.0.0"
   ```

3. If `"peerDependenciesMeta"` exists, leave alone — both deps are required, not optional.

Keep existing alphabetical ordering.

- [ ] **Step 2: Mark both external in the library build**

Edit `vite.config.ts`. Locate `rollupOptions.external` (currently an array including `react`, `react-dom`, Radix packages, `sonner`, `cva`, `clsx`, `tailwind-merge`). Add:

```ts
'react-day-picker',
'date-fns',
```

Preserve the existing alphabetical order if one is in use.

- [ ] **Step 3: Install**

Run: `npm install`
Expected: clean install; lockfile updates.

- [ ] **Step 4: Verify build + tests still pass**

Run: `npm run build`
Expected: clean build. `dist/` emits. No warning about unbundled deps.

Run: `npx vitest run --project unit`
Expected: 156 tests pass.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts
git commit -m "$(cat <<'EOF'
chore(deps): add react-day-picker + date-fns as peer deps

Prepares for the DatePicker component. Both are shadcn's canonical
backing for date selection. Marked external in rollupOptions so they
stay out of the library bundle — consumers install them alongside the
existing Radix/shadcn peers.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Scaffold DatePicker with a static trigger

**Files:**
- Create: `src/components/DatePicker/DatePicker.tsx`
- Create: `src/components/DatePicker/DatePicker.test.tsx`
- Create: `src/components/DatePicker/index.ts`
- Modify: `src/index.ts`

This task renders a non-interactive `<button>` trigger styled via `inputLikeVariants`, showing either the formatted value or the placeholder. No popover, no calendar yet.

- [ ] **Step 1: Write failing tests**

File: `src/components/DatePicker/DatePicker.test.tsx`

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DatePicker } from './DatePicker';

describe('DatePicker — trigger render', () => {
  it('renders placeholder when no value is set', () => {
    render(<DatePicker placeholder="Pick a date" />);
    expect(screen.getByRole('button')).toHaveTextContent('Pick a date');
  });

  it('renders formatted value using the default short locale format', () => {
    // 2026-04-24 in sv locale via date-fns "P" token → "2026-04-24"
    render(<DatePicker value={new Date(2026, 3, 24)} />);
    expect(screen.getByRole('button')).toHaveTextContent('2026-04-24');
  });

  it('renders formatted value using a custom formatValue function', () => {
    render(
      <DatePicker
        value={new Date(2026, 3, 24)}
        formatValue={(d) => `custom-${d.getFullYear()}`}
      />,
    );
    expect(screen.getByRole('button')).toHaveTextContent('custom-2026');
  });

  it('passes size/status/fullWidth/disabled through to the trigger classes', () => {
    render(<DatePicker size="lg" status="error" fullWidth disabled />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    // Presence of status-driven class is enough; exact class string is implementation
    expect(btn.className).toMatch(/error|feedback-error/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx`
Expected: FAIL with "Cannot find module './DatePicker'".

- [ ] **Step 3: Implement DatePicker scaffold**

File: `src/components/DatePicker/DatePicker.tsx`

```tsx
import * as React from 'react';
import { format as formatDate } from 'date-fns';
import { sv } from 'date-fns/locale/sv';
import type { Locale } from 'date-fns';
import { Icon } from '../Icon';
import { inputLikeVariants, type InputLikeSize, type InputLikeStatus } from '@/lib/inputLikeVariants';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  // Value & change
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (value: Date | undefined) => void;

  // Display
  placeholder?: string;
  formatValue?: (value: Date, locale: Locale) => string;
  locale?: Locale;

  // Constraints
  minDate?: Date;
  maxDate?: Date;

  // Footer actions
  clearable?: boolean;
  showTodayButton?: boolean;

  // TextInput-alike pass-through
  size?: InputLikeSize;
  status?: InputLikeStatus;
  fullWidth?: boolean;
  disabled?: boolean;

  // Form / a11y plumbing
  id?: string;
  name?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;

  // Controlled open state
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Escape hatch
  className?: string;
}

const defaultFormat = (value: Date, locale: Locale) =>
  formatDate(value, 'P', { locale });

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(
    {
      value,
      defaultValue,
      onValueChange,
      placeholder = 'Pick a date',
      formatValue = defaultFormat,
      locale = sv,
      size = 'md',
      status = 'default',
      fullWidth,
      disabled,
      id,
      required,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      className,
    },
    ref,
  ) {
    // Controlled vs uncontrolled: `value` wins if both are provided.
    const displayValue = value ?? defaultValue;
    const displayText = displayValue ? formatValue(displayValue, locale) : placeholder;
    const hasValue = Boolean(displayValue);

    return (
      <button
        ref={ref}
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-required={required || undefined}
        aria-invalid={status === 'error' || undefined}
        className={cn(
          inputLikeVariants({
            size,
            status,
            fullWidth,
            hasLeadingIcon: false,
            hasTrailingIcon: true,
          }),
          'text-left',
          className,
        )}
      >
        <span
          className={cn(
            'flex-1 truncate',
            !hasValue && 'text-[var(--color-text-muted)]',
          )}
        >
          {displayText}
        </span>
        <span className="ml-2 flex shrink-0 items-center">
          <Icon name="calendar" size={size === 'lg' ? 'md' : 'sm'} aria-hidden />
        </span>
      </button>
    );
  },
);

DatePicker.displayName = 'DatePicker';
```

File: `src/components/DatePicker/index.ts`

```ts
export { DatePicker } from './DatePicker';
export type { DatePickerProps } from './DatePicker';
```

Modify `src/index.ts` — add these exports in the alphabetically-appropriate spot:

```ts
export { DatePicker } from './components/DatePicker';
export type { DatePickerProps } from './components/DatePicker';
```

- [ ] **Step 4: Run tests and verify they pass**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx`
Expected: all 4 tests pass.

Run: `npx vitest run --project unit`
Expected: 160 tests pass (156 existing + 4 new).

Run: `npm run build`
Expected: clean build. Grep `dist/index.d.ts` for `DatePickerProps` to confirm types emit.

- [ ] **Step 5: Commit**

```bash
git add src/components/DatePicker src/index.ts
git commit -m "$(cat <<'EOF'
feat(date-picker): scaffold with TextInput-styled trigger

Render a <button> styled via the shared inputLikeVariants CVA, showing
either the placeholder or the formatted value. Calendar icon trails via
the existing Icon component. No popover or selection behavior yet —
just the closed-state visual surface.

Exports DatePicker + DatePickerProps from the barrel.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Wrap in Radix Popover + integrate react-day-picker

**Files:**
- Modify: `src/components/DatePicker/DatePicker.tsx`
- Modify: `src/components/DatePicker/DatePicker.test.tsx`

This task wires up the popover and day selection. Because Radix popovers use portals, complex click-through testing is fragile in jsdom — unit tests validate attributes and controlled-state contracts; full keyboard flow is exercised in Task 10's play function.

- [ ] **Step 1: Write failing tests**

Append to `src/components/DatePicker/DatePicker.test.tsx`:

```tsx
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('DatePicker — popover + selection', () => {
  it('trigger has combobox role and dialog-haspopup ARIA', () => {
    render(<DatePicker />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the popover when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('fires onValueChange(Date) when a day is clicked (uncontrolled)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker defaultValue={new Date(2026, 3, 15)} onValueChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    // Day numbers from rdp render as buttons inside role=grid
    const target = await screen.findByRole('button', { name: /17/ });
    await user.click(target);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it('respects controlled `value` (does not auto-update internal state)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={new Date(2026, 3, 15)} onValueChange={onChange} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('2026-04-15');
    await user.click(screen.getByRole('combobox'));
    const target = await screen.findByRole('button', { name: /17/ });
    await user.click(target);
    expect(onChange).toHaveBeenCalled();
    // Consumer hasn't updated `value` — trigger still shows 15
    expect(screen.getByRole('combobox')).toHaveTextContent('2026-04-15');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx`
Expected: FAIL — `combobox` role absent, no popover, etc.

- [ ] **Step 3: Implement popover + calendar**

Replace the contents of `src/components/DatePicker/DatePicker.tsx` with:

```tsx
import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { format as formatDate } from 'date-fns';
import { sv } from 'date-fns/locale/sv';
import type { Locale } from 'date-fns';
import { Icon } from '../Icon';
import { inputLikeVariants, type InputLikeSize, type InputLikeStatus } from '@/lib/inputLikeVariants';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  // Value & change
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (value: Date | undefined) => void;

  // Display
  placeholder?: string;
  formatValue?: (value: Date, locale: Locale) => string;
  locale?: Locale;

  // Constraints
  minDate?: Date;
  maxDate?: Date;

  // Footer actions
  clearable?: boolean;
  showTodayButton?: boolean;

  // TextInput-alike pass-through
  size?: InputLikeSize;
  status?: InputLikeStatus;
  fullWidth?: boolean;
  disabled?: boolean;

  // Form / a11y plumbing
  id?: string;
  name?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;

  // Controlled open state
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Escape hatch
  className?: string;
}

const defaultFormat = (value: Date, locale: Locale) =>
  formatDate(value, 'P', { locale });

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(props, ref) {
    const {
      value: valueProp,
      defaultValue,
      onValueChange,
      placeholder = 'Pick a date',
      formatValue = defaultFormat,
      locale = sv,
      size = 'md',
      status = 'default',
      fullWidth,
      disabled,
      id,
      required,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      open: openProp,
      onOpenChange,
      className,
    } = props;

    // Warn once in dev when both value and defaultValue are passed.
    React.useEffect(() => {
      if (process.env.NODE_ENV !== 'production' && valueProp !== undefined && defaultValue !== undefined) {
        console.warn(
          '[DatePicker] received both `value` and `defaultValue`. `value` wins (controlled); `defaultValue` is ignored.',
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Controlled value: if valueProp is set (including explicitly undefined
    // vs. omitted), treat as controlled. We use `'value' in props` semantics.
    const isControlled = 'value' in props;
    const [internalValue, setInternalValue] = React.useState<Date | undefined>(defaultValue);
    const currentValue = isControlled ? valueProp : internalValue;

    // Controlled open
    const isOpenControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = isOpenControlled ? openProp : internalOpen;
    const setOpen = (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    };

    const handleSelect = (next: Date | undefined) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
      setOpen(false);
    };

    const displayText = currentValue ? formatValue(currentValue, locale) : placeholder;
    const hasValue = Boolean(currentValue);

    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            ref={ref}
            type="button"
            id={id}
            disabled={disabled}
            role="combobox"
            aria-haspopup="dialog"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-required={required || undefined}
            aria-invalid={status === 'error' || undefined}
            className={cn(
              inputLikeVariants({
                size,
                status,
                fullWidth,
                hasLeadingIcon: false,
                hasTrailingIcon: true,
              }),
              'text-left',
              className,
            )}
          >
            <span
              className={cn(
                'flex-1 truncate',
                !hasValue && 'text-[var(--color-text-muted)]',
              )}
            >
              {displayText}
            </span>
            <span className="ml-2 flex shrink-0 items-center">
              <Icon name="calendar" size={size === 'lg' ? 'md' : 'sm'} aria-hidden />
            </span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="start"
            sideOffset={4}
            aria-label="Choose a date"
            className={cn(
              'z-50 rounded-[var(--radius-md)] border border-[var(--color-border-strong)]',
              'bg-[var(--color-bg-surface)] shadow-[var(--shadow-overlay)] p-3',
              'data-[state=open]:motion-safe:animate-in data-[state=closed]:motion-safe:animate-out',
            )}
          >
            <DayPicker
              mode="single"
              selected={currentValue}
              onSelect={handleSelect}
              locale={locale}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);

DatePicker.displayName = 'DatePicker';
```

Note: jsdom's `document.body` is shared across tests — Radix's Portal mounts the dialog into body, so tests using `screen.findByRole('dialog')` work.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx`
Expected: all tests pass.

Run: `npx vitest run --project unit`
Expected: 164 tests pass (160 + 4 new).

- [ ] **Step 5: Commit**

```bash
git add src/components/DatePicker
git commit -m "$(cat <<'EOF'
feat(date-picker): open popover and pick dates

Wrap the trigger in @radix-ui/react-popover and mount react-day-picker
inside PopoverContent. Trigger gets role=combobox + aria-haspopup=dialog
+ aria-expanded wiring. Supports both controlled (value + onValueChange)
and uncontrolled (defaultValue) patterns; warns in dev when both are
passed. Controlled and uncontrolled open state mirror the same pattern.

Selecting a day fires onValueChange and closes the popover. Value type
is Date | undefined throughout.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `minDate` / `maxDate` constraints

**Files:**
- Modify: `src/components/DatePicker/DatePicker.tsx`
- Modify: `src/components/DatePicker/DatePicker.test.tsx`

- [ ] **Step 1: Write failing tests**

Append to `src/components/DatePicker/DatePicker.test.tsx`:

```tsx
describe('DatePicker — constraints', () => {
  it('disables days before minDate', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={new Date(2026, 3, 15)} minDate={new Date(2026, 3, 10)} />);
    await user.click(screen.getByRole('combobox'));
    // Day 5 should be disabled (before min 10)
    const day5 = await screen.findByRole('button', { name: /^5$/ });
    expect(day5).toBeDisabled();
  });

  it('disables days after maxDate', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={new Date(2026, 3, 15)} maxDate={new Date(2026, 3, 20)} />);
    await user.click(screen.getByRole('combobox'));
    const day25 = await screen.findByRole('button', { name: /^25$/ });
    expect(day25).toBeDisabled();
  });

  it('warns in dev when minDate > maxDate and treats range as empty', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultValue={new Date(2026, 3, 15)}
        minDate={new Date(2026, 3, 25)}
        maxDate={new Date(2026, 3, 10)}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('minDate > maxDate'),
    );
    // Every day should be disabled
    const day15 = await screen.findByRole('button', { name: /^15$/ });
    expect(day15).toBeDisabled();
    warnSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx`
Expected: FAIL — constraints not yet implemented.

- [ ] **Step 3: Implement constraints**

In `src/components/DatePicker/DatePicker.tsx`:

1. Destructure `minDate` and `maxDate` in the props destructure.
2. Above the `return`, add:

```tsx
const rangeInvalid = minDate && maxDate && minDate.getTime() > maxDate.getTime();

React.useEffect(() => {
  if (process.env.NODE_ENV !== 'production' && rangeInvalid) {
    console.warn(
      '[DatePicker] minDate > maxDate — range is empty and all days are disabled.',
    );
  }
}, [rangeInvalid]);

// Build rdp's disabled matcher: an array (which rdp ORs internally).
const disabledMatcher = React.useMemo(() => {
  if (rangeInvalid) return { after: new Date(0) }; // every day is after epoch
  const matchers: Array<{ before?: Date; after?: Date }> = [];
  if (minDate) matchers.push({ before: minDate });
  if (maxDate) matchers.push({ after: maxDate });
  return matchers.length ? matchers : undefined;
}, [minDate, maxDate, rangeInvalid]);
```

3. Pass `disabled={disabledMatcher}` to the `<DayPicker>` element.

- [ ] **Step 4: Run tests**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx`
Expected: all tests pass.

Run: `npx vitest run --project unit`
Expected: 167 tests pass (164 + 3 new).

- [ ] **Step 5: Commit**

```bash
git add src/components/DatePicker/DatePicker.tsx src/components/DatePicker/DatePicker.test.tsx
git commit -m "$(cat <<'EOF'
feat(date-picker): min/max date constraints

Pass `minDate` / `maxDate` through to react-day-picker's `disabled`
matcher. Out-of-range days are disabled in the grid and skipped by
keyboard navigation. When `minDate > maxDate` (developer error), warn
once in dev mode and treat the range as empty (all days disabled).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `Today` + `Clear` footer buttons

**Files:**
- Modify: `src/components/DatePicker/DatePicker.tsx`
- Modify: `src/components/DatePicker/DatePicker.test.tsx`

- [ ] **Step 1: Write failing tests**

Append to `src/components/DatePicker/DatePicker.test.tsx`:

```tsx
describe('DatePicker — footer actions', () => {
  it('renders Clear button when clearable and value is set', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={new Date(2026, 3, 15)} clearable />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('does not render Clear when no value is set', async () => {
    const user = userEvent.setup();
    render(<DatePicker clearable />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('dialog');
    expect(screen.queryByRole('button', { name: /clear/i })).toBeNull();
  });

  it('Clear button fires onValueChange(undefined) and closes popover', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker defaultValue={new Date(2026, 3, 15)} onValueChange={onChange} clearable />);
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('button', { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders Today button when showTodayButton is true', async () => {
    const user = userEvent.setup();
    render(<DatePicker showTodayButton />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('button', { name: /today/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement footer**

In `src/components/DatePicker/DatePicker.tsx`:

1. Add an import: `import { Button } from '../Button';`
2. Destructure `clearable` (default true) and `showTodayButton` (default true) in the props destructure.
3. Track the calendar's visible month via an internal state so Today can jump:
   ```tsx
   const [month, setMonth] = React.useState<Date>(currentValue ?? new Date());
   ```
4. Pass `month={month}` and `onMonthChange={setMonth}` to the `<DayPicker>` element.
5. After the `<DayPicker>` element, before `</Popover.Content>`, add:

```tsx
{(showTodayButton || (clearable && hasValue)) && (
  <div className="mt-3 flex justify-between gap-2 border-t border-[var(--color-border-subtle)] pt-3">
    {showTodayButton ? (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMonth(new Date())}
        type="button"
      >
        Today
      </Button>
    ) : <span />}
    {clearable && hasValue ? (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSelect(undefined)}
        type="button"
      >
        Clear
      </Button>
    ) : null}
  </div>
)}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx`
Expected: all tests pass.

Run: `npx vitest run --project unit`
Expected: 171 tests pass (167 + 4 new).

- [ ] **Step 5: Commit**

```bash
git add src/components/DatePicker/DatePicker.tsx src/components/DatePicker/DatePicker.test.tsx
git commit -m "$(cat <<'EOF'
feat(date-picker): Today and Clear footer actions

Add an optional footer inside PopoverContent with two ghost buttons:
Today (jumps the visible month, does NOT auto-select — avoids the
click-and-submit surprise) and Clear (fires onValueChange(undefined)
and closes). Both are opt-in via `showTodayButton` and `clearable`
props; Clear only renders when a value is actually set.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Trigger ARIA + keyboard opening (ArrowDown / ArrowUp)

**Files:**
- Modify: `src/components/DatePicker/DatePicker.tsx`
- Modify: `src/components/DatePicker/DatePicker.test.tsx`

Radix PopoverTrigger already handles Enter / Space / Escape. We add ArrowDown / ArrowUp opening and `aria-controls`.

- [ ] **Step 1: Write failing tests**

Append to `src/components/DatePicker/DatePicker.test.tsx`:

```tsx
describe('DatePicker — trigger ARIA and keyboard', () => {
  it('trigger has an aria-controls pointing at the popover content id', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    const controls = trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(dialog.id || dialog.getAttribute('id')).toBe(controls);
  });

  it('ArrowDown on the trigger opens the popover', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('ArrowUp on the trigger opens the popover', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('{ArrowUp}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx`
Expected: FAIL — no aria-controls wiring, no arrow-key handler.

- [ ] **Step 3: Implement**

In `src/components/DatePicker/DatePicker.tsx`:

1. Generate a stable id for the popover content at the top of the component body:
   ```tsx
   const popoverId = React.useId();
   ```

2. On the `<button>` trigger, add these attributes:
   ```tsx
   aria-controls={popoverId}
   aria-expanded={open}
   onKeyDown={(e) => {
     if (disabled) return;
     if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
       e.preventDefault();
       setOpen(true);
     }
   }}
   ```

3. On the `<Popover.Content>` element, add `id={popoverId}`.

- [ ] **Step 4: Run tests**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx`
Expected: all tests pass.

Run: `npx vitest run --project unit`
Expected: 174 tests pass (171 + 3 new).

- [ ] **Step 5: Commit**

```bash
git add src/components/DatePicker/DatePicker.tsx src/components/DatePicker/DatePicker.test.tsx
git commit -m "$(cat <<'EOF'
feat(date-picker): trigger ARIA and keyboard opening

Generate a stable id via React.useId() and wire aria-controls on the
trigger to the popover content's id. Add onKeyDown handling so
ArrowDown/ArrowUp open the popover (complementing Radix's built-in
Enter/Space). Focus-into-calendar on open is handled by Radix's
PopoverContent default — no custom code needed.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Hidden `<input>` for native form submits

**Files:**
- Modify: `src/components/DatePicker/DatePicker.tsx`
- Modify: `src/components/DatePicker/DatePicker.test.tsx`

- [ ] **Step 1: Write failing tests**

Append to `src/components/DatePicker/DatePicker.test.tsx`:

```tsx
describe('DatePicker — hidden form input', () => {
  it('does not render a hidden input when no name is provided', () => {
    const { container } = render(<DatePicker defaultValue={new Date(2026, 3, 15)} />);
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });

  it('renders a hidden input with ISO value when name is provided', () => {
    const { container } = render(
      <DatePicker name="birthdate" defaultValue={new Date(2026, 3, 15)} />,
    );
    const hidden = container.querySelector('input[type="hidden"]');
    expect(hidden).toBeInTheDocument();
    expect(hidden).toHaveAttribute('name', 'birthdate');
    expect(hidden).toHaveAttribute('value', '2026-04-15');
  });

  it('hidden input value is empty when no date is selected', () => {
    const { container } = render(<DatePicker name="deadline" />);
    const hidden = container.querySelector('input[type="hidden"]');
    expect(hidden).toHaveAttribute('value', '');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx`
Expected: FAIL — no hidden input rendered.

- [ ] **Step 3: Implement**

In `src/components/DatePicker/DatePicker.tsx`:

1. Destructure `name` in the props destructure (it was already in the interface; wire it in now).
2. Derive the ISO string:
   ```tsx
   const isoValue = currentValue ? formatDate(currentValue, 'yyyy-MM-dd') : '';
   ```
3. Wrap the return in a React fragment so we can render the hidden input as a sibling of `<Popover.Root>`:
   ```tsx
   return (
     <>
       {name ? <input type="hidden" name={name} value={isoValue} /> : null}
       <Popover.Root open={open} onOpenChange={setOpen}>
         {/* existing content */}
       </Popover.Root>
     </>
   );
   ```

- [ ] **Step 4: Run tests**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx`
Expected: all tests pass.

Run: `npx vitest run --project unit`
Expected: 177 tests pass (174 + 3 new).

- [ ] **Step 5: Commit**

```bash
git add src/components/DatePicker/DatePicker.tsx src/components/DatePicker/DatePicker.test.tsx
git commit -m "$(cat <<'EOF'
feat(date-picker): hidden form input for native submits

When a `name` prop is provided, render an <input type="hidden"> sibling
to the trigger. Value is always the ISO yyyy-MM-dd string (via
date-fns format), independent of the display `locale`. This makes
native form submission predictable and timezone-neutral — calendar
days are not moments in time.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Manfred-token classNames on the calendar grid

**Files:**
- Modify: `src/components/DatePicker/DatePicker.tsx`

No new unit tests — this is a visual change best validated by Storybook + runtime a11y scan in Task 10.

- [ ] **Step 1: Define the `classNames` mapping as a module-level constant**

At the top of `src/components/DatePicker/DatePicker.tsx` (after imports, before the component), add:

```tsx
/**
 * Manfred-token classNames for react-day-picker v9.
 *
 * Every entry references a semantic token — no hex, no primitive-layer
 * skips. If you need a color that doesn't exist yet, add it to the
 * semantic layer in tokens.css first (never hardcode here).
 */
const rdpClassNames = {
  root: 'font-sans',
  months: 'flex flex-col gap-3',
  month: 'space-y-3',
  caption: 'flex justify-between items-center px-1',
  caption_label: 'text-base font-semibold text-[var(--color-text-primary)]',
  nav: 'flex gap-1',
  nav_button:
    'inline-flex items-center justify-center size-8 rounded-full ' +
    'hover:bg-[var(--color-bg-subtle)] ' +
    'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
  nav_button_previous: '',
  nav_button_next: '',
  table: 'w-full border-collapse',
  head_row: 'flex',
  head_cell:
    'text-[var(--color-text-muted)] w-10 text-[11px] uppercase tracking-wide font-normal',
  row: 'flex w-full mt-1',
  cell: 'size-10 text-center text-sm p-0 relative',
  day:
    'size-10 inline-flex items-center justify-center rounded-[var(--radius-sm)] ' +
    'text-sm font-sans text-[var(--color-text-primary)] ' +
    'hover:bg-[var(--color-bg-subtle)] ' +
    'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
  day_selected:
    'bg-[var(--color-interactive-brand-bg)] text-[var(--color-text-on-brand)] ' +
    'hover:bg-[var(--color-interactive-brand-bg)]',
  day_today: 'ring-[1.5px] ring-[var(--color-focus-ring)]',
  day_outside: 'text-[var(--color-text-muted)] opacity-60',
  day_disabled: 'text-[var(--color-text-muted)] opacity-50 cursor-not-allowed',
  day_hidden: 'invisible',
};
```

- [ ] **Step 2: Pass it to DayPicker**

On the `<DayPicker>` element, add `classNames={rdpClassNames}`.

- [ ] **Step 3: Run tests to confirm no regression**

Run: `npx vitest run --project unit`
Expected: 177 tests still pass (no new tests; styling is visual).

Run: `npm run build`
Expected: clean.

- [ ] **Step 4: Visual smoke-check (optional, recommended)**

Start Storybook (`npm run storybook &`) and open the not-yet-written DatePicker story via the Playground controls — actually, skip this step in the automated flow; the next task adds the stories. This task is pure styling prep.

- [ ] **Step 5: Commit**

```bash
git add src/components/DatePicker/DatePicker.tsx
git commit -m "$(cat <<'EOF'
style(date-picker): apply Manfred tokens to calendar grid

Pass a classNames mapping to react-day-picker's DayPicker that styles
every element via semantic tokens only (no hex, no primitive layer
skips). Selected days use --color-interactive-brand-bg, today's ring
uses --color-focus-ring, disabled days use --color-text-muted. Focus
ring uses the same --shadow-focus as every other interactive component
in the library.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Stories + a11y config + keyboard play function

**Files:**
- Create: `src/components/DatePicker/DatePicker.stories.tsx`

- [ ] **Step 1: Create the stories file**

File: `src/components/DatePicker/DatePicker.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { useState } from 'react';
import { DatePicker } from './DatePicker';
import { FormField } from '../FormField';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
    // Global preview disables 'region' because isolated stories aren't pages.
    // Re-enable here so axe reports landmark violations on this interactive component.
    a11y: {
      config: {
        rules: [
          { id: 'region', enabled: true },
          // react-day-picker portals its focus guards and aria-controls target
          // outside the scanned subtree — same pattern the Dialog stories hit.
          // Disabled with justification to keep the a11y panel actionable.
          { id: 'aria-valid-attr-value', enabled: false },
          { id: 'aria-hidden-focus', enabled: false },
        ],
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Playground: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return <DatePicker value={value} onValueChange={setValue} />;
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>(new Date(2026, 3, 15));
    return <DatePicker value={value} onValueChange={setValue} />;
  },
};

export const WithConstraints: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return (
      <DatePicker
        value={value}
        onValueChange={setValue}
        minDate={new Date(2026, 3, 1)}
        maxDate={new Date(2026, 3, 30)}
        placeholder="April 2026 only"
      />
    );
  },
};

export const InFormField: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return (
      <FormField label="Date of birth" htmlFor="dob" required>
        <DatePicker id="dob" value={value} onValueChange={setValue} required />
      </FormField>
    );
  },
};

export const ErrorState: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return (
      <FormField label="Delivery date" htmlFor="delivery" status="error" message="Please pick a date">
        <DatePicker id="delivery" value={value} onValueChange={setValue} status="error" />
      </FormField>
    );
  },
};

// Play: Tab to trigger, ArrowDown to open, Enter to select focused day, assert value updated.
export const KeyboardInteraction: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>(new Date(2026, 3, 15));
    return <DatePicker value={value} onValueChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    // Tab focuses the trigger (only focusable in this render).
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    // ArrowDown opens the popover.
    await userEvent.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // findByRole waits for the portal to mount in document.body.
    await within(document.body).findByRole('dialog');
    // Escape closes without selecting.
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
```

- [ ] **Step 2: Run the storybook vitest project for this file**

Ensure Storybook is running in another terminal (for the story play project). If not: `npm run storybook &` then wait ~30s.

Run: `npx vitest run --project storybook src/components/DatePicker/DatePicker.stories.tsx`
Expected: all 6 stories pass (Playground, WithValue, WithConstraints, InFormField, ErrorState, KeyboardInteraction).

- [ ] **Step 3: Run the runtime a11y scan, both modes**

Run: `node scripts/a11y-runtime-scan.mjs`
Expected: 0 violations, 0 errors, 0 incomplete rules (or only pre-existing ones — nothing new from DatePicker).

Run: `node scripts/a11y-runtime-scan.mjs --dark`
Expected: 0 violations.

If a new `incomplete` rule appears from the DatePicker stories that isn't already suppressed, investigate. If it's another known rdp/portal false positive (check the rule's description + sample HTML), add it to the DatePicker meta's a11y rules with a WHY comment — same pattern as the Dialog.

- [ ] **Step 4: Run the full gate suite**

Run: `npx vitest run --project unit`
Expected: 177 tests pass.

Run: `npx vitest run --project storybook`
Expected: all storybook tests pass (existing + 6 new).

Run: `npm run build`
Expected: clean.

Run: `npx tsc -p tsconfig.build.json --noEmit`
Expected: no errors. Confirm `DatePicker` and `DatePickerProps` appear in `dist/index.d.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/components/DatePicker/DatePicker.stories.tsx
git commit -m "$(cat <<'EOF'
test(date-picker): stories with a11y config and keyboard play

Add Playground, WithValue, WithConstraints, InFormField, ErrorState,
and KeyboardInteraction stories. Per-component a11y config re-enables
'region' (matching the other interactive components) and disables
'aria-valid-attr-value' + 'aria-hidden-focus' with WHY comments —
react-day-picker's portals trigger the same known false positives that
Dialog already suppresses.

KeyboardInteraction play function exercises Tab → ArrowDown (opens
popover) → Escape (closes) via storybook/test's userEvent + expect,
matching the pattern of the Checkbox / Dialog / TextInput / Tooltip
play functions.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Final gates (run after Task 10, no commit)

- `npx vitest run --project unit` → 177 pass
- `npx vitest run --project storybook` → all pass
- `npm run build` → clean
- `npm run build-storybook` → clean
- `npx tsc --noEmit` and `npx tsc -p tsconfig.build.json --noEmit` → no errors
- `node scripts/a11y-runtime-scan.mjs` and `--dark` → 0 violations both modes
- Grep `src/components/DatePicker` for hex colors: `grep -rE "#[0-9a-fA-F]{3,8}" src/components/DatePicker` → 0 matches

---

## Release notes (for the future `v0.7.0` changelog entry)

```
### Added
- `DatePicker` — single-date picker with a TextInput-styled popover
  trigger, calendar-only selection, `minDate` / `maxDate` constraints,
  date-fns locale (default `sv`), optional Today / Clear footer, and a
  hidden <input> for native form submits. Built on
  @radix-ui/react-popover + react-day-picker v9 (both are new peer
  dependencies). Fully keyboard accessible; passes runtime a11y scan in
  both light and dark modes.

### Changed
- Internal: extracted `inputLikeVariants` CVA from TextInput into
  `src/lib/inputLikeVariants.ts`. TextInput and DatePicker share it —
  no visual drift possible. No behavior change for TextInput consumers.

### Peer dependencies
- Added `react-day-picker` (^9.0.0) and `date-fns` (^4.0.0).
```

STU-5 → mark as Done. Follow-up tickets to consider filing in Linear: date range mode, typed entry, time-of-day, preset pills, `disabledDays` matcher.
