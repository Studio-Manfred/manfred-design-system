import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';

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
 */
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn('flex flex-col gap-2', className)} {...props} />
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
   * Apply error-state styling (red border). Pair with form-level error
   * messaging via `FormField` or your own description so the error is
   * announced to assistive tech, not just shown visually.
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
 * - `error` is a visual signal only; pair with announced error text
 *   (e.g. via `FormField`) so screen-reader users hear the problem.
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
>(({ className, label, error, id, disabled, ...props }, ref) => {
  const control = (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={id}
      disabled={disabled}
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
