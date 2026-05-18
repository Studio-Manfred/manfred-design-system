import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('inline-flex items-center justify-center text-[var(--color-brand-primary)]', {
  variants: {
    size: {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-10 h-10',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type SpinnerSize = NonNullable<VariantProps<typeof spinnerVariants>['size']>;

/**
 * Props for the {@link Spinner} component.
 *
 * Inherits every native `<span>` attribute except `role` (which is
 * fixed at `"status"` to make AT announcements correct without
 * caller wiring). Pass `id`, `aria-live`, `aria-describedby`,
 * `data-*`, etc. directly.
 */
export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'role'> {
  /** Size scale (`sm` = 16px, `md` = 24px, `lg` = 40px). Defaults to `md`. */
  size?: SpinnerSize;
  /**
   * Visually-hidden label announced by screen readers. Defaults to
   * `"Loading"`. Override with a more specific verb when the spinner
   * sits next to a known operation (e.g. `"Saving"`).
   */
  label?: string;
}

/**
 * Indeterminate progress indicator drawn with an SVG arc.
 *
 * Three sizes (`sm` / `md` / `lg`), brand-coloured stroke, and a
 * built-in `role="status"` so it announces correctly on its own. Use
 * for short waits where progress can't be measured.
 *
 * Accessibility:
 * - The wrapper is `role="status"` and contains a `sr-only` label —
 *   assistive tech reads it without any extra wiring.
 * - The animation is a CSS `animate-spin`. Users with
 *   `prefers-reduced-motion` see a stationary arc (the rotation is
 *   suppressed by the global motion-safe rules).
 *
 * @example Inline spinner inside a button
 * ```tsx
 * <Button disabled>
 *   <Spinner size="sm" label="Saving" /> Saving…
 * </Button>
 * ```
 *
 * @example Block-level loading indicator
 * ```tsx
 * <div className="flex items-center justify-center p-8">
 *   <Spinner size="lg" label="Loading dashboard" />
 * </div>
 * ```
 */
export function Spinner({
  size = 'md',
  label = 'Loading',
  className,
  ...rest
}: SpinnerProps) {
  const radius = 9;
  const circumference = 2 * Math.PI * radius;

  return (
    <span
      {...rest}
      className={cn(spinnerVariants({ size }), className)}
      role="status"
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeOpacity="0.2"
        />
        <circle
          cx="12"
          cy="12"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.75}
          strokeLinecap="round"
          className="origin-center animate-spin"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
