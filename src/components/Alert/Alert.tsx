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

export interface AlertProps extends VariantProps<typeof alertVariants> {
  title?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  icon?: boolean;
  className?: string;
}

const iconMap: Record<AlertVariant, IconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'warning',
  error: 'alert-circle',
};

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
