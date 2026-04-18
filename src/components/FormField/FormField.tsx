import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon } from '../Icon';

const messageVariants = cva('flex items-center gap-1 font-sans text-xs leading-[1.5]', {
  variants: {
    status: {
      default: 'text-muted-foreground',
      hint: 'text-muted-foreground',
      error: 'text-[var(--color-feedback-error-fg)]',
      success: 'text-[var(--color-feedback-success-fg)]',
    },
  },
  defaultVariants: {
    status: 'default',
  },
});

export type FormFieldStatus = NonNullable<VariantProps<typeof messageVariants>['status']>;

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  status?: FormFieldStatus;
  message?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

const statusIconMap = {
  error: 'alert-circle',
  success: 'check-circle',
  hint: 'info',
} as const;

export function FormField({
  label,
  htmlFor,
  status = 'default',
  message,
  required = false,
  children,
  className,
}: FormFieldProps) {
  const iconName =
    status === 'error' || status === 'success' || status === 'hint'
      ? statusIconMap[status]
      : undefined;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        className="font-sans text-sm font-semibold text-foreground leading-[1.5]"
        htmlFor={htmlFor}
      >
        {label}
        {required && (
          <span className="text-[var(--color-feedback-error-fg)] ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {message && (
        <span
          role={status === 'error' ? 'alert' : undefined}
          aria-live={status === 'success' || status === 'hint' ? 'polite' : undefined}
          className={messageVariants({ status })}
        >
          {iconName && <Icon name={iconName} size="xs" />}
          {message}
        </span>
      )}
    </div>
  );
}
