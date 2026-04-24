import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { sv } from 'date-fns/locale/sv';
import type { Locale } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Icon } from '../Icon';
import { Button } from '../Button';
import { inputLikeVariants, type InputLikeSize, type InputLikeStatus } from '@/lib/inputLikeVariants';
import { cn } from '@/lib/utils';
import { useDatePickerState } from './useDatePickerState';

type DatePickerBaseProps = {
  placeholder?: string;
  locale?: Locale;
  minDate?: Date;
  maxDate?: Date;
  clearable?: boolean;
  showTodayButton?: boolean;
  size?: InputLikeSize;
  status?: InputLikeStatus;
  fullWidth?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export type DatePickerSingleProps = DatePickerBaseProps & {
  mode?: 'single';
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (value: Date | undefined) => void;
  formatValue?: (value: Date, locale: Locale) => string;
};

export type DatePickerRangeProps = DatePickerBaseProps & {
  mode: 'range';
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange | undefined) => void;
  formatValue?: (value: DateRange, locale: Locale) => string;
};

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

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
  root: 'font-sans relative',
  months: 'flex flex-col gap-2',
  month: 'space-y-2',
  month_caption: 'flex justify-center items-center h-8',
  caption_label: 'text-sm font-semibold text-[var(--color-text-primary)]',
  nav: 'absolute top-0 inset-x-0 flex items-center justify-between',
  button_previous:
    'inline-flex items-center justify-center size-8 rounded-full ' +
    'text-[var(--color-text-primary)] [&_polygon]:fill-current ' +
    'hover:bg-[var(--color-bg-subtle)] ' +
    'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
  button_next:
    'inline-flex items-center justify-center size-8 rounded-full ' +
    'text-[var(--color-text-primary)] [&_polygon]:fill-current ' +
    'hover:bg-[var(--color-bg-subtle)] ' +
    'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
  month_grid: 'w-full border-collapse',
  weekdays: 'flex',
  weekday:
    'text-[var(--color-text-muted)] w-9 text-[11px] uppercase tracking-wide font-normal',
  weeks: '',
  week: 'flex w-full mt-0.5',
  day: 'group size-9 text-center text-xs p-0 relative',
  day_button:
    'size-9 inline-flex items-center justify-center rounded-[var(--radius-sm)] ' +
    'text-xs font-sans text-[var(--color-text-primary)] ' +
    'group-aria-selected:text-[var(--color-text-on-brand)] ' +
    'hover:bg-[var(--color-bg-subtle)] group-aria-selected:hover:bg-transparent ' +
    'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
  selected:
    'bg-[var(--color-interactive-brand-bg)] ' +
    'hover:bg-[var(--color-interactive-brand-bg)] rounded-[var(--radius-sm)]',
  today: 'ring-[1.5px] ring-[var(--color-focus-ring)] rounded-[var(--radius-sm)]',
  outside: 'text-[var(--color-text-muted)] opacity-60',
  disabled: 'text-[var(--color-text-muted)] opacity-50 cursor-not-allowed',
  hidden: 'invisible',
};

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(props, ref) {
    const {
      mode = 'single',
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
      locale = sv,
    } = props;

    const popoverId = React.useId();

    const isOpenControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = isOpenControlled ? openProp : internalOpen;
    const setOpen = React.useCallback(
      (next: boolean) => {
        if (!isOpenControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isOpenControlled, onOpenChange],
    );

    const state = useDatePickerState(props, { setOpen });
    const {
      displayText,
      isEmpty,
      hiddenInputs,
      rdpSelected,
      handleSelect,
      shouldCloseOnSelect,
      clear,
      captionMonth,
      setCaptionMonth,
    } = state;

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

    // Compute accessible name: explicit prop wins, otherwise fall back to the
    // current display text so the button always has a discernible name even
    // when no wrapping <label> or aria-labelledby is provided.
    const resolvedAriaLabel = ariaLabel ?? (!ariaLabelledBy ? displayText : undefined);

    // rdp's onSelect → hook's handleSelect, then maybe close.
    const onRdpSelect = (next: Date | DateRange | undefined) => {
      handleSelect(next);
      if (shouldCloseOnSelect(next)) setOpen(false);
    };

    // When the popover opens, jump the caption to the current value's month.
    React.useEffect(() => {
      if (!open) return;
      if (rdpSelected instanceof Date) setCaptionMonth(rdpSelected);
      else if (
        rdpSelected &&
        typeof rdpSelected === 'object' &&
        'from' in rdpSelected &&
        rdpSelected.from
      ) {
        setCaptionMonth(rdpSelected.from);
      }
    }, [open, rdpSelected, setCaptionMonth]);

    return (
      <>
        {hiddenInputs.map((h) => (
          <input key={h.name} type="hidden" name={h.name} value={h.value} />
        ))}
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
              aria-expanded={open}
              aria-label={resolvedAriaLabel}
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
                  isEmpty && 'text-[var(--color-text-muted)]',
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
              aria-label={mode === 'range' ? 'Choose dates' : 'Choose a date'}
              className={cn(
                'z-50 rounded-[var(--radius-md)] border border-[var(--color-border-strong)]',
                'bg-[var(--color-bg-surface)] shadow-[var(--shadow-overlay)] p-2 pt-4',
                'data-[state=open]:motion-safe:animate-in data-[state=closed]:motion-safe:animate-out',
              )}
            >
              {mode === 'range' ? (
                <DayPicker
                  mode="range"
                  selected={rdpSelected as DateRange | undefined}
                  onSelect={(range) => onRdpSelect(range)}
                  locale={locale}
                  autoFocus
                  disabled={disabledMatcher}
                  month={captionMonth}
                  onMonthChange={setCaptionMonth}
                  classNames={rdpClassNames}
                />
              ) : (
                <DayPicker
                  mode="single"
                  selected={rdpSelected as Date | undefined}
                  onSelect={(date) => onRdpSelect(date)}
                  locale={locale}
                  autoFocus
                  disabled={disabledMatcher}
                  month={captionMonth}
                  onMonthChange={setCaptionMonth}
                  classNames={rdpClassNames}
                />
              )}
              {(showTodayButton || (clearable && !isEmpty)) && (
                <div
                  className={cn(
                    'mt-2 flex gap-2 border-t border-[var(--color-border-subtle)] pt-2',
                    showTodayButton ? 'justify-between' : 'justify-end',
                  )}
                >
                  {showTodayButton ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCaptionMonth(new Date())}
                      type="button"
                    >
                      Today
                    </Button>
                  ) : null}
                  {clearable && !isEmpty ? (
                    <Button variant="ghost" size="sm" onClick={clear} type="button">
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
