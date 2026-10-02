/**
 * Internal helper for {@link NotificationBell} (STU-1002) — not exported
 * from the barrel.
 *
 * - `Date` → short English relative time ("5 minutes ago", "yesterday").
 * - ISO-8601 string (starts with `YYYY-MM-DD`) → parsed, then formatted.
 * - Any other string → returned verbatim (already formatted by the caller).
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30.44 * DAY;
const YEAR = 365 * DAY;

/** Resolve a timestamp to a Date, or `null` when it is a pre-formatted string. */
export function toDate(timestamp: Date | string): Date | null {
  if (timestamp instanceof Date) return timestamp;
  if (ISO_DATE.test(timestamp) && !Number.isNaN(Date.parse(timestamp))) {
    return new Date(timestamp);
  }
  return null;
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatRelativeTime(timestamp: Date | string, now: Date = new Date()): string {
  const date = toDate(timestamp);
  if (date === null) return timestamp as string;

  const seconds = (date.getTime() - now.getTime()) / 1000;
  const abs = Math.abs(seconds);

  if (abs < 45) return 'just now';
  if (abs < HOUR) return rtf.format(Math.round(seconds / MINUTE), 'minute');
  if (abs < DAY) return rtf.format(Math.round(seconds / HOUR), 'hour');
  if (abs < WEEK) return rtf.format(Math.round(seconds / DAY), 'day');
  if (abs < 4 * WEEK) return rtf.format(Math.round(seconds / WEEK), 'week');
  if (abs < YEAR) return rtf.format(Math.round(seconds / MONTH), 'month');
  return rtf.format(Math.round(seconds / YEAR), 'year');
}
