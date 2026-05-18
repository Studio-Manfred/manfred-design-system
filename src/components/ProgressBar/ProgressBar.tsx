import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const trackVariants = cva('relative w-full overflow-hidden bg-muted rounded-full', {
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const fillVariants = cva('h-full w-full flex-1 transition-transform duration-[250ms] ease-in-out rounded-[inherit]', {
  variants: {
    variant: {
      default: 'bg-[var(--color-text-secondary)]',
      brand: 'bg-[var(--color-bg-brand)]',
      success: 'bg-[var(--color-feedback-success-fg)]',
      warning: 'bg-[var(--color-feedback-warning-fg)]',
      error: 'bg-[var(--color-feedback-error-fg)]',
    },
    animated: {
      // image: hint routes the gradient to background-image; omitting it emits background-color and browsers drop it silently.
      true: "bg-[image:var(--pattern-stripes-overlay)] bg-[length:200%_100%] animate-[stripes_1.2s_linear_infinite]",
      false: '',
    },
  },
  defaultVariants: {
    variant: 'brand',
    animated: false,
  },
});

export type ProgressBarVariant = NonNullable<VariantProps<typeof fillVariants>['variant']>;
export type ProgressBarSize = NonNullable<VariantProps<typeof trackVariants>['size']>;

/**
 * Props for the {@link ProgressBar} component.
 *
 * `value` is the only required prop — every other prop has a sensible
 * default. The component is determinate-only; for indeterminate
 * progress, render an animated track separately.
 */
export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Current progress as a number between 0 and 100. Values outside the
   * range are clamped. Required.
   */
  value: number;
  /**
   * Visual treatment for the fill. `brand` (default) for normal
   * progress, `success` / `warning` / `error` for state-driven flows
   * (validation, upload result), `default` for a quiet neutral.
   */
  variant?: ProgressBarVariant;
  /** Track height. `sm` = 4px, `md` = 8px (default), `lg` = 12px. */
  size?: ProgressBarSize;
  /**
   * Visible label rendered above the track. Also used as the
   * `aria-label` on the underlying Radix `Root` when present, so
   * screen-reader users hear the same caption.
   */
  label?: string;
  /**
   * Render the percentage to the right of the label (`65%`). Pair with
   * `label` for the full caption.
   */
  showValue?: boolean;
  /**
   * Add a diagonal-stripes overlay that animates left-to-right. Useful
   * for live operations where the user should perceive ongoing motion;
   * the underlying value still drives the fill width.
   */
  animated?: boolean;
}

/**
 * Determinate progress bar. Token-styled wrapper around
 * `@radix-ui/react-progress`.
 *
 * Five colour variants (`default` / `brand` / `success` / `warning` /
 * `error`), three sizes, an optional caption with percentage readout,
 * and an optional animated stripes overlay for live operations.
 *
 * Accessibility:
 * - Radix's `Root` carries the `role="progressbar"` semantics and
 *   `aria-valuenow` for the current value.
 * - Pass `label` so AT users hear a meaningful caption — it doubles as
 *   the visible label and the `aria-label` on the Root. Falls back to
 *   `"Progress"` when omitted.
 * - The stripes animation under `animated` is decorative; reduced-motion
 *   users still see the static fill at the correct width.
 *
 * @example Labelled brand progress with percentage readout
 * ```tsx
 * <ProgressBar value={65} label="Upload progress" showValue />
 * ```
 *
 * @example Success state at completion
 * ```tsx
 * <ProgressBar value={100} variant="success" label="Complete" showValue />
 * ```
 */
export function ProgressBar({
  value,
  variant = 'brand',
  size = 'md',
  label,
  showValue = false,
  animated = false,
  className,
  ...rest
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div {...rest} className={cn('flex flex-col gap-2 w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center font-sans">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {showValue && <span className="text-sm text-[var(--color-text-secondary)]">{clamped}%</span>}
        </div>
      )}
      <ProgressPrimitive.Root
        value={clamped}
        aria-label={label ?? 'Progress'}
        className={cn(trackVariants({ size }))}
      >
        <ProgressPrimitive.Indicator
          className={cn(fillVariants({ variant, animated }))}
          style={{ transform: `translateX(-${100 - clamped}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}
