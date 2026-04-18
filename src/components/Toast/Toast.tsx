import * as React from 'react';
import { Toaster as SonnerToaster, toast, type ToasterProps } from 'sonner';

export type ToastProps = ToasterProps;

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position={props.position ?? 'top-right'}
      toastOptions={{
        classNames: {
          toast:
            'group font-sans rounded-[var(--radius-md)] border shadow-lg bg-background text-foreground',
          title: 'font-semibold',
          description: 'text-sm opacity-90',
          actionButton: 'bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm',
          cancelButton: 'bg-secondary text-foreground rounded-full px-3 py-1 text-sm',
          success:
            'bg-[var(--color-feedback-success-bg)] text-[var(--color-feedback-success-fg)] border-[var(--color-feedback-success-fg)]/20',
          error:
            'bg-[var(--color-feedback-error-bg)] text-[var(--color-feedback-error-fg)] border-[var(--color-feedback-error-fg)]/20',
          warning:
            'bg-[var(--color-feedback-warning-bg)] text-[var(--color-feedback-warning-fg)] border-[var(--color-feedback-warning-fg)]/20',
          info:
            'bg-[var(--color-feedback-info-bg)] text-[var(--color-feedback-info-fg)] border-[var(--color-feedback-info-fg)]/20',
          ...props.toastOptions?.classNames,
        },
        ...props.toastOptions,
      }}
      {...props}
    />
  );
}

export { toast };
