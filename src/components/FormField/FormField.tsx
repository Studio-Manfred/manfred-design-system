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

/**
 * Props for the {@link FormField} component.
 *
 * Compound layout container — composes a `<label>`, the input passed
 * via `children`, and an optional helper or error `message`. Intended
 * to wrap form controls (`TextInput`, `Checkbox`, `DatePicker`, etc.)
 * to keep label, input, and feedback consistent across the system.
 */
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visible label text. Required — every field must have a label. */
  label: string;
  /**
   * Wired to the rendered `<label htmlFor>`. Pass the same string as
   * the wrapped input's `id` so clicking the label focuses the input.
   */
  htmlFor?: string;
  /**
   * Visual + semantic status of the field.
   * - `default` — no message styling (omit `message` to hide).
   * - `hint` — neutral guidance, info icon.
   * - `error` — failure state, alert icon, message announces via `role="alert"`.
   * - `success` — confirmation, check icon, polite live-region.
   */
  status?: FormFieldStatus;
  /**
   * Helper, hint, or error text rendered below the input. Pair with
   * `status` to colour and icon the text correctly.
   */
  message?: string;
  /**
   * Show a red asterisk after the label. Decorative — set `required`
   * on the wrapped input as well so the browser enforces validation
   * and assistive tech announces it.
   */
  required?: boolean;
  /** The form control to wrap (one input per field is the convention). */
  children: React.ReactNode;
}

const statusIconMap = {
  error: 'alert-circle',
  success: 'check-circle',
  hint: 'info',
} as const;

/**
 * Form-field layout primitive. Composes a label, input slot, and
 * optional message into a consistent vertical stack.
 *
 * Drop any DS form control (e.g. `TextInput`, `Checkbox`,
 * `DatePicker`) inside `children` — `htmlFor` wires the label to the
 * input's `id`, and `status` + `message` render the helper line with
 * the matching colour, icon, and live-region semantics.
 *
 * Accessibility:
 * - The label is a real `<label htmlFor>`, so clicking it focuses the
 *   wrapped input.
 * - `error` messages render with `role="alert"` so SR users hear the
 *   failure on submit; `hint` and `success` use a polite live-region.
 * - The `required` asterisk is `aria-hidden` — set `required` on the
 *   wrapped input itself so it's enforced in the accessibility tree.
 *
 * @example Basic field with hint
 * ```tsx
 * <FormField label="Password" htmlFor="pw" status="hint" message="Min. 8 chars">
 *   <TextInput id="pw" type="password" />
 * </FormField>
 * ```
 *
 * @example Required field with error
 * ```tsx
 * <FormField label="Email" htmlFor="email" required status="error" message="Invalid email">
 *   <TextInput id="email" status="error" defaultValue="not-an-email" />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  htmlFor,
  status = 'default',
  message,
  required = false,
  children,
  className,
  ...rest
}: FormFieldProps) {
  const iconName =
    status === 'error' || status === 'success' || status === 'hint'
      ? statusIconMap[status]
      : undefined;

  return (
    <div {...rest} className={cn('flex flex-col gap-2', className)}>
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
