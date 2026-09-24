import { describe, it, expect, vi } from 'vitest';
import { sv } from 'date-fns/locale/sv';
import { enUS } from 'date-fns/locale/en-US';
import type { DateRange } from 'react-day-picker';
import { buildRangeState, buildSingleState, isDateRange } from './datePickerStateHelpers';
import type { DatePickerRangeProps, DatePickerSingleProps } from './DatePicker';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

function single(
  value: Date | undefined,
  props: Partial<DatePickerSingleProps> = {},
  isControlled = false,
) {
  const setValue = vi.fn();
  const setOpen = vi.fn();
  const onValueChange = vi.fn();
  const state = buildSingleState({
    value,
    setValue,
    isControlled,
    setOpen,
    props: { onValueChange, ...props },
    locale: sv,
    placeholder: 'Pick a date',
  });
  return { state, setValue, setOpen, onValueChange };
}

function range(
  value: DateRange | undefined,
  props: Partial<DatePickerRangeProps> = {},
  isControlled = false,
) {
  const setValue = vi.fn();
  const setOpen = vi.fn();
  const onValueChange = vi.fn();
  const state = buildRangeState({
    value,
    setValue,
    isControlled,
    setOpen,
    props: { mode: 'range', onValueChange, ...props },
    locale: sv,
    placeholder: 'Pick dates',
  });
  return { state, setValue, setOpen, onValueChange };
}

describe('isDateRange — table', () => {
  it.each([
    ['{from, to}', { from: d(2026, 4, 1), to: d(2026, 4, 2) }, true],
    ['{to} only', { to: d(2026, 4, 2) }, true],
    ['transient empty {} from rdp', {}, true],
    ['unrelated object', { start: d(2026, 4, 1) }, false],
    ['Date', d(2026, 4, 1), false],
    ['array', [], false],
    ['null', null, false],
    ['undefined', undefined, false],
    ['string', '2026-04-01', false],
  ])('%s → %s', (_label, input, expected) => {
    expect(isDateRange(input)).toBe(expected);
  });
});

describe('buildSingleState', () => {
  it('shows the placeholder and marks empty when there is no value', () => {
    const { state } = single(undefined);
    expect(state.displayText).toBe('Pick a date');
    expect(state.isEmpty).toBe(true);
  });

  it.each([
    ['month boundary', d(2026, 1, 31), '2026-01-31'],
    ['leap day', d(2028, 2, 29), '2028-02-29'],
    ['year boundary', d(2026, 12, 31), '2026-12-31'],
    ['first of year', d(2027, 1, 1), '2027-01-01'],
  ])('serialises %s to a local ISO date without timezone drift', (_label, value, iso) => {
    const { state } = single(value, { name: 'when' });
    expect(state.hiddenInputs).toEqual([{ name: 'when', value: iso }]);
  });

  it('emits no hidden input without a name', () => {
    expect(single(d(2026, 4, 1)).state.hiddenInputs).toEqual([]);
  });

  it('uses the locale when formatting the display text', () => {
    const setValue = vi.fn();
    const state = buildSingleState({
      value: d(2026, 4, 24),
      setValue,
      isControlled: false,
      setOpen: vi.fn(),
      props: {},
      locale: enUS,
      placeholder: 'Pick a date',
    });
    expect(state.displayText).toBe('04/24/2026');
  });

  it('uncontrolled select stores the value and notifies the consumer', () => {
    const { state, setValue, onValueChange } = single(undefined);
    state.handleSelect(d(2026, 4, 5));
    expect(setValue).toHaveBeenCalledWith(d(2026, 4, 5));
    expect(onValueChange).toHaveBeenCalledWith(d(2026, 4, 5));
  });

  it('controlled select only notifies the consumer', () => {
    const { state, setValue, onValueChange } = single(d(2026, 4, 1), {}, true);
    state.handleSelect(d(2026, 4, 5));
    expect(setValue).not.toHaveBeenCalled();
    expect(onValueChange).toHaveBeenCalledWith(d(2026, 4, 5));
  });

  it.each([
    ['a date', d(2026, 4, 5), true],
    ['undefined (rdp deselect of the active day)', undefined, false],
  ])('closes on select of %s → %s', (_label, next, expected) => {
    expect(single(d(2026, 4, 5)).state.shouldCloseOnSelect(next)).toBe(expected);
  });

  it.each([
    ['uncontrolled', false, 1],
    ['controlled', true, 0],
  ])('clear (%s) empties, notifies undefined and closes', (_label, controlled, setCalls) => {
    const { state, setValue, setOpen, onValueChange } = single(d(2026, 4, 5), {}, controlled);
    state.clear();
    expect(setValue).toHaveBeenCalledTimes(setCalls);
    expect(onValueChange).toHaveBeenCalledWith(undefined);
    expect(setOpen).toHaveBeenCalledWith(false);
  });
});

describe('buildRangeState — display and form serialisation', () => {
  it.each<[string, DateRange | undefined, string, boolean]>([
    ['undefined', undefined, 'Pick dates', true],
    ['empty {} (rdp transient)', {} as DateRange, 'Pick dates', true],
    ['both endpoints undefined', { from: undefined, to: undefined }, 'Pick dates', true],
    ['partial (from only)', { from: d(2026, 4, 1), to: undefined }, '2026-04-01 – …', false],
    ['same-day range', { from: d(2026, 4, 1), to: d(2026, 4, 1) }, '2026-04-01 – 2026-04-01', false],
    [
      'range across a month boundary',
      { from: d(2026, 1, 30), to: d(2026, 2, 2) },
      '2026-01-30 – 2026-02-02',
      false,
    ],
    [
      'range across a year boundary',
      { from: d(2026, 12, 30), to: d(2027, 1, 2) },
      '2026-12-30 – 2027-01-02',
      false,
    ],
  ])('%s → "%s"', (_label, value, text, empty) => {
    const { state } = range(value);
    expect(state.displayText).toBe(text);
    expect(state.isEmpty).toBe(empty);
  });

  it.each<[string, DateRange | undefined, string, string]>([
    ['empty', undefined, '', ''],
    ['partial', { from: d(2026, 2, 28) }, '2026-02-28', ''],
    ['to-only', { from: undefined, to: d(2026, 3, 1) }, '', '2026-03-01'],
    ['complete', { from: d(2026, 2, 28), to: d(2026, 3, 1) }, '2026-02-28', '2026-03-01'],
  ])('hidden inputs for %s range', (_label, value, from, to) => {
    const { state } = range(value, { name: 'stay' });
    expect(state.hiddenInputs).toEqual([
      { name: 'stay_from', value: from },
      { name: 'stay_to', value: to },
    ]);
  });

  it('custom formatValue receives the range and locale', () => {
    const formatValue = vi.fn(() => 'custom');
    const value = { from: d(2026, 4, 1), to: d(2026, 4, 3) };
    const { state } = range(value, { formatValue });
    expect(state.displayText).toBe('custom');
    expect(formatValue).toHaveBeenCalledWith(value, sv);
  });
});

describe('buildRangeState — selection', () => {
  it('first click on an empty range rewrites rdp`s {from:X, to:X} to a partial range and stays open', () => {
    const { state, setValue, onValueChange } = range(undefined);
    const next = { from: d(2026, 4, 10), to: d(2026, 4, 10) };
    state.handleSelect(next);
    const expected = { from: d(2026, 4, 10), to: undefined };
    expect(setValue).toHaveBeenCalledWith(expected);
    expect(onValueChange).toHaveBeenCalledWith(expected);
    expect(state.shouldCloseOnSelect(next)).toBe(false);
  });

  it('same-day click on an existing partial range commits a single-day range and closes', () => {
    const { state, onValueChange } = range({ from: d(2026, 4, 10) });
    const next = { from: d(2026, 4, 10), to: d(2026, 4, 10) };
    state.handleSelect(next);
    expect(onValueChange).toHaveBeenCalledWith(next);
    expect(state.shouldCloseOnSelect(next)).toBe(true);
  });

  it('a different-day complete range from empty passes through and closes', () => {
    const { state, onValueChange } = range(undefined);
    const next = { from: d(2026, 4, 10), to: d(2026, 4, 12) };
    state.handleSelect(next);
    expect(onValueChange).toHaveBeenCalledWith(next);
    expect(state.shouldCloseOnSelect(next)).toBe(true);
  });

  it('rdp deselect (undefined) clears the range and keeps the popover open', () => {
    const { state, setValue, onValueChange } = range({ from: d(2026, 4, 10), to: d(2026, 4, 12) });
    state.handleSelect(undefined);
    expect(setValue).toHaveBeenCalledWith(undefined);
    expect(onValueChange).toHaveBeenCalledWith(undefined);
    expect(state.shouldCloseOnSelect(undefined)).toBe(false);
  });

  it('a raw Date (wrong shape for range mode) is dropped to undefined and does not close', () => {
    const { state, onValueChange } = range(undefined);
    state.handleSelect(d(2026, 4, 10));
    expect(onValueChange).toHaveBeenCalledWith(undefined);
    expect(state.shouldCloseOnSelect(d(2026, 4, 10))).toBe(false);
  });

  it.each<[string, DateRange, boolean]>([
    ['partial range', { from: d(2026, 4, 10) }, false],
    ['to-only range', { from: undefined, to: d(2026, 4, 10) }, false],
    ['empty {} (rdp transient)', {} as DateRange, false],
    ['complete range', { from: d(2026, 4, 10), to: d(2026, 4, 11) }, true],
  ])('shouldCloseOnSelect from a partial value: %s → %s', (_label, next, expected) => {
    expect(range({ from: d(2026, 4, 1) }).state.shouldCloseOnSelect(next)).toBe(expected);
  });

  it('controlled select only notifies the consumer', () => {
    const { state, setValue, onValueChange } = range({ from: d(2026, 4, 1) }, {}, true);
    state.handleSelect({ from: d(2026, 4, 1), to: d(2026, 4, 5) });
    expect(setValue).not.toHaveBeenCalled();
    expect(onValueChange).toHaveBeenCalledWith({ from: d(2026, 4, 1), to: d(2026, 4, 5) });
  });

  it.each([
    ['uncontrolled', false, 1],
    ['controlled', true, 0],
  ])('clear (%s) empties, notifies undefined and closes', (_label, controlled, setCalls) => {
    const { state, setValue, setOpen, onValueChange } = range(
      { from: d(2026, 4, 1), to: d(2026, 4, 5) },
      {},
      controlled,
    );
    state.clear();
    expect(setValue).toHaveBeenCalledTimes(setCalls);
    expect(onValueChange).toHaveBeenCalledWith(undefined);
    expect(setOpen).toHaveBeenCalledWith(false);
  });
});
