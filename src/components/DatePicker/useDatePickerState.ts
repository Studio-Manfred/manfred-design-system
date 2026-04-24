import * as React from 'react';
import { sv } from 'date-fns/locale/sv';
import type { Locale } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { DatePickerProps, DatePickerRangeProps, DatePickerSingleProps } from './DatePicker';
import {
  type DatePickerInternalState,
  buildRangeState,
  buildSingleState,
  isDateRange,
} from './datePickerStateHelpers';

interface UseDatePickerStateOptions {
  setOpen: (next: boolean) => void;
}

export function useDatePickerState(
  props: DatePickerProps,
  { setOpen }: UseDatePickerStateOptions,
): DatePickerInternalState & {
  captionMonth: Date;
  setCaptionMonth: (m: Date) => void;
  locale: Locale;
} {
  const mode = props.mode ?? 'single';
  const locale: Locale = props.locale ?? sv;

  // Controlled vs uncontrolled: 'value' in props treats value={undefined} as controlled-cleared.
  const isControlled = 'value' in props;

  // Single union-typed state. Both modes share the same useState call to keep hook
  // ordering stable. Shape-mismatched values render empty via the builder-level narrow.
  const [internalValue, setInternalValue] = React.useState<Date | DateRange | undefined>(
    props.defaultValue,
  );
  const currentValue = isControlled ? props.value : internalValue;

  // Caption month = which month the grid shows when opened.
  const [captionMonth, setCaptionMonth] = React.useState<Date>(() => {
    if (isDateRange(currentValue) && currentValue.from) return currentValue.from;
    if (currentValue instanceof Date) return currentValue;
    return new Date();
  });

  // Dev warnings (once per mount).
  const warned = React.useRef({ dual: false, modeChange: false, shape: false });
  const initialMode = React.useRef(mode);
  // Lock mode at mount. Changes produce a warn but don't flip the rendered builder.
  const effectiveMode = initialMode.current;

  React.useEffect(() => {
    if (
      props.value !== undefined &&
      props.defaultValue !== undefined &&
      !warned.current.dual
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        '[DatePicker] received both `value` and `defaultValue`. `value` wins (controlled); `defaultValue` is ignored.',
      );
      warned.current.dual = true;
    }
    if (mode !== initialMode.current && !warned.current.modeChange) {
      // eslint-disable-next-line no-console
      console.warn(
        '[DatePicker] `mode` is mount-time; change ignored. Render two separate instances if you need both.',
      );
      warned.current.modeChange = true;
    }
    if (
      effectiveMode === 'range' &&
      currentValue !== undefined &&
      !isDateRange(currentValue) &&
      !warned.current.shape
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        '[DatePicker] `mode="range"` requires `value` / `defaultValue` of shape `{ from?, to? }`. Got a Date; rendering empty.',
      );
      warned.current.shape = true;
    }
  }, [mode, effectiveMode, props.value, props.defaultValue, currentValue]);

  const placeholder =
    props.placeholder ?? (effectiveMode === 'range' ? 'Pick dates' : 'Pick a date');

  // Narrow the union value for each builder; shape-mismatched values render empty.
  if (effectiveMode === 'single') {
    const singleValue = currentValue instanceof Date ? currentValue : undefined;
    const state = buildSingleState({
      value: singleValue,
      setValue: (next) => setInternalValue(next),
      isControlled,
      setOpen,
      props: props as DatePickerSingleProps,
      locale,
      placeholder,
    });
    return { ...state, captionMonth, setCaptionMonth, locale };
  }

  const rangeValue = isDateRange(currentValue) ? currentValue : undefined;
  const state = buildRangeState({
    value: rangeValue,
    setValue: (next) => setInternalValue(next),
    isControlled,
    setOpen,
    props: props as DatePickerRangeProps,
    locale,
    placeholder,
  });
  return { ...state, captionMonth, setCaptionMonth, locale };
}
