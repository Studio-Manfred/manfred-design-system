# DatePicker range mode — design spec

**Linear:** [STU-6 — DatePicker: date range mode (from / to)](https://linear.app/studio-manfred/issue/STU-6/datepicker-date-range-mode-from-to)
**Status:** Approved for implementation — 2026-04-24
**Owner:** Jens Wedin (sole maintainer)
**Target release:** v0.8.0 (next minor)
**Builds on:** [`2026-04-24-datepicker-design.md`](./2026-04-24-datepicker-design.md) (STU-5, shipped in v0.7.0)

## Context

v0.7.0 shipped `<DatePicker>` with single-date selection only. Range selection (`from` / `to`) was explicitly deferred in the v1 "Out of scope" list. STU-6 adds it. `react-day-picker` v9 already supports `mode="range"` with a `DateRange = { from?: Date; to?: Date }` value shape, so the backing library work is a config change; the interesting work is the public API, the shared internal refactor, and the range-specific styling and behavior.

## Scope

**v0.8.0 ships:** range mode on the existing `<DatePicker>`, selected via a new `mode` prop (defaults to `'single'`, so v0.7 consumers don't change anything). Same popover, same trigger styling, same token contract.

**Explicitly not in v0.8.0** (each becomes a follow-up Linear ticket if wanted):
- Hover preview (highlighting candidate range while `from` is set)
- Two-month side-by-side popover
- `minNights` / `maxNights` length constraints
- Multi-date selection (`mode="multiple"`)
- Preset shortcut pills — tracked in STU-9
- Typed-entry trigger
- Runtime mode-switching (the `mode` prop is treated as mount-time)

## Decisions made during brainstorm

| # | Decision | Choice | Why |
|---|---|---|---|
| 1 | Component shape | One component with `mode` prop, `mode` defaults to `'single'` | One import; full v0.7 backwards compat; internal refactor isolates the branching |
| 2 | Trigger display | Single trigger, arrow-separated (`1 apr – 15 apr`); partial → `1 apr – …` | Keeps form vocabulary aligned with single mode; one focusable; one `role="combobox"` |
| 3 | Hidden form input | Suffix convention: `name="stay"` → `stay_from` + `stay_to` | Drops into `FormData` / RHF / URL params without consumer-side string-splitting |
| 4 | `minNights` / `maxNights` | Skip v1 | No concrete consumer; vocabulary is booking-specific; revisit with real use case |
| 5 | Months in popover | One month in both modes | Simpler popover sizing for v1; revisit if month-boundary paging hurts |
| 6 | Refactor approach | Two internal hooks (`useSingleDateState`, `useRangeDateState`) + shared shell | Mode-specific logic in one place per mode; main component renders a uniform tree |
| 7 | Runtime mode-switching | Mount-time only; dev warn on change | Rules-of-hooks safety; matches `<input type>` pattern; realistic use case is nil |
| 8 | Hover preview | Skip v1 | Not in acceptance; adds state and event plumbing; polish-tier |

## Architecture

```
DatePicker (top-level export, refactored)
├── useSingleDateState()               ← new internal hook
│     returns DatePickerInternalState
├── useRangeDateState()                ← new internal hook
│     returns DatePickerInternalState
└── Shared render tree
    ├── {hiddenInputs.map(…)}          ← 0 (no name), 1 (single), or 2 (range) inputs
    └── Popover.Root
        ├── Popover.Trigger (asChild)
        │   └── <button>               ← inputLikeVariants, arrow-separated label for range
        └── Popover.Portal
            └── Popover.Content
                ├── DayPicker mode={mode} …
                └── Footer: Today · Clear
```

**No new peer dependencies.** `react-day-picker` v9 already exports `DateRange` and supports `mode="range"`; `date-fns` is already declared.

**No new tokens.** Range highlighting reuses existing semantic tokens — see [Styling](#styling-and-tokens).

### Internal state shape

Both hooks return the same normalized struct, so the render path never branches on mode:

```ts
interface DatePickerInternalState {
  displayText: string;                        // trigger label content
  isEmpty: boolean;                           // drives placeholder-muted class
  hiddenInputs: Array<{ name: string; value: string }>;
  rdpSelected: Date | DateRange | undefined;  // passed straight to <DayPicker selected={...}>
  handleSelect: (next: Date | DateRange | undefined) => void;
  shouldCloseOnSelect: (next: Date | DateRange | undefined) => boolean;
  captionMonth: Date;                         // what month to display when opening
}
```

The main component:

```ts
const state = mode === 'range'
  ? useRangeDateState(rangeProps)
  : useSingleDateState(singleProps);
```

This branch is **stable across renders** because `mode` is mount-time (decision 7). A dev-mode effect warns on mode change.

### Files added

- `src/components/DatePicker/useSingleDateState.ts`
- `src/components/DatePicker/useRangeDateState.ts`

### Files changed

- `src/components/DatePicker/DatePicker.tsx` — public-API union, branch to the right hook, render shared tree.
- `src/components/DatePicker/DatePicker.stories.tsx` — add range stories (see [Testing](#testing)).
- `src/components/DatePicker/DatePicker.test.tsx` — add range-mode suite.
- `src/components/DatePicker/index.ts` — no change (discriminated union is still exported as `DatePickerProps`).
- `src/index.ts` — no change to barrel (no new components, just expanded props).
- `README.md` — note range mode under the DatePicker bullet in Components.
- `CHANGELOG.md` — v0.8.0 entry.

## Public API

```tsx
import type { Locale } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { InputLikeSize, InputLikeStatus } from '@/lib/inputLikeVariants';

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

type DatePickerSingleProps = DatePickerBaseProps & {
  mode?: 'single';
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (value: Date | undefined) => void;
  formatValue?: (value: Date, locale: Locale) => string;
};

type DatePickerRangeProps = DatePickerBaseProps & {
  mode: 'range';
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange | undefined) => void;
  formatValue?: (value: DateRange, locale: Locale) => string;
};

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;
```

**API rules**

- `mode` defaults to `'single'` → v0.7 consumers unchanged.
- Discriminated union keyed on `mode`; TypeScript narrows `value` / `onValueChange` / `formatValue` per mode.
- `formatValue` defaults:
  - Single: `format(value, 'P', { locale })` (unchanged from v0.7).
  - Range complete: `${format(from, 'P', { locale })} – ${format(to, 'P', { locale })}` (en-dash with thin spaces).
  - Range partial (only `from`): `${format(from, 'P', { locale })} – …`.
- `placeholder` defaults:
  - Single: localized `"Pick a date"`.
  - Range: localized `"Pick dates"`.
- `name` + range mode → renders two sibling `<input type="hidden">` elements with suffixes `_from` and `_to`. Both values are `yyyy-MM-dd`; empty string when the corresponding endpoint is unset.
- `name` + single mode → unchanged (one hidden input).
- `clearable` → when the value is any-non-empty (single: `value !== undefined`; range: `from || to`), a Clear button calls `onValueChange(undefined)`.
- `required` → `aria-required` on the trigger. Form-level validation is the consumer's problem; we don't block submits.

**Dev-mode warnings (once)**
- `value` + `defaultValue` together → "value wins".
- Mode prop changes between renders → "`mode` is mount-time; render two separate instances if you need both".
- `mode="range"` with `value` whose shape is not `DateRange` (e.g. accidentally `Date`) → renders empty, warns.
- `minDate > maxDate` (unchanged from v0.7) → warns, range treated as empty.

## Behavior

### Opening (unchanged across modes)

- Click / tap trigger → popover opens.
- Keyboard on focused trigger: `Enter`, `Space`, `ArrowDown`, `ArrowUp` opens. `ArrowDown` focuses first enabled day; `ArrowUp` focuses last.
- `disabled` → trigger is non-interactive; popover never opens.

### Single-mode selection (unchanged from v0.7)

- Click a day → `onValueChange(date)`, popover closes, focus returns to trigger.

### Range-mode selection

1. Popover opens. Starting state in range mode is whatever the current value is (may be empty, partial, or complete).
2. First click (popover open, no active partial range) → sets `{ from: <clicked>, to: undefined }`. Popover **stays open**. Display updates to `1 apr – …`. `onValueChange({ from, to: undefined })` fires.
3. Second click (popover still open, partial range already set):
   - Clicked date **after** `from` → `{ from, to: <clicked> }`. Popover **closes**. `onValueChange({ from, to })` fires with both dates.
   - Clicked date **before** `from` → rdp v9 default: the new click becomes `from`, the old `from` becomes `to`. Popover closes. `onValueChange({ from: <new>, to: <old from> })` fires.
   - Clicked date **equal** to `from` → `{ from: X, to: X }` (single-day range). Popover closes.
4. After a complete range exists, clicking any day in the popover (re-opening or without closing) starts a new partial: `{ from: <clicked>, to: undefined }`. Popover stays open.

This passes through rdp v9's default `onSelect` semantics for `mode="range"` — we don't reinvent them.

### Clear

- Single mode: `onValueChange(undefined)`.
- Range mode: `onValueChange(undefined)` (not `{ from: undefined, to: undefined }`).
- Popover closes, focus returns to trigger.

### Today button

Unchanged. Jumps calendar to current month, does not auto-select. Same in both modes.

### Escape

Closes popover without committing. If the session started from an empty range and the user picked only `from` before pressing Escape, the committed value reverts to what it was before the popover opened (uncontrolled) or remains unchanged (controlled).

### Constraints

`minDate` / `maxDate` uniformly disable out-of-range days via rdp's `disabled` matcher. Arrow navigation skips disabled days. Mouse click is no-op. Applies to both modes.

### Controlled / uncontrolled

Same split as v0.7:
- `value` present → controlled; internal state unused.
- `defaultValue` or nothing → uncontrolled.
- `open` / `onOpenChange` follow the same split.
- Both `value` and `defaultValue` → `value` wins, dev warn once.

## Accessibility

**Trigger** (unchanged structure from v0.7)
- `<button type="button">` with `role="combobox"`, `aria-haspopup="dialog"`, `aria-expanded={open}`, `aria-controls={popoverId}`.
- Accessible name: `aria-label` if provided, else `aria-labelledby`, else the current display text (range: arrow-separated; partial: `"1 apr – …"`).
- `aria-invalid`, `aria-required`, `aria-describedby` as v0.7.

**Popover** (unchanged)
- Radix `PopoverContent` → `role="dialog"` + built-in focus trap.
- `aria-label`: localized `"Choose dates"` in range mode, `"Choose a date"` in single (existing).

**Calendar grid**
- Delegated to rdp v9 (WAI-ARIA Date Picker Dialog pattern). Range mode uses the same grid semantics — users navigate and commit with the same keys.

**Keyboard map** — identical to v0.7 single-mode keyboard map. `Enter` on a focused day commits that day as either the first click (sets `from`, stays open) or second click (sets `to`, closes).

**Range endpoints contrast**
- `range_start`, `range_end`: `--color-interactive-brand-bg` / `--color-text-on-brand` — already verified in `A11Y-COLOR-AUDIT.md` as meeting WCAG AA.
- `range_middle`: `--color-bg-subtle` / `--color-text-primary`. **Verify this combination during implementation.** If it fails contrast, fallback is `--color-bg-muted` which is in the audit.

**Axe false-positive budget** — same as v0.7 (the Popover portal inherits whatever rules needed disabling for Dialog). No new rule disables anticipated.

## Styling and tokens

rdp v9 emits three range-specific modifier classes on the `<td>` day cell: `range_start`, `range_end`, `range_middle`. The `selected` modifier still applies to both endpoints (additive).

### Day cell styling additions

| rdp modifier | Classes (semantic tokens) |
|---|---|
| `range_start` | `bg-[var(--color-interactive-brand-bg)] text-[var(--color-text-on-brand)] rounded-l-[var(--radius-sm)] rounded-r-none` |
| `range_end` | `bg-[var(--color-interactive-brand-bg)] text-[var(--color-text-on-brand)] rounded-r-[var(--radius-sm)] rounded-l-none` |
| `range_middle` | `bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] rounded-none` |
| `range_start` + `range_end` (single-day range) | Existing `selected` class wins; fully rounded. No extra rule needed. |

The existing `day_button` inner `<button>` keeps `size-9 inline-flex items-center justify-center` for 40×40 touch targets.

### Trigger text (range mode)

- Active value, both set: `formatValue({from, to}, locale)`. Default: `1 apr – 15 apr` (en-dash `–` with thin ` ` spaces).
- Active value, partial (`from` only): `formatValue` is called with `{from, to: undefined}` and the default format returns `1 apr – …`. Consumers who override `formatValue` are responsible for rendering a partial range.
- No value: `placeholder` (default `"Pick dates"`).

### Popover sizing

No change — same width as single mode. `numberOfMonths={1}` in both modes.

### Dark mode

All referenced tokens rebind under `.dark`. No DatePicker-specific dark overrides.

## Testing

### Unit (`DatePicker.test.tsx`, jsdom, `unit` project)

Additions to the existing suite:

- Range-mode controlled — `value={{from, to}}` + `onValueChange` → clicking a day fires with correct `DateRange`.
- Range-mode uncontrolled — `defaultValue` seed → internal state tracks; `onValueChange` still fires.
- Partial-range state — first click produces `{from, to: undefined}`, popover stays open, `onValueChange` fires once.
- Complete-range commit — second click produces `{from, to}`, popover closes, `onValueChange` fires with both.
- Swap on reverse click — second click **before** `from` swaps: `{from: <new>, to: <old from>}`.
- Same-day range — clicking same date twice yields `{from: X, to: X}`.
- Range clear — `onValueChange(undefined)` fires; both hidden inputs become empty strings.
- Range hidden inputs — `name="stay"` renders `<input name="stay_from">` + `<input name="stay_to">` with ISO values.
- `mode` prop change warns (dev) — render, then re-render with different `mode` → one `console.warn`.
- `mode="range"` with shape-wrong `value` (accidentally `Date`) → dev warn, renders empty.

### Stories (`DatePicker.stories.tsx`, browser project)

- `RangePlayground` — controls for mode, `minDate`, `maxDate`, `disabled`, `status`, `size`, `fullWidth`.
- `RangeWithConstraints` — `minDate` / `maxDate` applied; asserts disabled cells are not pickable.
- `RangeInFormField` — wrapped in FormField with label + error state; validates two hidden inputs appear.
- `RangePartialState` (play fn) — opens popover, clicks one day, asserts popover stays open and trigger reads `"1 apr – …"`.
- `RangeKeyboardInteraction` (play fn) — `Tab` to trigger, `ArrowDown` opens, arrow keys navigate, `Enter` sets `from`, arrow keys again, `Enter` sets `to`, popover closes.

### A11y gates

- Unit project: all existing + new tests pass.
- Runtime scan (`scripts/a11y-runtime-scan.mjs`): zero violations in light + dark including range stories. Update `CONTRAST_EXEMPT_STORIES` only if a genuine showcase reason applies (shouldn't, for range mode).
- Storybook vitest (Playwright Chromium): all play functions pass.

### Test data

Use fixed dates (`new Date('2026-04-01')`), not `new Date()`, to avoid month-boundary flake. Assert on ISO strings from the hidden inputs where Date equality is fragile.

## Rollout

- **Version**: v0.8.0 (minor — additive public API, zero breaking changes).
- **Changelog**: new "Added" section under v0.8.0: range mode via `mode="range"` prop on `<DatePicker>`.
- **README**: append range-mode note to the DatePicker bullet.
- **Migration**: none. Existing consumers pass no `mode` and continue to get single mode.

## Out of scope (follow-up tickets if wanted)

- Hover preview on partial range.
- Two-month side-by-side popover.
- `minNights` / `maxNights` length caps.
- Multi-date selection.
- Typed-entry trigger.
- Preset pills (covered by STU-9).
- Runtime mode-switching.
- `weekStartsOn` override (still inherited from locale).
- Per-weekday / per-date disabled matchers.
