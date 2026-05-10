import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Spinner } from '../Spinner';

type RadixSwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>;

const trackVariants = cva(
  cn(
    'relative inline-flex shrink-0 items-center rounded-full border-[1.5px] transition-colors',
    'bg-input border-[var(--color-border-strong)]',
    'data-[state=checked]:bg-[var(--color-bg-brand)] data-[state=checked]:border-[var(--color-bg-brand)]',
    'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ),
  {
    variants: {
      size: {
        sm: 'h-4 w-7',
        md: 'h-5 w-9',
        lg: 'h-6 w-11',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

const thumbVariants = cva(
  cn(
    'pointer-events-none block rounded-full bg-background ring-0 shadow-sm transition-transform',
    'translate-x-0.5',
  ),
  {
    variants: {
      size: {
        sm: 'h-3 w-3 data-[state=checked]:translate-x-3',
        md: 'h-4 w-4 data-[state=checked]:translate-x-4',
        lg: 'h-5 w-5 data-[state=checked]:translate-x-5',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

type SwitchSize = NonNullable<VariantProps<typeof trackVariants>['size']>;

/**
 * Props for the {@link Switch} component.
 *
 * Inherits Radix `Switch.Root` props (e.g. `checked`, `defaultChecked`,
 * `onCheckedChange`, `name`, `value`, `required`) via
 * `React.ComponentPropsWithoutRef`.
 */
export interface SwitchProps extends Omit<RadixSwitchProps, 'children'> {
  /** Track + thumb size. Defaults to `md`. */
  size?: SwitchSize;
  /** Shows a spinner inside the track and disables interaction. */
  loading?: boolean;
  /** Optional inline label rendered to the right of the switch. Wraps in a `<label>` so click-on-label toggles. */
  label?: React.ReactNode;
  /** Sets `aria-invalid` and gives the track a red border. */
  error?: boolean;
}

/**
 * Boolean toggle built on `@radix-ui/react-switch`.
 *
 * Three sizes (`sm` / `md` / `lg`), optional inline label, an `error`
 * state for invalid forms, and a `loading` state that swaps the thumb
 * for a spinner while disabling interaction.
 *
 * Accessibility:
 * - Native role `switch` and `aria-checked` come from Radix.
 * - `loading` sets `aria-busy="true"`; `error` sets `aria-invalid`.
 * - When `label` is provided, the control is wrapped in a `<label>`
 *   so clicking the text toggles the switch — pair with an `id` to
 *   keep the implicit/explicit association robust.
 *
 * @example Inline labelled switch
 * ```tsx
 * <Switch id="notifications" label="Email notifications" defaultChecked />
 * ```
 *
 * @example Async save with loading state
 * ```tsx
 * <Switch
 *   checked={enabled}
 *   loading={isSaving}
 *   onCheckedChange={save}
 *   label="Auto-publish"
 * />
 * ```
 */
export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(
  (
    {
      size = 'md',
      loading = false,
      label,
      error,
      className,
      disabled,
      id,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const control = (
      <SwitchPrimitive.Root
        ref={ref}
        id={id}
        disabled={isDisabled}
        aria-invalid={error || undefined}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        className={cn(
          trackVariants({ size }),
          error && 'border-[var(--color-feedback-error-fg)] data-[state=checked]:border-[var(--color-feedback-error-fg)]',
          !label && className,
        )}
        {...rest}
      >
        {loading ? (
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              // Constrain the spinner so it never overflows the track. Spinner sm is 16×16,
              // which equals the sm track height — shrink it visually for sm so it fits.
              size === 'sm' && '[&>*]:scale-75',
            )}
          >
            <Spinner size="sm" label="Loading" />
          </span>
        ) : (
          <SwitchPrimitive.Thumb className={cn(thumbVariants({ size }))} />
        )}
      </SwitchPrimitive.Root>
    );

    if (!label) return control;

    return (
      <label
        htmlFor={id}
        className={cn(
          'inline-flex items-center gap-2 cursor-pointer select-none',
          isDisabled && 'cursor-not-allowed',
          className,
        )}
      >
        {control}
        <span className="font-sans text-base text-foreground leading-[1.5]">{label}</span>
      </label>
    );
  },
);
Switch.displayName = 'Switch';
