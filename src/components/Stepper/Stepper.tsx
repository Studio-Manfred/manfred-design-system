import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/Icon';

/**
 * Status of a single step. The consumer owns each step's state — the
 * component does not derive completion from an active index.
 */
export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error';

/**
 * A single step descriptor passed to {@link Stepper}.
 */
export interface StepperStep {
  /** Visible label for the step. */
  label: string;
  /** Explicit state for this step. */
  status: StepStatus;
  /** Optional secondary line rendered under the label. */
  description?: string;
  /** Block interaction even when `onStepClick` is set (escape hatch). */
  disabled?: boolean;
}

/**
 * Props for the {@link Stepper} component.
 *
 * Inherits every native `<nav>` attribute via
 * `React.HTMLAttributes<HTMLElement>` — pass `id`, `data-*`, etc. directly.
 */
export interface StepperProps extends React.HTMLAttributes<HTMLElement> {
  /** Ordered steps. The consumer supplies the full list and each step's status. */
  steps: StepperStep[];
  /** Layout direction. Default `'horizontal'`. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * When provided, eligible steps render as buttons and call this on
   * activation. Eligible = status `'complete' | 'current' | 'error'` and not
   * `disabled`. `'upcoming'` steps are never interactive (can't jump ahead).
   */
  onStepClick?: (index: number, step: StepperStep) => void;
  /** Names the `<nav>` landmark. Default `'Progress'`. */
  'aria-label'?: string;
}

const indicatorVariants = cva(
  'flex size-7 items-center justify-center rounded-full border text-sm font-medium',
  {
    variants: {
      status: {
        complete: 'border-transparent bg-primary text-primary-foreground',
        current: 'border-transparent bg-primary text-primary-foreground',
        upcoming: 'border-border bg-card text-muted-foreground',
        error: 'border-transparent bg-destructive text-destructive-foreground',
      },
    },
  },
);

const labelVariants = cva('text-sm', {
  variants: {
    status: {
      complete: 'text-muted-foreground',
      current: 'font-semibold text-foreground',
      upcoming: 'text-muted-foreground',
      error: 'font-medium text-destructive',
    },
  },
});

/** Renders the inside of the indicator circle: a check / x-circle icon, or the 1-based step number. */
function StepIndicatorContent({ step, index }: { step: StepperStep; index: number }) {
  if (step.status === 'complete') return <Icon name="check" size="sm" />;
  if (step.status === 'error') return <Icon name="x-circle" size="sm" />;
  return <>{index + 1}</>;
}

/**
 * Generic, data-driven progress indicator for multi-step flows (wizards,
 * checkouts, onboarding). The consumer supplies a `steps` array and each
 * step's `status`; the component renders whatever it is handed — there is no
 * built-in step list.
 *
 * Distinct visual states: `complete` (filled + check), `current` (filled +
 * number, bold label), `upcoming` (outlined + muted number), `error` (filled
 * destructive + x-circle). Optional per-step `description` and optional
 * click-to-navigate via `onStepClick`.
 *
 * Accessibility:
 * - Renders `<nav aria-label>` → `<ol>`/`<li>`; set `aria-label` when more
 *   than one nav landmark exists on the page (default `"Progress"`).
 * - The `current` step's `<li>` gets `aria-current="step"`.
 * - Each step has an sr-only `"Step N of M"`; `error` steps add `", error"` so
 *   the state is announced, not conveyed by colour alone.
 * - Interactive steps are real `<button>`s; non-interactive markup is inert.
 *
 * @example Horizontal wizard
 * ```tsx
 * <Stepper
 *   steps={[
 *     { label: 'Dates', status: 'complete' },
 *     { label: 'Times', status: 'current' },
 *     { label: 'Share', status: 'upcoming' },
 *   ]}
 * />
 * ```
 */
export const Stepper = React.forwardRef<HTMLElement, StepperProps>(function Stepper(
  {
    steps,
    orientation = 'horizontal',
    onStepClick,
    className,
    'aria-label': ariaLabel = 'Progress',
    ...rest
  },
  ref,
) {
  const isVertical = orientation === 'vertical';
  const contentClass = cn('flex gap-2', isVertical ? 'items-start' : 'items-center');

  return (
    <nav ref={ref} aria-label={ariaLabel} className={className} {...rest}>
      <ol className={cn('flex', isVertical ? 'flex-col' : 'items-center')}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const interactive = !!onStepClick && step.status !== 'upcoming' && !step.disabled;

          const inner = (
            <>
              <span aria-hidden="true" className={indicatorVariants({ status: step.status })}>
                <StepIndicatorContent step={step} index={index} />
              </span>
              <span className="sr-only">
                {`Step ${index + 1} of ${steps.length}`}
                {step.status === 'error' ? ', error' : ''}
              </span>
              <span className="flex flex-col">
                <span className={labelVariants({ status: step.status })}>{step.label}</span>
                {step.description && (
                  <span className="text-xs text-muted-foreground">{step.description}</span>
                )}
              </span>
            </>
          );

          return (
            <li
              key={index}
              aria-current={step.status === 'current' ? 'step' : undefined}
              className={isVertical ? 'relative pb-8 last:pb-0' : 'flex items-center gap-2'}
            >
              {interactive ? (
                <button
                  type="button"
                  onClick={() => onStepClick?.(index, step)}
                  className={cn(
                    contentClass,
                    'rounded-[var(--radius-sm)] text-left motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  {inner}
                </button>
              ) : (
                <span className={contentClass}>{inner}</span>
              )}

              {!isLast &&
                (isVertical ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-border"
                  />
                ) : (
                  <span aria-hidden="true" className="h-px w-8 bg-border" />
                ))}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
Stepper.displayName = 'Stepper';
