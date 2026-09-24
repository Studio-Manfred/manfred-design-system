import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';

/**
 * Props for the {@link RadioGroup} component.
 *
 * Inherits every prop from `@radix-ui/react-radio-group` `Root`.
 */
export interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  /**
   * Mark the whole group as invalid. Sets `aria-invalid="true"` on the
   * radiogroup and passes `error` to every item (red border and
   * `aria-invalid`). An item's own `error` prop wins, and so does a
   * consumer-passed `aria-invalid`.
   */
  error?: boolean;
}

const RadioGroupErrorContext = React.createContext(false);

/**
 * Group container for {@link RadioGroupItem}s. Token-styled wrapper
 * around `@radix-ui/react-radio-group` `Root`.
 *
 * Inherits every Root prop from Radix — `value` / `defaultValue` /
 * `onValueChange` for state, `disabled`, `required`, `name`, `dir`,
 * `orientation`. Renders as a column flex with 2-token gap between
 * items; pass `className` to extend.
 *
 * Accessibility:
 * - Radix sets `role="radiogroup"` and manages roving tabindex /
 *   arrow-key selection across items automatically.
 * - When the group has no visible heading, set `aria-label` (or
 *   `aria-labelledby`) on `RadioGroup` so AT users hear the group
 *   purpose.
 * - `error` sets `aria-invalid="true"` on the radiogroup and marks every
 *   item invalid (red border + `aria-invalid`). Validity belongs to the
 *   group — a required choice that is missing — so prefer this over
 *   per-item `error`. Point `aria-describedby` at the error text so
 *   screen-reader users hear what is wrong, not just that it is.
 *
 * @example Uncontrolled with default value
 * ```tsx
 * <RadioGroup defaultValue="b" aria-label="Plan">
 *   <RadioGroupItem id="a" value="a" label="Option A" />
 *   <RadioGroupItem id="b" value="b" label="Option B" />
 *   <RadioGroupItem id="c" value="c" label="Option C" />
 * </RadioGroup>
 * ```
 *
 * @example Controlled
 * ```tsx
 * <RadioGroup value={value} onValueChange={setValue}>
 *   <RadioGroupItem id="x" value="x" label="X" />
 *   <RadioGroupItem id="y" value="y" label="Y" />
 * </RadioGroup>
 * ```
 *
 * @example Invalid group, named by a heading and described by its error
 * ```tsx
 * <p id="plan-label">Plan</p>
 * <RadioGroup aria-labelledby="plan-label" aria-describedby="plan-error" error>
 *   <RadioGroupItem id="basic" value="basic" label="Basic" />
 *   <RadioGroupItem id="pro" value="pro" label="Pro" />
 * </RadioGroup>
 * <p id="plan-error">Choose a plan to continue.</p>
 * ```
 */
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, error = false, ...props }, ref) => (
  <RadioGroupErrorContext.Provider value={error}>
    <RadioGroupPrimitive.Root
      ref={ref}
      aria-invalid={error || undefined}
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  </RadioGroupErrorContext.Provider>
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

/**
 * Props for the {@link RadioGroupItem} component.
 *
 * Inherits every prop from `@radix-ui/react-radio-group` `Item` (e.g.
 * `value`, `id`, `disabled`, `required`).
 */
export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  /**
   * Visible label rendered to the right of the radio control. When
   * present, the whole label + control becomes a clickable
   * `<label htmlFor={id}>`. Omit for a standalone control (set
   * `aria-label` instead so AT has a name).
   */
  label?: React.ReactNode;
  /**
   * Mark this item as invalid. Sets `aria-invalid="true"` on the radio
   * and shifts its border to the error token. Defaults to the group's
   * `error`; pass `false` to opt a single item out. A consumer-passed
   * `aria-invalid` takes precedence. Pair with announced error text
   * (e.g. via `FormField`) so screen-reader users hear what is wrong.
   */
  error?: boolean;
}

/**
 * Single radio control inside {@link RadioGroup}. Token-styled wrapper
 * around `@radix-ui/react-radio-group` `Item` + `Indicator`.
 *
 * When `label` is set, the control + text are wrapped in a `<label>`
 * tied to the item via `htmlFor` — the label area is fully clickable.
 * Without `label`, only the radio control renders (set `aria-label`
 * separately for screen-reader names).
 *
 * Accessibility:
 * - Radix manages `role="radio"`, `aria-checked`, and roving tabindex.
 * - The whole label is a click target, not just the 18px control —
 *   pointer + touch users get a comfortable hit area.
 * - `error` sets `aria-invalid="true"` on the item (an explicit
 *   `aria-invalid` prop wins) and a red border. `aria-invalid` only
 *   says the field is invalid, not why — pair it with announced error
 *   text (e.g. via `FormField`) so screen-reader users hear the problem.
 *
 * @example Labelled item inside a group
 * ```tsx
 * <RadioGroupItem id="email" value="email" label="Email me" />
 * ```
 *
 * @example Standalone control with separate aria-label
 * ```tsx
 * <RadioGroupItem id="plan-a" value="a" aria-label="Plan A" />
 * ```
 */
const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, label, error: itemError, id, disabled, ...props }, ref) => {
  const groupError = React.useContext(RadioGroupErrorContext);
  const error = itemError ?? groupError;
  const control = (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={id}
      disabled={disabled}
      aria-invalid={error || undefined}
      className={cn(
        'shrink-0 w-[18px] h-[18px] rounded-full border-[1.5px] bg-background',
        'border-[var(--color-border-strong)]',
        'data-[state=checked]:border-[var(--color-bg-brand)]',
        'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-[var(--color-feedback-error-fg)]',
        !label && className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center w-full h-full after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-[var(--color-bg-brand)]" />
    </RadioGroupPrimitive.Item>
  );

  if (!label) return control;

  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-center gap-2 cursor-pointer select-none',
        disabled && 'cursor-not-allowed',
        className,
      )}
    >
      {control}
      <span className="font-sans text-base text-foreground leading-[1.5]">{label}</span>
    </label>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
