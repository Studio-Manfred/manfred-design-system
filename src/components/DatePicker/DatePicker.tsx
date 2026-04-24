import * as React from 'react';
import { format as formatDate } from 'date-fns';
import { sv } from 'date-fns/locale/sv';
import type { Locale } from 'date-fns';
import { Icon } from '../Icon';
import { inputLikeVariants, type InputLikeSize, type InputLikeStatus } from '@/lib/inputLikeVariants';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  // Value & change
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (value: Date | undefined) => void;

  // Display
  placeholder?: string;
  formatValue?: (value: Date, locale: Locale) => string;
  locale?: Locale;

  // Constraints
  minDate?: Date;
  maxDate?: Date;

  // Footer actions
  clearable?: boolean;
  showTodayButton?: boolean;

  // TextInput-alike pass-through
  size?: InputLikeSize;
  status?: InputLikeStatus;
  fullWidth?: boolean;
  disabled?: boolean;

  // Form / a11y plumbing
  id?: string;
  name?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;

  // Controlled open state
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Escape hatch
  className?: string;
}

const defaultFormat = (value: Date, locale: Locale) =>
  formatDate(value, 'P', { locale });

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(
    // Deferred to later tasks in this plan (already in the interface for
    // spec stability): onValueChange (T4), open/onOpenChange (T4), name (T8),
    // clearable/showTodayButton (T6). Consumers passing these today will not
    // see them take effect until the corresponding task lands.
    {
      value,
      defaultValue,
      placeholder = 'Pick a date',
      formatValue = defaultFormat,
      locale = sv,
      size = 'md',
      status = 'default',
      fullWidth,
      disabled,
      id,
      required,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      className,
    },
    ref,
  ) {
    // Controlled vs uncontrolled: `value` wins if both are provided.
    const displayValue = value ?? defaultValue;
    const displayText = displayValue ? formatValue(displayValue, locale) : placeholder;
    const hasValue = Boolean(displayValue);

    // Match TextInput's inner <input> padding so the trigger text aligns with
    // TextInput's content at the same size. inputLikeVariants (shared with
    // TextInput's wrapper) does not carry horizontal padding itself — that's
    // TextInput's local inputVariants job. This constant is the button's
    // equivalent of that wrapper+input padding combo.
    const triggerPadding = size === 'sm' ? 'px-3' : 'px-4';

    return (
      <button
        ref={ref}
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-haspopup="dialog"
        aria-invalid={status === 'error' || undefined}
        aria-required={required || undefined}
        className={cn(
          inputLikeVariants({
            size,
            status,
            fullWidth,
          }),
          triggerPadding,
          'text-left',
          className,
        )}
      >
        <span
          className={cn(
            'flex-1 truncate',
            !hasValue && 'text-[var(--color-text-muted)]',
          )}
        >
          {displayText}
        </span>
        <span className="ml-2 flex shrink-0 items-center">
          <Icon name="calendar" size={size === 'lg' ? 'md' : 'sm'} aria-hidden />
        </span>
      </button>
    );
  },
);

DatePicker.displayName = 'DatePicker';
