import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center font-semibold leading-none whitespace-nowrap rounded-full border',
  {
    variants: {
      variant: {
        neutral: 'bg-secondary text-foreground border-transparent',
        brand: 'bg-[var(--color-interactive-brand-bg)] text-[var(--color-interactive-brand-fg)] border-transparent',
        success: 'bg-[var(--color-feedback-success-bg)] text-[var(--color-feedback-success-fg)] border-transparent',
        warning: 'bg-[var(--color-feedback-warning-bg)] text-[var(--color-feedback-warning-fg)] border-transparent',
        error: 'bg-[var(--color-feedback-error-bg)] text-[var(--color-feedback-error-fg)] border-transparent',
        info: 'bg-[var(--color-feedback-info-bg)] text-[var(--color-feedback-info-fg)] border-transparent',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>['size']>;

/**
 * Props for the {@link Badge} component.
 */
export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  /** Badge label. Keep short — typically one or two words, or a count. */
  children: React.ReactNode;
  className?: string;
}

const STATUS_VARIANTS: BadgeVariant[] = ['success', 'warning', 'error', 'info'];

/**
 * Small inline label — counts, statuses, tags, attribute markers.
 *
 * Six visual variants split into two groups: `neutral` and `brand` for
 * generic labels; `success` / `warning` / `error` / `info` for status.
 * Two sizes (`sm` / `md`).
 *
 * Accessibility:
 * - Status variants prepend a visually hidden severity prefix
 *   ("success: ", "error: ", …) so colour is never the sole carrier of
 *   meaning. Generic `neutral` / `brand` skip this.
 * - Renders as a `<span>` — when the badge represents a count next to a
 *   labelled control, place it inside the same accessible name (e.g.
 *   `aria-label="Notifications, 3 unread"` on the parent).
 *
 * @example Status badge
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * ```
 *
 * @example Notification count
 * ```tsx
 * <Badge variant="error" size="sm">3</Badge>
 * ```
 */
export function Badge({ variant = 'neutral', size = 'md', children, className }: BadgeProps) {
  const hasStatusPrefix = STATUS_VARIANTS.includes(variant!);

  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {hasStatusPrefix && <span className="sr-only">{variant}: </span>}
      {children}
    </span>
  );
}
