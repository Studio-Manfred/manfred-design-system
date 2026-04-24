import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { format as formatDate } from 'date-fns';
import { sv } from 'date-fns/locale/sv';
import type { Locale } from 'date-fns';
import { Icon } from '../Icon';
import { Button } from '../Button';
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

/**
 * Manfred-token classNames for react-day-picker v9.
 *
 * Every entry references a semantic token — no hex, no primitive-layer
 * skips. If you need a color that doesn't exist yet, add it to the
 * semantic layer in tokens.css first (never hardcode here).
 *
 * Key names follow the rdp v9 UI enum (UI.d.ts). v8 names are deprecated:
 *   caption → month_caption, table → month_grid, head_row → weekdays,
 *   head_cell → weekday, row → week, cell → day, day → day_button,
 *   day_selected → selected, day_today → today, day_outside → outside,
 *   day_disabled → disabled, day_hidden → hidden,
 *   nav_button_previous → button_previous, nav_button_next → button_next.
 */
const rdpClassNames = {
  root: 'font-sans',
  months: 'flex flex-col gap-3',
  month: 'space-y-3',
  month_caption: 'flex justify-between items-center px-1',
  caption_label: 'text-base font-semibold text-[var(--color-text-primary)]',
  nav: 'flex gap-1',
  button_previous:
    'inline-flex items-center justify-center size-8 rounded-full ' +
    'hover:bg-[var(--color-bg-subtle)] ' +
    'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
  button_next:
    'inline-flex items-center justify-center size-8 rounded-full ' +
    'hover:bg-[var(--color-bg-subtle)] ' +
    'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
  month_grid: 'w-full border-collapse',
  weekdays: 'flex',
  weekday:
    'text-[var(--color-text-muted)] w-10 text-[11px] uppercase tracking-wide font-normal',
  weeks: '',
  week: 'flex w-full mt-1',
  day: 'size-10 text-center text-sm p-0 relative',
  day_button:
    'size-10 inline-flex items-center justify-center rounded-[var(--radius-sm)] ' +
    'text-sm font-sans text-[var(--color-text-primary)] ' +
    'hover:bg-[var(--color-bg-subtle)] ' +
    'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
  selected:
    'bg-[var(--color-interactive-brand-bg)] text-[var(--color-text-on-brand)] ' +
    'hover:bg-[var(--color-interactive-brand-bg)] rounded-[var(--radius-sm)]',
  today: 'ring-[1.5px] ring-[var(--color-focus-ring)] rounded-[var(--radius-sm)]',
  outside: 'text-[var(--color-text-muted)] opacity-60',
  disabled: 'text-[var(--color-text-muted)] opacity-50 cursor-not-allowed',
  hidden: 'invisible',
};

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(props, ref) {
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
      minDate,
      maxDate,
      clearable = true,
      showTodayButton = true,
      open: openProp,
      onOpenChange,
      className,
      name,
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

    const popoverId = React.useId();

    // Same split for open state.
    const isOpenControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = isOpenControlled ? openProp : internalOpen;
    const setOpen = (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next);
      if (next) setMonth(currentValue ?? new Date());
      onOpenChange?.(next);
    };

    const handleSelect = (next: Date | undefined) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
      setOpen(false);
    };

    const rangeInvalid = Boolean(
      minDate && maxDate && minDate.getTime() > maxDate.getTime(),
    );

    React.useEffect(() => {
      if (rangeInvalid) {
        // eslint-disable-next-line no-console
        console.warn(
          '[DatePicker] minDate > maxDate — range is empty and all days are disabled.',
        );
      }
    }, [rangeInvalid]);

    // Build rdp's `disabled` matcher. rdp ORs an array of matchers together.
    const disabledMatcher = React.useMemo(() => {
      if (rangeInvalid) return { after: new Date(0) }; // every date is after epoch
      const matchers: Array<{ before: Date } | { after: Date }> = [];
      if (minDate) matchers.push({ before: minDate });
      if (maxDate) matchers.push({ after: maxDate });
      return matchers.length > 0 ? matchers : undefined;
    }, [minDate, maxDate, rangeInvalid]);

    // Match TextInput's inner <input> padding so the trigger text aligns with
    // TextInput's content at the same size. inputLikeVariants (shared with
    // TextInput's wrapper) does not carry horizontal padding itself — that's
    // TextInput's local inputVariants job. This constant is the button's
    // equivalent of that wrapper+input padding combo.
    const triggerPadding = size === 'sm' ? 'px-3' : 'px-4';

    const [month, setMonth] = React.useState<Date>(currentValue ?? new Date());

    const displayText = currentValue ? formatValue(currentValue, locale) : placeholder;
    const hasValue = Boolean(currentValue);

    const isoValue = currentValue ? formatDate(currentValue, 'yyyy-MM-dd') : '';

    return (
      <>
        {name ? <input type="hidden" name={name} value={isoValue} /> : null}
        <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            ref={ref}
            type="button"
            id={id}
            disabled={disabled}
            role="combobox"
            aria-controls={popoverId}
            aria-haspopup="dialog"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-invalid={status === 'error' || undefined}
            aria-required={required || undefined}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                setOpen(true);
              }
            }}
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
            id={popoverId}
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
              disabled={disabledMatcher}
              month={month}
              onMonthChange={setMonth}
              classNames={rdpClassNames}
            />
            {(showTodayButton || (clearable && hasValue)) && (
              <div className={cn(
                'mt-3 flex gap-2 border-t border-[var(--color-border-subtle)] pt-3',
                showTodayButton ? 'justify-between' : 'justify-end',
              )}>
                {showTodayButton ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMonth(new Date())}
                    type="button"
                  >
                    Today
                  </Button>
                ) : null}
                {clearable && hasValue ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelect(undefined)}
                    type="button"
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      </>
    );
  },
);

DatePicker.displayName = 'DatePicker';
