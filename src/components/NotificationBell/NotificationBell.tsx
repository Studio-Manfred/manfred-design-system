import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/Popover';
import { Spinner } from '@/components/Spinner';
import { formatRelativeTime, toDate } from './formatRelativeTime';

/** One notification row in {@link NotificationBell}. */
export interface NotificationItem {
  /** Stable key for the row. */
  id: string;
  /** Main line, e.g. "Moa commented on “Q4 plan”". Rich content allowed (bold actor, etc.). */
  title: React.ReactNode;
  /** Optional secondary line, e.g. a comment excerpt. */
  description?: React.ReactNode;
  /**
   * When it happened. A `Date` or ISO-8601 string renders as English
   * relative time ("5 minutes ago") inside `<time dateTime>`; any other
   * string is rendered verbatim (pre-formatted by the consumer).
   */
  timestamp: Date | string;
  /** Read rows drop the unread dot + "Unread" screen-reader cue. Default `false`. */
  read?: boolean;
  /** Render the row as a link to the item. */
  href?: string;
  /** Render the row as a button (or run alongside `href`). The panel closes afterwards. */
  onSelect?: () => void;
  /** Leading visual, typically `<Avatar size="sm" … />` of the actor. */
  avatar?: React.ReactNode;
}

/** Props for {@link NotificationBell}. */
export interface NotificationBellProps {
  /** The notifications to list, newest first. */
  items: NotificationItem[];
  /** Unread count for the indicator + accessible name. Defaults to the number of items without `read`. */
  unreadCount?: number;
  /** `'count'` (default) shows a number badge capped at "9+"; `'dot'` shows a plain dot. */
  indicator?: 'count' | 'dot';
  /** Accessible name of the bell and heading of the panel. Default `"Notifications"`. */
  label?: string;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Renders a "Mark all as read" button in the panel header while something is unread. */
  onMarkAllRead?: () => void;
  /** Content shown when `items` is empty (and not loading). Default "No notifications". */
  emptyState?: React.ReactNode;
  /** Show a loading spinner in place of the list. */
  loading?: boolean;
  /** Extra classes on the bell button. */
  className?: string;
  /** Text of the mark-all button. Default `"Mark all as read"`. */
  markAllReadLabel?: string;
  /** Screen-reader text of the loading spinner. Default `"Loading notifications"`. */
  loadingLabel?: string;
  /** Visually hidden cue read before each unread row's title. Default `"Unread"`. */
  unreadLabel?: string;
  /**
   * Unread phrase appended to `label` in the bell's accessible name and the
   * live announcement (`"<label>, <phrase>"`). Default `` n => `${n} unread` ``.
   */
  formatUnreadCount?: (count: number) => string;
  /**
   * Formats `Date` / ISO-string timestamps. Default: English relative time
   * ("5 minutes ago"). Other strings always render verbatim.
   */
  formatTimestamp?: (date: Date) => string;
}

const MAX_BADGE = 9;

const defaultFormatUnreadCount = (n: number): string => `${n} unread`;
const defaultFormatTimestamp = (date: Date): string => formatRelativeTime(date);

function NotificationRow({
  item,
  onActivate,
  unreadLabel,
  formatTimestamp,
}: {
  item: NotificationItem;
  onActivate: (item: NotificationItem) => void;
  unreadLabel: string;
  formatTimestamp: (date: Date) => string;
}): React.ReactElement {
  const date = toDate(item.timestamp);
  const when = date ? formatTimestamp(date) : (item.timestamp as string);
  const body = (
    <>
      {item.avatar ? <span className="shrink-0">{item.avatar}</span> : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn('text-sm', !item.read && 'font-semibold')}>
          {!item.read ? <span className="sr-only">{unreadLabel}</span> : null}
          {!item.read ? <span className="sr-only">: </span> : null}
          {item.title}
        </span>
        {item.description ? (
          <span className="text-sm text-muted-foreground line-clamp-2">{item.description}</span>
        ) : null}
        {date ? (
          <time dateTime={date.toISOString()} className="text-xs text-muted-foreground">
            {when}
          </time>
        ) : (
          <span className="text-xs text-muted-foreground">{when}</span>
        )}
      </span>
      {!item.read ? (
        <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-destructive" />
      ) : null}
    </>
  );
  const rowCls = 'flex w-full items-start gap-3 px-4 py-3 text-left';
  const interactiveCls = cn(
    rowCls,
    'hover:bg-accent focus-visible:outline-none focus-visible:bg-accent',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
  );

  if (item.href != null) {
    return (
      <a href={item.href} onClick={() => onActivate(item)} className={interactiveCls}>
        {body}
      </a>
    );
  }
  if (item.onSelect) {
    return (
      <button type="button" onClick={() => onActivate(item)} className={interactiveCls}>
        {body}
      </button>
    );
  }
  return <div className={rowCls}>{body}</div>;
}

/**
 * Bell icon button with an unread indicator that opens a panel listing
 * notifications. Presentational + interaction only — the consumer owns the
 * data, read state and navigation. Place it in `AppHeader`'s `actions` slot.
 *
 * Composes the DS `Popover`, `Badge`, `Button`, `Icon` and `Spinner`.
 *
 * Accessibility:
 * - The bell is a `<button>` named `"<label>, N unread"` (just `label` when
 *   nothing is unread); the visual badge / dot is `aria-hidden`.
 * - Enter / Space open the panel, a `role="dialog"` labelled by its heading;
 *   focus moves into it, Tab walks the items, Esc closes and returns focus.
 * - Unread rows carry a visually hidden "Unread" cue (colour is not the only
 *   signal).
 * - A polite live region announces the bell's name ("Notifications, N unread") only when the
 *   count goes **up** after mount — never on first render or on decrease.
 *
 * @example
 * ```tsx
 * <AppHeader
 *   actions={
 *     <NotificationBell
 *       items={notifications}
 *       onMarkAllRead={markAllRead}
 *     />
 *   }
 * />
 * ```
 */
export const NotificationBell = React.forwardRef<HTMLButtonElement, NotificationBellProps>(
  function NotificationBell(
    {
      items,
      unreadCount,
      indicator = 'count',
      label = 'Notifications',
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      onMarkAllRead,
      emptyState,
      loading = false,
      className,
      markAllReadLabel = 'Mark all as read',
      loadingLabel = 'Loading notifications',
      unreadLabel = 'Unread',
      formatUnreadCount = defaultFormatUnreadCount,
      formatTimestamp = defaultFormatTimestamp,
    },
    ref,
  ) {
    const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
    const controlled = openProp !== undefined;
    const open = controlled ? openProp : innerOpen;
    const setOpen = (next: boolean) => {
      if (!controlled) setInnerOpen(next);
      onOpenChange?.(next);
    };

    const unread = unreadCount ?? items.filter((i) => !i.read).length;
    const accessibleName = unread > 0 ? `${label}, ${formatUnreadCount(unread)}` : label;
    const headingId = React.useId();
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Announce increases only (not on mount, not on decrease / re-render).
    const prevUnread = React.useRef(unread);
    const [announcement, setAnnouncement] = React.useState('');
    React.useEffect(() => {
      if (unread > prevUnread.current) setAnnouncement(accessibleName);
      else if (unread < prevUnread.current) setAnnouncement('');
      prevUnread.current = unread;
      // Only the count drives announcements; label/formatter changes don't.
    }, [unread]);

    const onActivate = (item: NotificationItem) => {
      item.onSelect?.();
      setOpen(false);
    };

    let body: React.ReactNode;
    if (loading) {
      body = (
        <div className="flex justify-center px-4 py-8">
          <Spinner size="sm" label={loadingLabel} />
        </div>
      );
    } else if (items.length === 0) {
      body = (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          {emptyState ?? 'No notifications'}
        </div>
      );
    } else {
      body = (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id}>
              <NotificationRow
                item={item}
                onActivate={onActivate}
                unreadLabel={unreadLabel}
                formatTimestamp={formatTimestamp}
              />
            </li>
          ))}
        </ul>
      );
    }

    return (
      <>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              type="button"
              aria-label={accessibleName}
              className={cn(
                'relative inline-flex items-center justify-center',
                'h-8 w-8 rounded-full',
                'text-foreground/80 hover:bg-accent hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'motion-safe:transition-colors',
                className,
              )}
            >
              <Icon name="bell" size="sm" aria-hidden />
              {unread > 0 ? (
                indicator === 'dot' ? (
                  <span
                    data-slot="notification-indicator"
                    aria-hidden="true"
                    className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive ring-2 ring-background"
                  />
                ) : (
                  <Badge
                    data-slot="notification-indicator"
                    aria-hidden="true"
                    variant="error"
                    size="sm"
                    className="absolute -top-1 -right-1 min-w-[1.25rem] px-1 py-0.5 text-[0.625rem] ring-2 ring-background"
                  >
                    {unread > MAX_BADGE ? `${MAX_BADGE}+` : unread}
                  </Badge>
                )
              ) : null}
            </button>
          </PopoverTrigger>
          <PopoverContent
            ref={contentRef}
            align="end"
            aria-labelledby={headingId}
            className="w-80 p-0"
            onOpenAutoFocus={(e) => {
              // Radix skips links when auto-focusing; notification rows are
              // usually links, so focus the first control in DOM order, or the
              // panel itself (empty / loading / read-only rows).
              e.preventDefault();
              const panel = contentRef.current;
              const first = panel?.querySelector<HTMLElement>('a[href], button:not([disabled])');
              (first ?? panel)?.focus();
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
              <h2 id={headingId} className="text-sm font-semibold">
                {label}
              </h2>
              {onMarkAllRead && unread > 0 ? (
                <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
                  {markAllReadLabel}
                </Button>
              ) : null}
            </div>
            <div className="max-h-96 overflow-y-auto">{body}</div>
          </PopoverContent>
        </Popover>
        <span aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </>
    );
  },
);
NotificationBell.displayName = 'NotificationBell';
