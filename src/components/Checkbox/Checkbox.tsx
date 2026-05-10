import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '@/lib/utils';
import { Icon } from '../Icon';

type RadixCheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

/**
 * Props for the {@link Checkbox} component.
 *
 * Inherits every prop from `@radix-ui/react-checkbox` `Root`
 * (e.g. `checked`, `defaultChecked`, `onCheckedChange`, `name`,
 * `value`, `disabled`, `required`) except `children` — the visual
 * tick is rendered internally via the design-system `Icon`.
 */
export interface CheckboxProps extends Omit<RadixCheckboxProps, 'children'> {
  /**
   * Optional visible label rendered to the right of the box. When
   * provided, the component renders a `<label htmlFor={id}>` wrapper
   * so clicking the text toggles the box. Pair with `id` for the
   * association to take effect; otherwise pass `aria-label` instead.
   */
  label?: React.ReactNode;
  /**
   * Render the box in the indeterminate (mixed) state — overrides
   * `checked` and sets Radix's `data-state="indeterminate"`. Useful
   * for "select all" checkboxes that reflect a partial child
   * selection.
   */
  indeterminate?: boolean;
  /**
   * Mark the checkbox as invalid. Sets `aria-invalid="true"` and
   * shifts the border to the error token so screen readers and
   * sighted users see the same failure state.
   */
  error?: boolean;
}

/**
 * Accessible checkbox built on `@radix-ui/react-checkbox`.
 *
 * Supports checked, unchecked, and indeterminate states with an
 * optional inline label. The tick / dash glyph is rendered with the
 * design-system `Icon` so it inherits theme colours automatically.
 *
 * Accessibility:
 * - Radix maps `Space` and click to the same toggle handler and
 *   manages `role="checkbox"` + `aria-checked` for you.
 * - When `error` is true the control announces `aria-invalid="true"` —
 *   pair with a `FormField` `message` so the failure has visible text.
 * - Pass either `label` or `aria-label` so the box has a discernible
 *   accessible name.
 *
 * @example Basic checkbox with label
 * ```tsx
 * <Checkbox id="terms" label="Accept terms and conditions" />
 * ```
 *
 * @example Controlled with indeterminate state
 * ```tsx
 * <Checkbox
 *   checked={allSelected}
 *   indeterminate={someSelected && !allSelected}
 *   onCheckedChange={(c) => setAllSelected(c === true)}
 *   label="Select all"
 * />
 * ```
 */
export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ label, indeterminate, error, className, disabled, checked, id, ...rest }, ref) => {
  const checkedValue: CheckboxPrimitive.CheckedState | undefined =
    indeterminate ? 'indeterminate' : checked;

  const control = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={id}
      disabled={disabled}
      checked={checkedValue}
      aria-invalid={error || undefined}
      className={cn(
        'peer shrink-0 w-[18px] h-[18px] rounded-[var(--radius-sm)] border-[1.5px] bg-background',
        'border-[var(--color-border-strong)]',
        'data-[state=checked]:bg-[var(--color-bg-brand)] data-[state=checked]:border-[var(--color-bg-brand)] data-[state=checked]:text-[var(--color-text-on-brand)]',
        'data-[state=indeterminate]:bg-[var(--color-bg-brand)] data-[state=indeterminate]:border-[var(--color-bg-brand)] data-[state=indeterminate]:text-[var(--color-text-on-brand)]',
        'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-[var(--color-feedback-error-fg)]',
        !label && className,
      )}
      {...rest}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Icon name={indeterminate ? 'minus' : 'check'} size="xs" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
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
Checkbox.displayName = 'Checkbox';
