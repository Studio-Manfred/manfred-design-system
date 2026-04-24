# DatePicker — design spec

**Linear:** [STU-5 — New feature: add pickdate / calendar component](https://linear.app/studio-manfred/issue/STU-5/new-feature-add-pickdate-calendar-component)
**Status:** Approved for implementation — 2026-04-24
**Owner:** Jens Wedin (sole maintainer)
**Target release:** v0.7.0 (next minor)

## Context

Linear ticket STU-5 asks for a "pickdate / calendar component" built on React + Tailwind + shadcn conventions, using Manfred tokens and colors. The design system covers form primitives (TextInput, Checkbox, etc.) and modal/overlay primitives (Dialog, Tooltip), but has no date affordance yet. Consumers currently reach for third-party pickers that don't honor the three-layer token contract, breaking visual consistency.

## Scope

**v1 ships:** a single-date picker with a TextInput-styled trigger that opens a popover calendar. Calendar-only selection (no typed entry). `minDate` / `maxDate` constraints. Localized via a consumer-supplied `date-fns` locale (default `sv`).

**Explicitly not in v1** (each becomes a follow-up Linear ticket if wanted):
- Date ranges (from/to)
- Multi-date selection
- Typed entry on the trigger
- Time-of-day picking
- Preset shortcut pills ("Last 7 days", "This month")
- Custom calendar layouts (week-view, year-view)

## Decisions made during brainstorm

| Decision | Choice | Why |
|---|---|---|
| Primary use case | Quick pick — scheduling / booking a single date | Matches likely first consumers; narrows API surface |
| Trigger style | TextInput-styled (icon-trailing, input-looking button) | Fits existing form vocabulary; trigger C on closed |
| Locale | Consumer-supplied `date-fns` Locale, default `sv` | Future-proofs multilingual without bundling every locale |
| Typed entry | Out of v1 (calendar-only) | Halves implementation effort; cleaner a11y via `role="combobox"` |
| Constraints | `minDate` + `maxDate` only | Covers 80% of booking/scheduling needs; YAGNI on disabled-lists |
| Internal composition | Extract shared `inputLikeVariants` CVA | Cleanest a11y (real `<button>` trigger), no visual drift, reusable for future Select/Combobox |
| Backing library | `react-day-picker` v9 (peer dep) | Canonical shadcn pattern; WAI-ARIA compliant out of the box |

## Architecture

```
DatePicker (top-level export)
├── PopoverRoot                           ← @radix-ui/react-popover
│   ├── PopoverTrigger (asChild)
│   │   └── <button>                      ← styled via shared inputLikeVariants
│   │       ├── <span> (value or placeholder, localized)
│   │       └── <Icon name="calendar" />
│   │
│   └── PopoverContent
│       └── DayPicker                     ← react-day-picker, themed via tokens
│           + optional footer: Today · Clear buttons (existing Button variant=ghost)
```

**New peer dependencies**
- `react-day-picker` (~34 KB gzip)
- `date-fns` (already a transitive of rdp v9 — listed explicitly for honesty about what consumers install)

**New shared module**
- `src/lib/inputLikeVariants.ts` — the CVA block lifted verbatim from `TextInput.tsx`. TextInput imports from there going forward; DatePicker imports from there. Both stay visually locked with zero hex / zero drift.

**Files added**
- `src/components/DatePicker/DatePicker.tsx`
- `src/components/DatePicker/DatePicker.stories.tsx` — `Playground`, `WithConstraints`, `InFormField`, `KeyboardInteraction` (play fn)
- `src/components/DatePicker/DatePicker.test.tsx` — jsdom unit tests (render / controlled / uncontrolled / keyboard / form integration)
- `src/components/DatePicker/index.ts` — barrel re-export
- `src/lib/inputLikeVariants.ts`

**Files changed**
- `src/components/TextInput/TextInput.tsx` — imports `inputLikeVariants` from the new shared module (straight extraction, no behavior change)
- `src/index.ts` — adds `DatePicker`, `DatePickerProps` exports
- `package.json` — adds `react-day-picker` and `date-fns` to `peerDependencies`
- `vite.config.ts` — adds both to `rollupOptions.external`

## Public API

```tsx
import type { Locale } from 'date-fns';
import type { TextInputSize, TextInputStatus } from '../TextInput';

export interface DatePickerProps {
  // Value & change
  value?: Date;                                          // controlled
  defaultValue?: Date;                                   // uncontrolled
  onValueChange?: (value: Date | undefined) => void;     // fires on pick or clear

  // Display
  placeholder?: string;                                  // default: localized 'dd/mm/yyyy' hint for the active locale
  formatValue?: (value: Date, locale: Locale) => string; // default: format(value, 'P', { locale })
  locale?: Locale;                                       // default: sv from date-fns/locale/sv

  // Constraints
  minDate?: Date;
  maxDate?: Date;

  // Footer actions
  clearable?: boolean;                                   // default: true
  showTodayButton?: boolean;                             // default: true — jumps calendar to today's month (does NOT auto-select)

  // TextInput-alike pass-through
  size?: TextInputSize;
  status?: TextInputStatus;
  fullWidth?: boolean;
  disabled?: boolean;

  // Form / a11y plumbing
  id?: string;
  name?: string;                                         // renders hidden <input type="hidden" value={isoString}> for native form submits
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
```

**API notes**
- **`name` renders a hidden `<input type="hidden" value={isoString}>`** inside the component. `isoString` is always `format(value, 'yyyy-MM-dd')` — timezone-neutral because dates are calendar days, not moments in time.
- **`onValueChange`** (not `onChange`) — matches Radix convention (`onCheckedChange`, `onOpenChange`) and avoids confusion with DOM `onChange`.
- **`formatValue` is a function**, not a format string — avoids coupling to date-fns's format-string grammar in the public API.

## Behavior

**Opening**
- Click or tap the trigger → popover opens.
- Keyboard: trigger focused → `Enter`, `Space`, `ArrowDown`, or `ArrowUp` opens. `ArrowDown` focuses first enabled day; `ArrowUp` focuses last. Matches the WAI-ARIA Date Picker Dialog pattern.
- `disabled` → trigger is non-interactive and the popover never opens.

**Selection**
- Click a date → `onValueChange(date)` fires, popover closes, focus returns to trigger.
- Keyboard: arrow keys navigate the grid, `Enter` selects and closes, `Escape` closes without selecting.
- Today rendered with a ring (`--color-focus-ring`); selected day with brand-blue fill; disabled days with muted text and `aria-disabled="true"`.

**Constraints**
- `minDate` / `maxDate` disable out-of-range days via rdp's `disabled` matcher. Arrow-key navigation skips disabled days. Mouse click on a disabled day is a no-op.
- If `value` falls outside the range, it's rendered in the trigger as-is (no silent prop mutation), but the matching cell is disabled-and-selected (visual conflict indicator).
- `minDate > maxDate` → one-time dev-mode `console.warn`, range treated as empty.

**Footer actions**
- **`Today`** (when `showTodayButton` and today is inside range): jumps the calendar to today's month. Does NOT auto-select — avoids the "click-Today-and-submit" surprise.
- **`Clear`** (when `clearable` and `value` is set): calls `onValueChange(undefined)`, closes popover, focuses trigger.
- Both use the existing `Button` component at `variant="ghost"`, `size="sm"`.

**Controlled / uncontrolled**
- `value` + `onValueChange` → controlled. Internal state unused.
- `defaultValue` (or nothing) → uncontrolled. Internal state tracks selection; `onValueChange` still fires.
- Both `value` and `defaultValue` → `value` wins (controlled), dev-mode warn once.
- Same split applies to `open` / `onOpenChange`.

**Hidden form input**
- `name` set → a sibling `<input type="hidden" name={name} value={isoString || ''}>`. ISO always `yyyy-MM-dd`, regardless of `locale`.

**Locale switching mid-session**
- Changing the `locale` prop re-renders weekday headers and month names immediately. No internal caching.

## Accessibility

**Trigger**
- `<button type="button">`, not a styled `<input>`.
- `role="combobox"`, `aria-haspopup="dialog"`, `aria-expanded={open}`, `aria-controls={popoverId}`.
- Accessible name: `aria-label` if provided, else the label from a wrapping FormField (via `id`/`htmlFor` linkage), else localized default `"Pick a date"` (strings record keyed by locale).
- `aria-invalid={status === 'error'}`.
- `aria-required={required}`.

**Popover**
- Radix `PopoverContent` → `role="dialog"` + focus-trap built in.
- `aria-label`: localized `"Choose a date"`.

**Calendar grid**
- Delegated to rdp v9, which implements the [WAI-ARIA Date Picker Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) out of the box.
- Validated via play function — we don't just trust rdp got it right.

**Keyboard map**

| Key | Closed trigger | Open calendar |
|---|---|---|
| `Enter` / `Space` | Open | Select focused day |
| `ArrowDown` | Open + focus first enabled day | Move down one row |
| `ArrowUp` | Open + focus last enabled day | Move up one row |
| `ArrowLeft` / `ArrowRight` | — | Move one day |
| `PageUp` / `PageDown` | — | Prev / next month |
| `Shift+PageUp/Down` | — | Prev / next year |
| `Home` / `End` | — | First / last day of week |
| `Escape` | — | Close without selecting |
| `Tab` | Next focusable | Cycle footer buttons, then close |

All rdp defaults except `ArrowDown`/`ArrowUp` on the trigger — we wire those ourselves.

**Contrast and state**
- Selection fill: `--color-interactive-brand-bg` (contrast verified in `A11Y-COLOR-AUDIT.md`)
- Disabled: `--color-text-muted`
- Focus ring: `--shadow-focus`
- Today ring: `--color-focus-ring`

**Reduced motion**
- Popover enter/exit animations gated behind `@media (prefers-reduced-motion: no-preference)`.

**Touch targets**
- Day cells minimum 40×40 px.

**Axe false-positive budget**
- If rdp's portals trigger `aria-hidden-focus` or `aria-valid-attr-value` incomplete-rule warnings (same Radix portal pattern Dialog hit), disable them on the DatePicker meta with a WHY comment. Mirror the Dialog precedent.

## Styling and tokens

**Trigger**
- Imports `inputLikeVariants` from `src/lib/inputLikeVariants.ts`.
- `<button>` styled via `inputLikeVariants({ size, status, fullWidth })`.
- Calendar icon via existing `Icon` component in the trailing slot (same `hasTrailingIcon` variant branch TextInput uses).
- Placeholder text: `--color-text-muted`. Selected value: `--color-text-primary`.

**Popover container**
```tsx
className="rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-overlay)] p-3"
```
Placement: `side="bottom"`, `align="start"`, `sideOffset={4}`. Radix handles collision flipping.

**Calendar grid — rdp classNames mapping (representative)**

| rdp key | Class string |
|---|---|
| `day` | `size-10 rounded-[var(--radius-sm)] text-sm font-sans hover:bg-[var(--color-bg-subtle)]` |
| `day_selected` | `bg-[var(--color-interactive-brand-bg)] text-[var(--color-text-on-brand)] hover:bg-[var(--color-interactive-brand-bg)]` |
| `day_today` | `ring-[1.5px] ring-[var(--color-focus-ring)]` |
| `day_disabled` | `text-[var(--color-text-muted)] cursor-not-allowed` |
| `caption_label` | `font-sans font-semibold text-base` |
| `nav_button` | `inline-flex items-center justify-center size-8 rounded-full hover:bg-[var(--color-bg-subtle)]` |

Focus ring on any interactive calendar element: `focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none`.

**No new tokens needed for v1.** Every visual need maps to existing semantic tokens. If a gap appears during implementation, add at the semantic layer, never as hex, never at the primitive.

**Dark mode**
- All referenced tokens already rebind under `.dark`. No DatePicker-specific dark overrides.

## Testing

**Unit (`DatePicker.test.tsx`, jsdom, `unit` project)**
- Renders closed trigger with placeholder when no value.
- Renders closed trigger with formatted value when `value` set.
- Controlled: `value` + `onValueChange` — clicking a day fires with correct `Date`.
- Uncontrolled: `defaultValue` — internal state updates; `onValueChange` still fires.
- `disabled` prevents opening.
- `minDate` / `maxDate` disables cells.
- Hidden input: renders when `name` set, value is ISO string.
- Warn on `value` + `defaultValue` together (dev mode).

**Storybook (`DatePicker.stories.tsx`, browser project)**
- `Playground` — controls for every prop.
- `WithConstraints` — `minDate` / `maxDate` applied.
- `InFormField` — wrapped in FormField with label + error state.
- `KeyboardInteraction` (play function) — open via `ArrowDown`, navigate, select, close. Same pattern as the Checkbox/Dialog/TextInput/Tooltip play functions.

**A11y gates**
- Unit project: 156+ tests, all passing.
- Runtime scan (`scripts/a11y-runtime-scan.mjs`): zero violations in light + dark modes.
- Storybook vitest (Playwright Chromium): all play functions pass.

## Out of scope for v1 (follow-up tickets if desired)

- Date range mode (`mode="range"`, `from`/`to` props).
- Multi-date mode.
- Typed-entry trigger (`allowInput` prop).
- Time-of-day selection.
- Preset shortcut pills.
- Custom footer slot.
- `weekStartsOn` override (we inherit from the locale).
- Per-weekday disables (`disabledDays: [0, 6]`).
- `disabledDates: Date[] | (date) => boolean` matcher prop.
