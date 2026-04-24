import { format as formatDate } from 'date-fns';
import type { Locale } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { DatePickerSingleProps } from './DatePicker';

export interface DatePickerInternalState {
  displayText: string;
  isEmpty: boolean;
  hiddenInputs: Array<{ name: string; value: string }>;
  rdpSelected: Date | DateRange | undefined;
  handleSelect: (next: Date | DateRange | undefined) => void;
  shouldCloseOnSelect: (next: Date | DateRange | undefined) => boolean;
  clear: () => void;
}

export function isDateRange(v: unknown): v is DateRange {
  if (v === null || typeof v !== 'object') return false;
  if (v instanceof Date) return false;
  if (Array.isArray(v)) return false;
  // react-day-picker v9 emits transient empty {} during range selection — keep this branch.
  return 'from' in v || 'to' in v || Object.keys(v).length === 0;
}

const defaultSingleFormat = (value: Date, locale: Locale) =>
  formatDate(value, 'P', { locale });

interface BuildSingleStateOptions {
  value: Date | undefined;
  setValue: (next: Date | undefined) => void;
  isControlled: boolean;
  setOpen: (next: boolean) => void;
  setCaptionMonth: (m: Date) => void;
  props: DatePickerSingleProps;
  locale: Locale;
  placeholder: string;
}

export function buildSingleState(opts: BuildSingleStateOptions): DatePickerInternalState {
  const { value, setValue, isControlled, setOpen, setCaptionMonth, props, locale, placeholder } = opts;
  const formatValue = props.formatValue ?? defaultSingleFormat;

  const displayText = value ? formatValue(value, locale) : placeholder;
  const isEmpty = !value;

  const hiddenInputs = props.name
    ? [{ name: props.name, value: value ? formatDate(value, 'yyyy-MM-dd') : '' }]
    : [];

  const handleSelect = (next: Date | DateRange | undefined) => {
    // rdp in mode="single" gives us Date | undefined. Narrow and pass through.
    const narrowed = next as Date | undefined;
    if (!isControlled) setValue(narrowed);
    props.onValueChange?.(narrowed);
    if (narrowed) setCaptionMonth(narrowed);
  };

  const shouldCloseOnSelect = (next: Date | DateRange | undefined) => {
    // Single mode closes on any selection (including undefined via Clear).
    return next !== undefined;
  };

  const clear = () => {
    if (!isControlled) setValue(undefined);
    props.onValueChange?.(undefined);
    setOpen(false);
  };

  return {
    displayText,
    isEmpty,
    hiddenInputs,
    rdpSelected: value,
    handleSelect,
    shouldCloseOnSelect,
    clear,
  };
}
