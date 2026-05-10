import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon } from '../Icon';
import type { IconName } from '../Icon';

const alertVariants = cva(
  'flex items-start gap-3 p-4 rounded-[var(--radius-md)] border',
  {
    variants: {
      variant: {
        info: 'bg-[var(--color-feedback-info-bg)] text-[var(--color-feedback-info-fg)] border-[var(--color-feedback-info-fg)]/20',
        success: 'bg-[var(--color-feedback-success-bg)] text-[var(--color-feedback-success-fg)] border-[var(--color-feedback-success-fg)]/20',
        warning: 'bg-[var(--color-feedback-warning-bg)] text-[var(--color-feedback-warning-fg)] border-[var(--color-feedback-warning-fg)]/20',
        error: 'bg-[var(--color-feedback-error-bg)] text-[var(--color-feedback-error-fg)] border-[var(--color-feedback-error-fg)]/20',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

export type AlertVariant = NonNullable<VariantProps<typeof alertVariants>['variant']>;

/**
 * Props for the {@link Alert} component.
 */
export interface AlertProps extends VariantProps<typeof alertVariants> {
  /**
   * Optional bold heading rendered above the body. Use a short noun
   * phrase ("Changes saved", "Something went wrong") rather than a
   * sentence.
   */
  title?: string;
  /**
   * Body content. Plain text or inline markup. Omit when the `title`
   * alone is enough.
   */
  children?: React.ReactNode;
  /**
   * When provided, renders a dismiss button in the trailing edge of the
   * alert. The caller owns the dismissal — typically by removing the
   * alert from state.
   */
  onClose?: () => void;
  /**
   * Show the variant icon at the leading edge. Defaults to `true`. Turn
   * off for compact alerts where the colour alone is enough.
   */
  icon?: boolean;
  className?: string;
}

const iconMap: Record<AlertVariant, IconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'warning',
  error: 'alert-circle',
};

/**
 * Inline feedback message — for status, validation, and one-off notices
 * that should sit alongside content rather than overlay it.
 *
 * Four severity variants (`info` / `success` / `warning` / `error`),
 * optional `title`, optional dismiss button, and a colour-and-icon
 * pairing so severity is never communicated by colour alone.
 *
 * Accessibility:
 * - Renders with `role="alert"` so screen readers announce the message
 *   when it appears in the DOM.
 * - The leading severity icon is `aria-hidden="true"`; meaning is carried
 *   by the visible text. Keep `title` / `children` self-describing.
 * - The dismiss button has an explicit `aria-label="Dismiss alert"`.
 *
 * @example Inline success notice
 * ```tsx
 * <Alert variant="success" title="Changes saved">
 *   Your profile has been updated.
 * </Alert>
 * ```
 *
 * @example Dismissible warning
 * ```tsx
 * <Alert variant="warning" onClose={() => setShown(false)}>
 *   Your subscription expires in 3 days.
 * </Alert>
 * ```
 */
export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  icon = true,
  className,
}: AlertProps) {
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)}>
      {icon && (
        <span className="shrink-0 mt-0.5" aria-hidden="true">
          <Icon name={iconMap[variant!]} size="md" />
        </span>
      )}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {title && <div className="font-semibold leading-snug">{title}</div>}
        {children && <div className="text-sm leading-relaxed">{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          className="shrink-0 -m-1 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onClose}
          aria-label="Dismiss alert"
        >
          <Icon name="x" size="sm" />
        </button>
      )}
    </div>
  );
}
