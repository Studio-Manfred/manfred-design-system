import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
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
  function DatePicker(props, ref) {
    // Deferred to later tasks in this plan (already in the interface for
    // spec stability): name (T8), clearable/showTodayButton (T6).
    // Consumers passing these today will not see them take effect until
    // the corresponding task lands.
    const {
      value: valueProp,
      defaultValue,
      onValueChange,
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
      open: openProp,
      onOpenChange,
      className,
    } = props;

    // Warn once in dev when both value and defaultValue are passed.
    // Empty deps array is intentional — we only warn on initial mount.
    React.useEffect(() => {
      if (valueProp !== undefined && defaultValue !== undefined) {
        // eslint-disable-next-line no-console
        console.warn(
          '[DatePicker] received both `value` and `defaultValue`. `value` wins (controlled); `defaultValue` is ignored.',
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Controlled vs uncontrolled via `'value' in props` — treats
    // value={undefined} as still controlled (cleared), vs. value-omitted.
    const isControlled = 'value' in props;
    const [internalValue, setInternalValue] = React.useState<Date | undefined>(defaultValue);
    const currentValue = isControlled ? valueProp : internalValue;

    // Same split for open state.
    const isOpenControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = isOpenControlled ? openProp : internalOpen;
    const setOpen = (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next);
      onOpenChange?.(next);
    };

    const handleSelect = (next: Date | undefined) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
      setOpen(false);
    };

    // Match TextInput's inner <input> padding so the trigger text aligns with
    // TextInput's content at the same size. inputLikeVariants (shared with
    // TextInput's wrapper) does not carry horizontal padding itself — that's
    // TextInput's local inputVariants job. This constant is the button's
    // equivalent of that wrapper+input padding combo.
    const triggerPadding = size === 'sm' ? 'px-3' : 'px-4';

    const displayText = currentValue ? formatValue(currentValue, locale) : placeholder;
    const hasValue = Boolean(currentValue);

    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            ref={ref}
            type="button"
            id={id}
            disabled={disabled}
            role="combobox"
            aria-haspopup="dialog"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
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
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="start"
            sideOffset={4}
            aria-label="Choose a date"
            className={cn(
              'z-50 rounded-[var(--radius-md)] border border-[var(--color-border-strong)]',
              'bg-[var(--color-bg-surface)] shadow-[var(--shadow-overlay)] p-3',
              'data-[state=open]:motion-safe:animate-in data-[state=closed]:motion-safe:animate-out',
            )}
          >
            <DayPicker
              mode="single"
              selected={currentValue}
              onSelect={handleSelect}
              locale={locale}
              autoFocus
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);

DatePicker.displayName = 'DatePicker';
