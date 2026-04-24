# DatePicker range mode — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `mode="range"` support to the existing `<DatePicker>` component so users can pick a `from` + `to` date in one popover, without breaking any v0.7 consumer.

**Architecture:** Public-API discriminated union keyed on `mode` (default `'single'`). Internally, a single `useDatePickerState` hook owns all React state (always calls the same hooks in the same order) and delegates to two pure builder functions (`buildSingleState`, `buildRangeState`) that return a normalized `DatePickerInternalState` struct. The main component renders one shared trigger + popover tree.

**Tech Stack:** React 18, TypeScript 5, Vitest + jsdom, Storybook 9, react-day-picker v9, @radix-ui/react-popover, date-fns, Tailwind v4.

**Spec:** [`docs/superpowers/specs/2026-04-24-datepicker-range-design.md`](../specs/2026-04-24-datepicker-range-design.md)

**Branch:** `jens-wedin/stu-6-datepicker-date-range-mode-from-to` (already checked out; spec already committed at `ab79bc3`)

---

## File Structure

**Create**
- `src/components/DatePicker/useDatePickerState.ts` — hook, owns all React state, delegates to builders.
- `src/components/DatePicker/datePickerStateHelpers.ts` — `buildSingleState` + `buildRangeState` pure builders, `DatePickerInternalState` type, `isDateRange` guard.

**Modify**
- `src/components/DatePicker/DatePicker.tsx` — public-API union, call `useDatePickerState`, render from normalized struct, add range-mode rdp classNames.
- `src/components/DatePicker/DatePicker.test.tsx` — add range suite (partial, complete, swap, single-day, clear, hidden inputs, mode warn, shape warn).
- `src/components/DatePicker/DatePicker.stories.tsx` — add range stories + play functions.
- `src/components/DatePicker/index.ts` — re-export `DateRange` type from rdp (no other change).
- `README.md` — mention range mode under DatePicker.
- `CHANGELOG.md` — v0.8.0 "Added" entry.
- `package.json` — version bump to 0.8.0.

---

## Conventions

- Commit messages follow conventional-commits. Prefix with `(date-picker)` scope where applicable.
- Every test uses fixed dates (`new Date('2026-04-01')`), never `new Date()`.
- Unit test command: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx`.
- Storybook must be running on :6006 for the a11y runtime scan and for browser-context Storybook tests.
- No emoji in code or docs.
- Every task ends with a commit. If a task doesn't make something testable, still produce a green type-check + test run before committing.

---

## Task 1: Add discriminated-union public API types

**Files:**
- Modify: `src/components/DatePicker/DatePicker.tsx` (export types only, no logic yet)
- Test: `src/components/DatePicker/DatePicker.test.tsx` (type-level test via `expectTypeOf`-style assertion, compiled only)

- [ ] **Step 1: Replace the single `DatePickerProps` interface with a discriminated union**

In `src/components/DatePicker/DatePicker.tsx`, replace the existing `DatePickerProps` interface with:

```tsx
import type { Locale } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { inputLikeVariants, type InputLikeSize, type InputLikeStatus } from '@/lib/inputLikeVariants';

type DatePickerBaseProps = {
  placeholder?: string;
  locale?: Locale;
  minDate?: Date;
  maxDate?: Date;
  clearable?: boolean;
  showTodayButton?: boolean;
  size?: InputLikeSize;
  status?: InputLikeStatus;
  fullWidth?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export type DatePickerSingleProps = DatePickerBaseProps & {
  mode?: 'single';
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (value: Date | undefined) => void;
  formatValue?: (value: Date, locale: Locale) => string;
};

export type DatePickerRangeProps = DatePickerBaseProps & {
  mode: 'range';
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange | undefined) => void;
  formatValue?: (value: DateRange, locale: Locale) => string;
};

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;
```

The existing `DatePicker` component body should continue to type-check against `DatePickerSingleProps` for now — narrow it by casting: `const props = propsIn as DatePickerSingleProps;` at the top of the component body. This is a scaffolding cast that will go away in Task 3.

- [ ] **Step 2: Re-export `DateRange` from the component barrel**

In `src/components/DatePicker/index.ts`:

```tsx
export { DatePicker } from './DatePicker';
export type {
  DatePickerProps,
  DatePickerSingleProps,
  DatePickerRangeProps,
} from './DatePicker';
export type { DateRange } from 'react-day-picker';
```

- [ ] **Step 3: Run type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Run existing unit tests to verify no regression**

Run: `npx vitest run --project unit`
Expected: all existing tests pass (156+ tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/DatePicker/DatePicker.tsx src/components/DatePicker/index.ts
git commit -m "feat(date-picker): add discriminated DatePickerProps union (STU-6)"
```

---

## Task 2: Add `isDateRange` type guard and `DatePickerInternalState` shape

**Files:**
- Create: `src/components/DatePicker/datePickerStateHelpers.ts`
- Test: `src/components/DatePicker/DatePicker.test.tsx` — inline tests for the guard

- [ ] **Step 1: Write failing test for `isDateRange` guard**

Add near the top of `src/components/DatePicker/DatePicker.test.tsx` (keep existing tests):

```tsx
import { isDateRange } from './datePickerStateHelpers';

describe('isDateRange', () => {
  it('returns true for DateRange objects', () => {
    expect(isDateRange({ from: new Date('2026-04-01'), to: new Date('2026-04-15') })).toBe(true);
    expect(isDateRange({ from: new Date('2026-04-01') })).toBe(true);
    expect(isDateRange({ from: undefined, to: undefined })).toBe(true);
    expect(isDateRange({})).toBe(true);
  });
  it('returns false for Date', () => {
    expect(isDateRange(new Date('2026-04-01'))).toBe(false);
  });
  it('returns false for undefined', () => {
    expect(isDateRange(undefined)).toBe(false);
  });
  it('returns false for primitives', () => {
    expect(isDateRange('2026-04-01')).toBe(false);
    expect(isDateRange(12345)).toBe(false);
    expect(isDateRange(null)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx -t isDateRange`
Expected: FAIL — `Cannot find module './datePickerStateHelpers'`.

- [ ] **Step 3: Create `datePickerStateHelpers.ts` with the guard and state interface**

Create `src/components/DatePicker/datePickerStateHelpers.ts`:

```tsx
import type { DateRange } from 'react-day-picker';

export interface DatePickerInternalState {
  displayText: string;
  isEmpty: boolean;
  hiddenInputs: Array<{ name: string; value: string }>;
  rdpSelected: Date | DateRange | undefined;
  handleSelect: (next: Date | DateRange | undefined) => void;
  shouldCloseOnSelect: (next: Date | DateRange | undefined) => boolean;
  clear: () => void;
}

export function isDateRange(v: unknown): v is DateRange {
  if (v === null || typeof v !== 'object') return false;
  if (v instanceof Date) return false;
  return 'from' in v || 'to' in v || Object.keys(v).length === 0;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx -t isDateRange`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/DatePicker/datePickerStateHelpers.ts src/components/DatePicker/DatePicker.test.tsx
git commit -m "feat(date-picker): add isDateRange guard and internal state shape"
```

---

## Task 3: Extract single-mode logic into `buildSingleState` and `useDatePickerState`

**Files:**
- Create: `src/components/DatePicker/useDatePickerState.ts`
- Modify: `src/components/DatePicker/datePickerStateHelpers.ts` (add `buildSingleState`)
- Modify: `src/components/DatePicker/DatePicker.tsx` (call the hook, remove inline state)

This is a pure refactor. All existing single-mode tests must still pass.

- [ ] **Step 1: Add `buildSingleState` to `datePickerStateHelpers.ts`**

Append to `src/components/DatePicker/datePickerStateHelpers.ts`:

```tsx
import { format as formatDate } from 'date-fns';
import type { Locale } from 'date-fns';
import type { DatePickerSingleProps } from './DatePicker';

const defaultSingleFormat = (value: Date, locale: Locale) =>
  formatDate(value, 'P', { locale });

interface BuildSingleStateOptions {
  value: Date | undefined;
  setValue: (next: Date | undefined) => void;
  isControlled: boolean;
  setOpen: (next: boolean) => void;
  setCaptionMonth: (m: Date) => void;
  props: DatePickerSingleProps;
  locale: Locale;
  placeholder: string;
}

export function buildSingleState(opts: BuildSingleStateOptions): DatePickerInternalState {
  const { value, setValue, isControlled, setOpen, setCaptionMonth, props, locale, placeholder } = opts;
  const formatValue = props.formatValue ?? defaultSingleFormat;

  const displayText = value ? formatValue(value, locale) : placeholder;
  const isEmpty = !value;

  const hiddenInputs = props.name
    ? [{ name: props.name, value: value ? formatDate(value, 'yyyy-MM-dd') : '' }]
    : [];

  const handleSelect = (next: Date | DateRange | undefined) => {
    // Narrow: single-mode rdp onSelect gives Date | undefined, never DateRange.
    const narrowed = next as Date | undefined;
    if (!isControlled) setValue(narrowed);
    props.onValueChange?.(narrowed);
    if (narrowed) setCaptionMonth(narrowed);
  };

  const shouldCloseOnSelect = (next: Date | DateRange | undefined) => {
    // Single mode: close on any selection (including undefined via Clear).
    return next !== undefined;
  };

  const clear = () => {
    if (!isControlled) setValue(undefined);
    props.onValueChange?.(undefined);
    setOpen(false);
  };

  return {
    displayText,
    isEmpty,
    hiddenInputs,
    rdpSelected: value,
    handleSelect,
    shouldCloseOnSelect,
    clear,
  };
}
```

Note: `setOpen` is passed in rather than called internally so the hook orchestrates popover open state centrally.

- [ ] **Step 2: Create the `useDatePickerState` hook (single mode only for now)**

Create `src/components/DatePicker/useDatePickerState.ts`:

```tsx
import * as React from 'react';
import { sv } from 'date-fns/locale/sv';
import type { Locale } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { DatePickerProps } from './DatePicker';
import {
  type DatePickerInternalState,
  buildSingleState,
  isDateRange,
} from './datePickerStateHelpers';

interface UseDatePickerStateOptions {
  setOpen: (next: boolean) => void;
}

export function useDatePickerState(
  props: DatePickerProps,
  { setOpen }: UseDatePickerStateOptions,
): DatePickerInternalState & { captionMonth: Date; setCaptionMonth: (m: Date) => void } {
  const mode = props.mode ?? 'single';
  const locale: Locale = props.locale ?? sv;

  // Controlled vs uncontrolled: `'value' in props` treats value={undefined} as controlled-cleared.
  const isControlled = 'value' in props;

  // Single union-typed state — both modes share the same useState call to keep
  // hook ordering stable across mode changes. If the value shape doesn't match
  // the current mode, buildXState below treats it as empty.
  const [internalValue, setInternalValue] = React.useState<Date | DateRange | undefined>(
    props.defaultValue,
  );
  const currentValue = isControlled ? props.value : internalValue;

  // Caption month = which month the grid shows on open.
  const [captionMonth, setCaptionMonth] = React.useState<Date>(() => {
    if (isDateRange(currentValue) && currentValue.from) return currentValue.from;
    if (currentValue instanceof Date) return currentValue;
    return new Date();
  });

  // Dev warnings (once per mount).
  const warned = React.useRef({ dual: false, modeChange: false, shape: false });
  const initialMode = React.useRef(mode);

  React.useEffect(() => {
    if (
      props.value !== undefined &&
      props.defaultValue !== undefined &&
      !warned.current.dual
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        '[DatePicker] received both `value` and `defaultValue`. `value` wins (controlled); `defaultValue` is ignored.',
      );
      warned.current.dual = true;
    }
    if (mode !== initialMode.current && !warned.current.modeChange) {
      // eslint-disable-next-line no-console
      console.warn(
        '[DatePicker] `mode` is mount-time; change ignored. Render two separate instances if you need both.',
      );
      warned.current.modeChange = true;
    }
    if (
      mode === 'range' &&
      currentValue !== undefined &&
      !isDateRange(currentValue) &&
      !warned.current.shape
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        '[DatePicker] `mode="range"` requires `value` / `defaultValue` of shape `{ from?, to? }`. Got a Date; rendering empty.',
      );
      warned.current.shape = true;
    }
  }, [mode, props.value, props.defaultValue, currentValue]);

  const placeholder =
    props.placeholder ?? (mode === 'range' ? 'Pick dates' : 'Pick a date');

  // Delegate to the mode-specific builder. Both builders are pure (not hooks).
  // For now: only single-mode is implemented. buildRangeState lands in Task 5.
  // Locked mode is `initialMode.current` — prevents flips. We just warn.
  const effectiveMode = initialMode.current;

  // Narrow the value for each builder; shape-mismatched values render empty.
  if (effectiveMode === 'single') {
    const singleValue = currentValue instanceof Date ? currentValue : undefined;
    const state = buildSingleState({
      value: singleValue,
      setValue: (next) => setInternalValue(next),
      isControlled,
      setOpen,
      setCaptionMonth,
      props: props as import('./DatePicker').DatePickerSingleProps,
      locale,
      placeholder,
    });
    return { ...state, captionMonth, setCaptionMonth };
  }

  // effectiveMode === 'range' — implemented in Task 5. For now, assert never.
  // This branch is unreachable in Task 3; removed when Task 5 lands.
  throw new Error(
    '[DatePicker] range mode not yet implemented. This will be replaced in Task 5.',
  );
}
```

- [ ] **Step 3: Refactor `DatePicker.tsx` to use the hook**

Replace the state-management parts of `src/components/DatePicker/DatePicker.tsx` (lines roughly 139–212 in the current file) with a call to `useDatePickerState`. The component becomes:

```tsx
import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { sv } from 'date-fns/locale/sv';
import type { Locale } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Icon } from '../Icon';
import { Button } from '../Button';
import { inputLikeVariants, type InputLikeSize, type InputLikeStatus } from '@/lib/inputLikeVariants';
import { cn } from '@/lib/utils';
import { useDatePickerState } from './useDatePickerState';

// ... keep the type definitions from Task 1 above this ...

// ... keep the existing `rdpClassNames` constant unchanged for now (range additions land in Task 10) ...

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(props, ref) {
    const {
      mode = 'single',
      size = 'md',
      status = 'default',
      fullWidth,
      disabled,
      id,
      required,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      minDate,
      maxDate,
      clearable = true,
      showTodayButton = true,
      open: openProp,
      onOpenChange,
      className,
      locale = sv,
    } = props;

    const popoverId = React.useId();

    const isOpenControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = isOpenControlled ? openProp : internalOpen;
    const setOpen = React.useCallback(
      (next: boolean) => {
        if (!isOpenControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isOpenControlled, onOpenChange],
    );

    const state = useDatePickerState(props, { setOpen });
    const { displayText, isEmpty, hiddenInputs, rdpSelected, handleSelect, shouldCloseOnSelect, clear, captionMonth, setCaptionMonth } = state;

    const rangeInvalid = Boolean(
      minDate && maxDate && minDate.getTime() > maxDate.getTime(),
    );

    React.useEffect(() => {
      if (rangeInvalid) {
        // eslint-disable-next-line no-console
        console.warn(
          '[DatePicker] minDate > maxDate — range is empty and all days are disabled.',
        );
      }
    }, [rangeInvalid]);

    const disabledMatcher = React.useMemo(() => {
      if (rangeInvalid) return { after: new Date(0) };
      const matchers: Array<{ before: Date } | { after: Date }> = [];
      if (minDate) matchers.push({ before: minDate });
      if (maxDate) matchers.push({ after: maxDate });
      return matchers.length > 0 ? matchers : undefined;
    }, [minDate, maxDate, rangeInvalid]);

    const triggerPadding = size === 'sm' ? 'px-3' : 'px-4';
    const resolvedAriaLabel = ariaLabel ?? (!ariaLabelledBy ? displayText : undefined);

    // Wrap rdp's onSelect: dispatch to the hook's handleSelect, then maybe close.
    const onRdpSelect = (next: Date | DateRange | undefined) => {
      handleSelect(next);
      if (shouldCloseOnSelect(next)) setOpen(false);
    };

    // Reset caption month to the current value's month when the popover opens.
    React.useEffect(() => {
      if (!open) return;
      if (rdpSelected instanceof Date) setCaptionMonth(rdpSelected);
      else if (rdpSelected && 'from' in rdpSelected && rdpSelected.from) setCaptionMonth(rdpSelected.from);
    }, [open, rdpSelected, setCaptionMonth]);

    return (
      <>
        {hiddenInputs.map((h) => (
          <input key={h.name} type="hidden" name={h.name} value={h.value} />
        ))}
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              ref={ref}
              type="button"
              id={id}
              disabled={disabled}
              role="combobox"
              aria-controls={popoverId}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-label={resolvedAriaLabel}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
              aria-invalid={status === 'error' || undefined}
              aria-required={required || undefined}
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  setOpen(true);
                }
              }}
              className={cn(
                inputLikeVariants({ size, status, fullWidth }),
                triggerPadding,
                'text-left',
                className,
              )}
            >
              <span
                className={cn(
                  'flex-1 truncate',
                  isEmpty && 'text-[var(--color-text-muted)]',
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
              id={popoverId}
              side="bottom"
              align="start"
              sideOffset={4}
              aria-label={mode === 'range' ? 'Choose dates' : 'Choose a date'}
              className={cn(
                'z-50 rounded-[var(--radius-md)] border border-[var(--color-border-strong)]',
                'bg-[var(--color-bg-surface)] shadow-[var(--shadow-overlay)] p-2 pt-4',
                'data-[state=open]:motion-safe:animate-in data-[state=closed]:motion-safe:animate-out',
              )}
            >
              {mode === 'range' ? (
                <DayPicker
                  mode="range"
                  selected={rdpSelected as DateRange | undefined}
                  onSelect={(range) => onRdpSelect(range)}
                  locale={locale}
                  autoFocus
                  disabled={disabledMatcher}
                  month={captionMonth}
                  onMonthChange={setCaptionMonth}
                  classNames={rdpClassNames}
                />
              ) : (
                <DayPicker
                  mode="single"
                  selected={rdpSelected as Date | undefined}
                  onSelect={(date) => onRdpSelect(date)}
                  locale={locale}
                  autoFocus
                  disabled={disabledMatcher}
                  month={captionMonth}
                  onMonthChange={setCaptionMonth}
                  classNames={rdpClassNames}
                />
              )}
              {(showTodayButton || (clearable && !isEmpty)) && (
                <div
                  className={cn(
                    'mt-2 flex gap-2 border-t border-[var(--color-border-subtle)] pt-2',
                    showTodayButton ? 'justify-between' : 'justify-end',
                  )}
                >
                  {showTodayButton ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCaptionMonth(new Date())}
                      type="button"
                    >
                      Today
                    </Button>
                  ) : null}
                  {clearable && !isEmpty ? (
                    <Button variant="ghost" size="sm" onClick={clear} type="button">
                      Clear
                    </Button>
                  ) : null}
                </div>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </>
    );
  },
);

DatePicker.displayName = 'DatePicker';
```

- [ ] **Step 4: Run all existing tests**

Run: `npx vitest run --project unit`
Expected: all tests pass. No test assertions were modified — this is a pure refactor for single mode. Range tests still don't exist.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/DatePicker/DatePicker.tsx src/components/DatePicker/useDatePickerState.ts src/components/DatePicker/datePickerStateHelpers.ts
git commit -m "refactor(date-picker): extract single-mode state into hook + builder"
```

---

## Task 4: Bootstrap `buildRangeState` with failing "renders empty range" test

Setting up the skeleton for the range builder before adding behavior incrementally.

- [ ] **Step 1: Write failing test — renders empty range**

Append to `DatePicker.test.tsx` (inside the main `describe('DatePicker', …)` block, or in a new `describe('DatePicker range mode', …)` block):

```tsx
import { DatePicker } from './DatePicker';
import { render, screen } from '@testing-library/react';

describe('DatePicker range mode', () => {
  it('renders the range placeholder when no value is set', () => {
    render(<DatePicker mode="range" aria-label="test" />);
    expect(screen.getByRole('combobox')).toHaveTextContent(/Pick dates/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx -t "range mode"`
Expected: FAIL — throws `range mode not yet implemented` from `useDatePickerState`.

- [ ] **Step 3: Add empty `buildRangeState` stub to the helpers file**

Append to `src/components/DatePicker/datePickerStateHelpers.ts`:

```tsx
import type { DatePickerRangeProps } from './DatePicker';

interface BuildRangeStateOptions {
  value: DateRange | undefined;
  setValue: (next: DateRange | undefined) => void;
  isControlled: boolean;
  setOpen: (next: boolean) => void;
  setCaptionMonth: (m: Date) => void;
  props: DatePickerRangeProps;
  locale: Locale;
  placeholder: string;
}

const defaultRangeFormat = (value: DateRange, locale: Locale) => {
  if (!value.from) return '';
  const fromStr = formatDate(value.from, 'P', { locale });
  if (!value.to) return `${fromStr} – …`;
  return `${fromStr} – ${formatDate(value.to, 'P', { locale })}`;
};

export function buildRangeState(opts: BuildRangeStateOptions): DatePickerInternalState {
  const { value, setValue, isControlled, setOpen, props, locale, placeholder } = opts;
  const formatValue = props.formatValue ?? defaultRangeFormat;

  const hasAnyDate = Boolean(value?.from || value?.to);
  const displayText = hasAnyDate ? formatValue(value as DateRange, locale) : placeholder;
  const isEmpty = !hasAnyDate;

  const hiddenInputs: Array<{ name: string; value: string }> = [];
  if (props.name) {
    hiddenInputs.push({
      name: `${props.name}_from`,
      value: value?.from ? formatDate(value.from, 'yyyy-MM-dd') : '',
    });
    hiddenInputs.push({
      name: `${props.name}_to`,
      value: value?.to ? formatDate(value.to, 'yyyy-MM-dd') : '',
    });
  }

  // Behavior lands task-by-task. For now: no-op select, no close, no clear.
  const handleSelect = (_next: Date | DateRange | undefined) => {
    // Implemented in Task 5.
  };
  const shouldCloseOnSelect = (_next: Date | DateRange | undefined) => false;
  const clear = () => {
    if (!isControlled) setValue(undefined);
    props.onValueChange?.(undefined);
    setOpen(false);
  };

  return {
    displayText,
    isEmpty,
    hiddenInputs,
    rdpSelected: value,
    handleSelect,
    shouldCloseOnSelect,
    clear,
  };
}
```

- [ ] **Step 4: Wire `buildRangeState` into `useDatePickerState`**

Replace the `throw new Error` branch in `useDatePickerState.ts` with:

```tsx
import { buildRangeState } from './datePickerStateHelpers';

// ... inside the hook body, replacing the throw:
const rangeValue = isDateRange(currentValue) ? currentValue : undefined;
const state = buildRangeState({
  value: rangeValue,
  setValue: (next) => setInternalValue(next),
  isControlled,
  setOpen,
  setCaptionMonth,
  props: props as import('./DatePicker').DatePickerRangeProps,
  locale,
  placeholder,
});
return { ...state, captionMonth, setCaptionMonth };
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx -t "range mode"`
Expected: PASS.

- [ ] **Step 6: Run full unit suite**

Run: `npx vitest run --project unit`
Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/DatePicker/useDatePickerState.ts src/components/DatePicker/datePickerStateHelpers.ts src/components/DatePicker/DatePicker.test.tsx
git commit -m "feat(date-picker): wire range mode (renders empty + placeholder)"
```

---

## Task 5: Range selection — partial (first click)

rdp v9 in `mode="range"` calls `onSelect(range)` with the new range after every click. First click on an empty range yields `{ from: <clicked>, to: undefined }`.

- [ ] **Step 1: Write failing test — first click sets `from`, popover stays open**

Append to the range `describe` block in `DatePicker.test.tsx`:

```tsx
import userEvent from '@testing-library/user-event';

it('first click sets `from`, popover stays open, onValueChange fires with partial', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <DatePicker
      mode="range"
      aria-label="test"
      onValueChange={onValueChange}
      defaultValue={undefined}
      // Pin the calendar to April 2026 so our day-click is deterministic.
    />,
  );
  // Open popover
  await user.click(screen.getByRole('combobox'));
  // The calendar grid should be visible — pick a day in the current month.
  // Use a known day label; rdp v9 cells have accessible names like "April 10, 2026".
  // For determinism we rely on the grid being in the current real-clock month in this test — instead pass `defaultValue` to pin.
});
```

This test as written is not deterministic (depends on current month). Replace with a deterministic variant that pins via `defaultValue` on a partial range (from already set) to seed the calendar month:

```tsx
it('first click sets `from`, popover stays open, onValueChange fires with partial range', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <DatePicker
      mode="range"
      aria-label="test"
      onValueChange={onValueChange}
      // Seed caption month to April 2026 without committing a value:
      // No public API for "open at a specific month without a value", so seed with from-only default:
      defaultValue={{ from: new Date('2026-04-10'), to: undefined }}
    />,
  );
  await user.click(screen.getByRole('combobox'));
  // Popover is open. The seeded partial range should be visible.
  // Click a different day to start a new range — rdp default: first click becomes the new `from`.
  const day5 = await screen.findByRole('button', { name: /5/ });
  await user.click(day5);
  // Popover stays open
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  // onValueChange fired with `from` only
  const lastCall = onValueChange.mock.calls.at(-1)?.[0];
  expect(lastCall?.from).toBeInstanceOf(Date);
  expect(lastCall?.to).toBeUndefined();
});
```

- [ ] **Step 2: Run test — verify failure**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx -t "first click sets"`
Expected: FAIL — `handleSelect` is a no-op so `onValueChange` never fires, and `aria-expanded` is false (popover would have closed via the outer `if (shouldCloseOnSelect) setOpen(false)` which is false here, but `onValueChange` is still not called).

- [ ] **Step 3: Implement `handleSelect` and `shouldCloseOnSelect` in `buildRangeState`**

Replace the no-op handlers in `buildRangeState`:

```tsx
const handleSelect = (next: Date | DateRange | undefined) => {
  // rdp passes a DateRange or undefined in mode="range". Never a Date.
  const narrowed: DateRange | undefined = next && isDateRange(next) ? next : undefined;
  if (!isControlled) setValue(narrowed);
  props.onValueChange?.(narrowed);
};

const shouldCloseOnSelect = (next: Date | DateRange | undefined) => {
  // Close only when both endpoints are set (complete range).
  if (!next || !isDateRange(next)) return false;
  return Boolean(next.from && next.to);
};
```

- [ ] **Step 4: Run test — verify pass**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx -t "first click sets"`
Expected: PASS.

- [ ] **Step 5: Run full suite**

Run: `npx vitest run --project unit`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/DatePicker/datePickerStateHelpers.ts src/components/DatePicker/DatePicker.test.tsx
git commit -m "feat(date-picker): range first-click sets `from`, popover stays open"
```

---

## Task 6: Range selection — complete (second click)

- [ ] **Step 1: Write failing test — second click completes range, popover closes**

Append to the range `describe` block:

```tsx
it('second click completes the range, popover closes, onValueChange fires with {from, to}', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <DatePicker
      mode="range"
      aria-label="test"
      onValueChange={onValueChange}
      defaultValue={{ from: new Date('2026-04-10'), to: undefined }}
    />,
  );
  await user.click(screen.getByRole('combobox'));
  const day15 = await screen.findByRole('button', { name: /15/ });
  await user.click(day15);
  // Popover closed
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  // onValueChange fired with complete range
  const lastCall = onValueChange.mock.calls.at(-1)?.[0];
  expect(lastCall?.from).toBeInstanceOf(Date);
  expect(lastCall?.to).toBeInstanceOf(Date);
  expect(lastCall.to.getDate()).toBe(15);
});
```

- [ ] **Step 2: Run test — verify it already passes**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx -t "second click completes"`
Expected: PASS — the Task 5 implementation of `shouldCloseOnSelect` already closes when both endpoints are set.

If it fails, debug: likely rdp's onSelect isn't giving `to` set on second click when the `from` came from `defaultValue`. rdp v9 default `mode="range"` behavior is to treat a click on an existing partial as completing it. If rdp instead treats the second click as a new `from`, adjust the test to click the day **after** the seeded `from` (not before).

- [ ] **Step 3: Commit (no new source changes if already passing)**

```bash
git add src/components/DatePicker/DatePicker.test.tsx
git commit -m "test(date-picker): range second-click completes range and closes popover"
```

---

## Task 7: Range selection — reverse click swaps endpoints

- [ ] **Step 1: Write failing test — clicking before `from` swaps**

Append:

```tsx
it('second click before `from` swaps: new click becomes `from`, old from becomes `to`', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <DatePicker
      mode="range"
      aria-label="test"
      onValueChange={onValueChange}
      defaultValue={{ from: new Date('2026-04-15'), to: undefined }}
    />,
  );
  await user.click(screen.getByRole('combobox'));
  const day5 = await screen.findByRole('button', { name: /5/ });
  await user.click(day5);
  const lastCall = onValueChange.mock.calls.at(-1)?.[0];
  // rdp v9 default: clicking before `from` makes new day the from, old from the to.
  expect(lastCall.from.getDate()).toBe(5);
  expect(lastCall.to.getDate()).toBe(15);
  // Popover closes because both endpoints are set.
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
});
```

- [ ] **Step 2: Run test**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx -t "swaps"`
Expected: Pass or fail depends on rdp v9's exact `mode="range"` semantics. If rdp's default behavior creates `{from: new, to: undefined}` instead of swapping, we need to handle the swap ourselves in `handleSelect`. Check rdp v9 docs during execution; adjust impl if needed.

If the test fails with a non-swap result, patch `handleSelect` in `buildRangeState`:

```tsx
const handleSelect = (next: Date | DateRange | undefined) => {
  let narrowed: DateRange | undefined = next && isDateRange(next) ? next : undefined;
  // If rdp gives us a partial range where the click was before the existing from,
  // swap so from < to.
  if (value?.from && narrowed?.from && !narrowed.to && narrowed.from < value.from) {
    narrowed = { from: narrowed.from, to: value.from };
  }
  if (!isControlled) setValue(narrowed);
  props.onValueChange?.(narrowed);
};
```

- [ ] **Step 3: Commit**

```bash
git add src/components/DatePicker/datePickerStateHelpers.ts src/components/DatePicker/DatePicker.test.tsx
git commit -m "feat(date-picker): swap range endpoints on reverse click"
```

(If no impl change was needed, commit only the test with `test(date-picker): verify rdp reverse-click swap`.)

---

## Task 8: Range selection — single-day range (same date twice)

- [ ] **Step 1: Write failing test**

```tsx
it('clicking the same date that is `from` yields a single-day range and closes', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <DatePicker
      mode="range"
      aria-label="test"
      onValueChange={onValueChange}
      defaultValue={{ from: new Date('2026-04-10'), to: undefined }}
    />,
  );
  await user.click(screen.getByRole('combobox'));
  const day10 = await screen.findByRole('button', { name: /10/ });
  await user.click(day10);
  const lastCall = onValueChange.mock.calls.at(-1)?.[0];
  expect(lastCall.from.getDate()).toBe(10);
  expect(lastCall.to.getDate()).toBe(10);
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
});
```

- [ ] **Step 2: Run test**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx -t "single-day range"`
Expected: PASS or FAIL — rdp v9 may treat same-date click as deselect. If fails, patch `handleSelect`:

```tsx
// Same-day: if rdp gives us an undefined range on a click matching from (it deselects), keep it as a single-day range.
if (value?.from && narrowed === undefined) {
  // User clicked the current `from`. Treat as single-day range.
  narrowed = { from: value.from, to: value.from };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/DatePicker/datePickerStateHelpers.ts src/components/DatePicker/DatePicker.test.tsx
git commit -m "feat(date-picker): clicking same day commits single-day range"
```

---

## Task 9: Range clear — `onValueChange(undefined)` + hidden inputs empty

- [ ] **Step 1: Write failing test**

```tsx
it('Clear button fires onValueChange(undefined) and empties both hidden inputs', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const { container } = render(
    <DatePicker
      mode="range"
      aria-label="test"
      onValueChange={onValueChange}
      name="stay"
      defaultValue={{ from: new Date('2026-04-10'), to: new Date('2026-04-15') }}
    />,
  );
  await user.click(screen.getByRole('combobox'));
  await user.click(screen.getByRole('button', { name: /Clear/i }));
  expect(onValueChange).toHaveBeenCalledWith(undefined);
  expect(container.querySelector('input[name="stay_from"]')).toHaveValue('');
  expect(container.querySelector('input[name="stay_to"]')).toHaveValue('');
});
```

- [ ] **Step 2: Run test**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx -t "Clear button"`
Expected: PASS — `clear()` is already wired in `buildRangeState` (Task 4).

If hidden inputs show empty string correctly but the test still fails, it's likely because the rendered `<input type="hidden">` has `value=""` but React's `toHaveValue('')` has subtle behavior for hidden inputs. Use `.toHaveAttribute('value', '')` as an alternative assertion.

- [ ] **Step 3: Commit**

```bash
git add src/components/DatePicker/DatePicker.test.tsx
git commit -m "test(date-picker): range Clear resets both hidden inputs"
```

---

## Task 10: Range hidden inputs — suffix convention

- [ ] **Step 1: Write failing test**

```tsx
it('range mode renders name_from and name_to hidden inputs with ISO values', () => {
  const { container } = render(
    <DatePicker
      mode="range"
      name="stay"
      defaultValue={{ from: new Date('2026-04-01'), to: new Date('2026-04-15') }}
    />,
  );
  expect(container.querySelector('input[name="stay_from"]')).toHaveAttribute('value', '2026-04-01');
  expect(container.querySelector('input[name="stay_to"]')).toHaveAttribute('value', '2026-04-15');
  expect(container.querySelector('input[name="stay"]')).toBeNull();
});
```

- [ ] **Step 2: Run test**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx -t "name_from and name_to"`
Expected: PASS — already implemented in `buildRangeState` (Task 4).

- [ ] **Step 3: Commit**

```bash
git add src/components/DatePicker/DatePicker.test.tsx
git commit -m "test(date-picker): range name suffix convention (_from, _to)"
```

---

## Task 11: Range display formatting — complete + partial

- [ ] **Step 1: Write failing test for complete range display**

```tsx
it('renders arrow-separated complete range in trigger', () => {
  render(
    <DatePicker
      mode="range"
      aria-label="test"
      defaultValue={{ from: new Date('2026-04-01'), to: new Date('2026-04-15') }}
    />,
  );
  // sv locale formats as "2026-04-01" via 'P'. Trigger has en-dash separator.
  expect(screen.getByRole('combobox')).toHaveTextContent(/2026-04-01 – 2026-04-15/);
});

it('renders partial range with ellipsis when only `from` is set', () => {
  render(
    <DatePicker
      mode="range"
      aria-label="test"
      defaultValue={{ from: new Date('2026-04-01'), to: undefined }}
    />,
  );
  expect(screen.getByRole('combobox')).toHaveTextContent(/2026-04-01 – …/);
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx -t "arrow-separated"`
Expected: PASS — `defaultRangeFormat` is already implemented in Task 4.

If the date format looks wrong (e.g. `P` in `sv` locale outputs `2026-04-01` but the test expected `1 apr 2026`), adjust the assertion to match the actual output of `date-fns` with the `sv` locale.

- [ ] **Step 3: Commit**

```bash
git add src/components/DatePicker/DatePicker.test.tsx
git commit -m "test(date-picker): range trigger display (complete + partial)"
```

---

## Task 12: `mode` change warning (dev)

- [ ] **Step 1: Write failing test**

```tsx
it('warns once when `mode` prop changes between renders', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const { rerender } = render(<DatePicker mode="single" aria-label="test" />);
  rerender(<DatePicker mode="range" aria-label="test" />);
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('`mode` is mount-time'),
  );
  warn.mockRestore();
});
```

- [ ] **Step 2: Run test**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx -t "warns once when"`
Expected: PASS — already wired in `useDatePickerState` (Task 3).

- [ ] **Step 3: Commit**

```bash
git add src/components/DatePicker/DatePicker.test.tsx
git commit -m "test(date-picker): warn on runtime mode change"
```

---

## Task 13: Shape-mismatch warning (`mode="range"` with `Date` value)

- [ ] **Step 1: Write failing test**

```tsx
it('warns and renders empty when mode="range" receives a Date value', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  render(
    <DatePicker
      // @ts-expect-error — intentional shape mismatch to verify runtime warning
      mode="range"
      value={new Date('2026-04-01')}
      aria-label="test"
    />,
  );
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('requires `value` / `defaultValue` of shape'),
  );
  // Renders as empty (placeholder)
  expect(screen.getByRole('combobox')).toHaveTextContent(/Pick dates/);
  warn.mockRestore();
});
```

- [ ] **Step 2: Run test**

Run: `npx vitest run --project unit src/components/DatePicker/DatePicker.test.tsx -t "mode=\"range\" receives a Date"`
Expected: PASS — already wired in Task 3.

- [ ] **Step 3: Commit**

```bash
git add src/components/DatePicker/DatePicker.test.tsx
git commit -m "test(date-picker): warn on range/Date shape mismatch"
```

---

## Task 14: Range-specific day classNames (`range_start`, `range_end`, `range_middle`)

Visual-only change. Cannot be reliably unit-tested in jsdom; verified manually via Storybook in later tasks.

- [ ] **Step 1: Add range modifier classNames to the `rdpClassNames` object in `DatePicker.tsx`**

Extend the existing `rdpClassNames`:

```tsx
const rdpClassNames = {
  // ... existing keys unchanged ...
  range_start:
    'bg-[var(--color-interactive-brand-bg)] text-[var(--color-text-on-brand)] ' +
    'rounded-l-[var(--radius-sm)] rounded-r-none',
  range_end:
    'bg-[var(--color-interactive-brand-bg)] text-[var(--color-text-on-brand)] ' +
    'rounded-r-[var(--radius-sm)] rounded-l-none',
  range_middle:
    'bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] rounded-none',
};
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Run full unit suite (smoke)**

Run: `npx vitest run --project unit`
Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/DatePicker/DatePicker.tsx
git commit -m "style(date-picker): range_start/end/middle day styling"
```

---

## Task 15: Add `RangePlayground` story

- [ ] **Step 1: Append the story**

Add to `src/components/DatePicker/DatePicker.stories.tsx` (keep existing stories):

```tsx
export const RangePlayground: Story = {
  args: {
    mode: 'range',
    size: 'md',
    status: 'default',
    fullWidth: false,
    disabled: false,
    clearable: true,
    showTodayButton: true,
  },
  render: (args) => (
    <div className="w-80">
      <DatePicker {...args} />
    </div>
  ),
};
```

If the existing stories use `args` objects typed against the single-mode props, cast inside the story: `args as DatePickerRangeProps`.

- [ ] **Step 2: Verify it loads**

Start Storybook: `npm run storybook &` (if not already running). Navigate to the DatePicker RangePlayground story in your browser at http://localhost:6006. Open the popover, click a day, confirm the popover stays open with the partial display; click another day, confirm the popover closes with the complete range.

- [ ] **Step 3: Commit**

```bash
git add src/components/DatePicker/DatePicker.stories.tsx
git commit -m "docs(date-picker): add RangePlayground story"
```

---

## Task 16: Add `RangeWithConstraints` story

- [ ] **Step 1: Append the story**

```tsx
export const RangeWithConstraints: Story = {
  args: {
    mode: 'range',
    minDate: new Date('2026-04-05'),
    maxDate: new Date('2026-04-25'),
    defaultValue: { from: new Date('2026-04-10'), to: new Date('2026-04-15') },
  },
  render: (args) => (
    <div className="w-80">
      <DatePicker {...args} />
    </div>
  ),
};
```

- [ ] **Step 2: Verify constraints in the UI**

Open the story. Confirm days outside `2026-04-05 – 2026-04-25` are rendered with the disabled class and cannot be clicked.

- [ ] **Step 3: Commit**

```bash
git add src/components/DatePicker/DatePicker.stories.tsx
git commit -m "docs(date-picker): add RangeWithConstraints story"
```

---

## Task 17: Add `RangeInFormField` story

This verifies the two-hidden-input form-integration story works.

- [ ] **Step 1: Append the story**

Check how the existing `InFormField` story in `DatePicker.stories.tsx` wraps the component; mirror that for range. Example:

```tsx
export const RangeInFormField: Story = {
  render: () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        alert(JSON.stringify({ from: data.get('stay_from'), to: data.get('stay_to') }));
      }}
      className="flex flex-col gap-3 w-80"
    >
      <label htmlFor="stay" className="text-sm font-medium">Stay</label>
      <DatePicker mode="range" name="stay" id="stay" />
      <button type="submit" className="mt-2 border rounded px-3 py-1 text-sm">Submit</button>
    </form>
  ),
};
```

- [ ] **Step 2: Verify**

Fill in a range, submit, confirm the alert shows both `stay_from` and `stay_to` as ISO date strings.

- [ ] **Step 3: Commit**

```bash
git add src/components/DatePicker/DatePicker.stories.tsx
git commit -m "docs(date-picker): add RangeInFormField story"
```

---

## Task 18: Add `RangePartialState` play function

- [ ] **Step 1: Append the story with a play function**

Refer to any existing `play` function in `DatePicker.stories.tsx` for idiomatic usage of `@storybook/test`'s `userEvent` / `expect`. Example:

```tsx
import { userEvent, within, expect } from '@storybook/test';

export const RangePartialState: Story = {
  args: { mode: 'range' },
  render: (args) => (
    <div className="w-80">
      <DatePicker {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);
    // Popover is open, find a day and click it.
    // Use `document.body` because the Popover renders in a Portal.
    const popover = within(document.body);
    const firstDay = await popover.findByRole('button', { name: /\b\d+\b/ });
    await userEvent.click(firstDay);
    // Popover stays open — aria-expanded still true.
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Trigger now shows a partial range (ends with `…`).
    await expect(trigger).toHaveTextContent(/…/);
  },
};
```

- [ ] **Step 2: Run the story in Storybook**

With Storybook running, open the RangePartialState story. Click "Run tests" in the Storybook toolbar to execute the play function. Confirm it passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/DatePicker/DatePicker.stories.tsx
git commit -m "test(date-picker): add RangePartialState play function"
```

---

## Task 19: Add `RangeKeyboardInteraction` play function

- [ ] **Step 1: Append the story**

```tsx
export const RangeKeyboardInteraction: Story = {
  args: { mode: 'range' },
  render: (args) => (
    <div className="w-80">
      <DatePicker {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    trigger.focus();
    // ArrowDown opens popover and focuses first enabled day.
    await userEvent.keyboard('{ArrowDown}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Move right one day, press Enter to set `from`.
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true'); // partial — still open
    // Navigate a few days right, press Enter to set `to`.
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false'); // complete — closed
  },
};
```

- [ ] **Step 2: Verify in Storybook**

Open the story, run the play function via the Storybook toolbar. Confirm it passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/DatePicker/DatePicker.stories.tsx
git commit -m "test(date-picker): add RangeKeyboardInteraction play function"
```

---

## Task 20: Runtime a11y scan (light + dark)

- [ ] **Step 1: Ensure Storybook is running on :6006**

```bash
npm run storybook &
# Wait for "Storybook started" message on http://localhost:6006
```

- [ ] **Step 2: Run the a11y scan in light mode**

Run: `node scripts/a11y-runtime-scan.mjs`
Expected: 0 violations on all range stories.

If the scan reports `color-contrast` violations on the `range_middle` cell's text, this is the `--color-bg-subtle` / `--color-text-primary` combination. Two options:
1. Swap `range_middle` text color to `--color-text-on-subtle` or another audited pairing (verify in `A11Y-COLOR-AUDIT.md`).
2. If no audited pairing exists, add `range_middle` stories to `CONTRAST_EXEMPT_STORIES` in the scan script with a WHY comment — but only if the failure is a known token-layer issue, not a real contrast bug. Prefer fix over suppress.

- [ ] **Step 3: Run the scan in dark mode**

Run: `node scripts/a11y-runtime-scan.mjs --dark`
Expected: 0 violations.

- [ ] **Step 4: Fix any violations and re-run**

If violations found, address them, commit the fix, and repeat steps 2–3.

- [ ] **Step 5: Commit (if changes made; otherwise skip)**

```bash
git add <changed files>
git commit -m "fix(date-picker): resolve a11y scan violation on range_middle"
```

---

## Task 21: Update README.md

- [ ] **Step 1: Find the DatePicker bullet in README.md**

Open `README.md`. Find the Components list and the DatePicker bullet.

- [ ] **Step 2: Add a range-mode note**

Update the DatePicker bullet to mention range support. Example:

```md
- `DatePicker` — single-date picker (`mode="single"`, default) or date-range picker (`mode="range"`). TextInput-styled trigger, popover calendar, `minDate` / `maxDate` constraints, localizable via `date-fns` locale. Range mode serializes to two hidden inputs (`name_from`, `name_to`) when `name` is provided.
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document DatePicker range mode in README"
```

---

## Task 22: Update CHANGELOG.md

- [ ] **Step 1: Add a v0.8.0 entry**

Prepend a new section above the existing v0.7.0 section:

```md
## 0.8.0 — 2026-04-24

### Added

- `DatePicker` — **range mode** via `mode="range"` prop. Pick a `from` and `to` date in the same popover; single arrow-separated trigger (`2026-04-01 – 2026-04-15`); partial-range display during selection (`2026-04-01 – …`). When `name` is provided, renders two hidden inputs with `_from` / `_to` suffixes for native form submits.
- New exports: `DatePickerSingleProps`, `DatePickerRangeProps`, and `DateRange` (re-exported from `react-day-picker`).

### Changed

- Internal refactor of `DatePicker`: state management extracted into `useDatePickerState` hook with `buildSingleState` / `buildRangeState` pure builders. **No breaking changes** — existing `<DatePicker>` usage (default `mode="single"`) is fully backwards-compatible.
```

- [ ] **Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: add v0.8.0 changelog entry for range mode"
```

---

## Task 23: Version bump to 0.8.0

- [ ] **Step 1: Update `version` in `package.json`**

Change `"version": "0.7.0"` to `"version": "0.8.0"`.

- [ ] **Step 2: Sync lockfile**

Run: `npm install`
Expected: only `package-lock.json` changes (version bump sync); no other dependency changes.

- [ ] **Step 3: Run the full unit suite one more time**

Run: `npx vitest run --project unit`
Expected: all tests pass.

- [ ] **Step 4: Run the library build to verify no TypeScript regressions**

Run: `npm run build`
Expected: `dist/` is produced with `index.d.ts`, `index.js`, `index.cjs`, `style.css`. No errors.

- [ ] **Step 5: Commit version bump separately from feature work**

```bash
git add package.json package-lock.json
git commit -m "chore(release): v0.8.0"
```

---

## Task 24: Post-merge follow-up

The user's memory indicates they publish by pushing a tag and creating a GitHub Release (not via CLI). Do NOT tag, push, or release in this plan. Stop after Task 23 and confirm with the user that:

1. They want to push the branch and open a PR.
2. After merge, they'll cut the tag + GitHub Release manually (which triggers `publish.yml`).

Also update Linear:

- [ ] **Step 1: Post a completion comment on STU-6**

Include: summary of what shipped, links to the spec + plan, the final commit SHA range.

- [ ] **Step 2: Move STU-6 to "In Review" state if PR opened; "Done" after merge**

Wait for user instruction before changing status.

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Discriminated API union — Task 1
- ✅ `useSingleDateState` / `useRangeDateState` conceptual refactor — Tasks 2, 3, 4 (implemented as single hook + two pure builders, per React rules of hooks; functionally equivalent)
- ✅ Partial + complete + swap + single-day range behavior — Tasks 5–8
- ✅ Clear — Task 9
- ✅ Hidden inputs suffix convention — Task 10 (+ Task 4 implementation)
- ✅ Arrow-separated display + partial `…` — Task 11
- ✅ Mode-change + shape-mismatch warnings — Tasks 12, 13
- ✅ Range-specific day classNames — Task 14
- ✅ Stories — Tasks 15–17
- ✅ Play functions (partial + keyboard) — Tasks 18, 19
- ✅ Runtime a11y scan — Task 20
- ✅ Docs — Tasks 21, 22
- ✅ Version + changelog — Tasks 22, 23

**Deviations from spec:**
- Spec says "two internal hooks" — plan uses one hook + two pure builders instead, to comply with React's rules of hooks (same React hooks called in the same order every render regardless of mode). Functionally equivalent; refactor decision 6's spirit (mode-specific logic in one place per mode) is preserved.

**Risks & gotchas:**
- rdp v9's default `onSelect` semantics for `mode="range"` (reverse-click swap, same-day deselect) may or may not match the spec's spelled-out behavior. Tasks 7 and 8 include contingency patches to `handleSelect` if rdp's defaults don't align.
- `color-contrast` on `range_middle` may need token-audit confirmation (Task 20). Fallback plan documented.
- Play functions on Popover-portaled content require `within(document.body)` not `within(canvasElement)`.
