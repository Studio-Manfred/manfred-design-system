import type { DateRange } from 'react-day-picker';

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
