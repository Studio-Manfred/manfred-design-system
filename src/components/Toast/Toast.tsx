import * as React from 'react';
import { Toaster as SonnerToaster, toast, type ToasterProps } from 'sonner';

/**
 * Props for the {@link Toaster} component. Re-export of `sonner`'s
 * `ToasterProps` — see the sonner docs for the full surface (position,
 * theme, gap, expand, hotkey, richColors, etc.).
 */
export type ToastProps = ToasterProps;

/**
 * Toast viewport wrapping `sonner`. Mount once near the root of the app.
 *
 * Pre-applies token-driven classes for the toast container and the four
 * intent variants (`success` / `error` / `warning` / `info`) so toasts
 * pick up the design-system surface, border, and feedback colours
 * automatically. Position defaults to `top-right`; override per-app.
 *
 * Accessibility: sonner renders an `aria-live` region — toasts are
 * announced as they appear. Honour `prefers-reduced-motion` by
 * shortening / disabling animations via sonner props if needed.
 *
 * Imperative API: emit toasts from anywhere in the tree by importing
 * the {@link toast} helper:
 * - `toast(message, options?)` — neutral toast.
 * - `toast.success(message)` / `.error()` / `.warning()` / `.info()` — intent.
 * - `toast.promise(promise, { loading, success, error })` — async.
 * - `toast.dismiss(id?)` — close a specific or all toasts.
 *
 * @example Mount once + fire from a handler
 * ```tsx
 * // in the layout
 * <Toaster position="top-right" />
 *
 * // anywhere in the app
 * import { toast } from '@studio-manfred/manfred-design-system';
 * toast.success('Profile saved');
 * ```
 */
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

/**
 * Imperative toast API re-exported from `sonner`. Call from anywhere in
 * the React tree (event handlers, async callbacks, store middleware) —
 * does not require a hook. A {@link Toaster} must be mounted somewhere
 * for the calls to render.
 *
 * Variants: `toast(...)`, `toast.success(...)`, `toast.error(...)`,
 * `toast.warning(...)`, `toast.info(...)`, `toast.promise(...)`,
 * `toast.dismiss(...)`.
 */
export { toast };
