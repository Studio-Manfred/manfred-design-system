import { describe, it, expect, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationBell, type NotificationItem } from './NotificationBell';
import { formatRelativeTime } from './formatRelativeTime';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);

const ITEMS: NotificationItem[] = [
  {
    id: '1',
    title: 'Moa commented on “Q4 plan”',
    description: 'Looks good to me!',
    timestamp: minutesAgo(5),
    href: '#card-1',
  },
  { id: '2', title: 'Jens mentioned you', timestamp: minutesAgo(90), onSelect: () => {} },
  { id: '3', title: 'Board archived', timestamp: '2h ago', read: true },
];

describe('NotificationBell — trigger', () => {
  it('is a button named by the label alone when nothing is unread', () => {
    render(<NotificationBell items={[]} />);
    const bell = screen.getByRole('button', { name: 'Notifications' });
    expect(bell).toHaveAttribute('aria-expanded', 'false');
    expect(bell).toHaveAttribute('aria-haspopup', 'dialog');
    expect(bell.querySelector('[data-slot="notification-indicator"]')).toBeNull();
  });

  it('derives the unread count from items and puts it in the accessible name; the badge is aria-hidden', () => {
    render(<NotificationBell items={ITEMS} />);
    const bell = screen.getByRole('button', { name: 'Notifications, 2 unread' });
    const badge = bell.querySelector('[data-slot="notification-indicator"]');
    expect(badge).toHaveTextContent('2');
    expect(badge).toHaveAttribute('aria-hidden', 'true');
  });

  it('honours an explicit unreadCount and caps the badge at 9+', () => {
    render(<NotificationBell items={[]} unreadCount={12} />);
    const bell = screen.getByRole('button', { name: 'Notifications, 12 unread' });
    expect(bell.querySelector('[data-slot="notification-indicator"]')).toHaveTextContent('9+');
  });

  it('indicator="dot" shows a dot without a number but keeps the count in the name', () => {
    render(<NotificationBell items={ITEMS} indicator="dot" />);
    const bell = screen.getByRole('button', { name: 'Notifications, 2 unread' });
    const dot = bell.querySelector('[data-slot="notification-indicator"]');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveTextContent('');
  });

  it('accepts a custom label and forwards ref + className to the button', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<NotificationBell ref={ref} items={[]} label="Aviseringar" className="custom" />);
    const bell = screen.getByRole('button', { name: 'Aviseringar' });
    expect(ref.current).toBe(bell);
    expect(bell.className).toContain('custom');
  });
});

describe('NotificationBell — panel', () => {
  it('opens a labelled dialog with a list of notifications; focus moves into the panel', async () => {
    const ue = userEvent.setup();
    render(<NotificationBell items={ITEMS} />);
    const bell = screen.getByRole('button', { name: /notifications/i });
    await ue.click(bell);
    const dialog = await screen.findByRole('dialog', { name: 'Notifications' });
    expect(bell).toHaveAttribute('aria-expanded', 'true');
    const list = within(dialog).getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  });

  it('renders title, description, relative time and an "Unread" cue per item', async () => {
    const ue = userEvent.setup();
    render(<NotificationBell items={ITEMS} />);
    await ue.click(screen.getByRole('button', { name: /notifications/i }));
    const dialog = await screen.findByRole('dialog');
    const [first, second, third] = within(dialog).getAllByRole('listitem');
    expect(first).toHaveTextContent('Moa commented on “Q4 plan”');
    expect(first).toHaveTextContent('Looks good to me!');
    const time = first.querySelector('time');
    expect(time).toHaveTextContent('5 minutes ago');
    expect(time).toHaveAttribute('dateTime', (ITEMS[0].timestamp as Date).toISOString());
    expect(within(first).getByText('Unread')).toHaveClass('sr-only');
    expect(second).toHaveTextContent('2 hours ago');
    // Pre-formatted strings render verbatim and read items have no cue.
    expect(third).toHaveTextContent('2h ago');
    expect(within(third).queryByText('Unread')).not.toBeInTheDocument();
  });

  it('href items are links; onSelect items are buttons that fire and close the panel', async () => {
    const onSelect = vi.fn();
    const ue = userEvent.setup();
    render(
      <NotificationBell
        items={[
          { id: 'a', title: 'Linked', timestamp: 'now', href: '#a' },
          { id: 'b', title: 'Action', timestamp: 'now', onSelect },
        ]}
      />,
    );
    const bell = screen.getByRole('button', { name: /notifications/i });
    await ue.click(bell);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('link', { name: /linked/i })).toHaveAttribute('href', '#a');
    await ue.click(within(dialog).getByRole('button', { name: /action/i }));
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(bell).toHaveFocus());
  });

  it('Tab moves through the items', async () => {
    const ue = userEvent.setup();
    render(<NotificationBell items={ITEMS} />);
    await ue.click(screen.getByRole('button', { name: /notifications/i }));
    const dialog = await screen.findByRole('dialog');
    const link = within(dialog).getByRole('link');
    await waitFor(() => expect(link).toHaveFocus());
    await ue.tab();
    expect(within(dialog).getByRole('button', { name: /jens mentioned you/i })).toHaveFocus();
  });

  it('Escape closes the panel and returns focus to the bell', async () => {
    const ue = userEvent.setup();
    render(<NotificationBell items={ITEMS} />);
    const bell = screen.getByRole('button', { name: /notifications/i });
    await ue.click(bell);
    await screen.findByRole('dialog');
    await ue.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(bell).toHaveFocus());
  });

  it('Enter and Space on the bell open the panel', async () => {
    const ue = userEvent.setup();
    render(<NotificationBell items={ITEMS} />);
    const bell = screen.getByRole('button', { name: /notifications/i });
    bell.focus();
    await ue.keyboard('{Enter}');
    await screen.findByRole('dialog');
    await ue.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await ue.keyboard(' ');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('shows "Mark all as read" only with onMarkAllRead and unread items', async () => {
    const onMarkAllRead = vi.fn();
    const ue = userEvent.setup();
    const { rerender } = render(<NotificationBell items={ITEMS} onMarkAllRead={onMarkAllRead} />);
    await ue.click(screen.getByRole('button', { name: /notifications/i }));
    const dialog = await screen.findByRole('dialog');
    await ue.click(within(dialog).getByRole('button', { name: 'Mark all as read' }));
    expect(onMarkAllRead).toHaveBeenCalledOnce();
    rerender(
      <NotificationBell items={ITEMS.map((i) => ({ ...i, read: true }))} onMarkAllRead={onMarkAllRead} />,
    );
    expect(within(dialog).queryByRole('button', { name: 'Mark all as read' })).not.toBeInTheDocument();
  });

  it('renders the default and a custom empty state', async () => {
    const ue = userEvent.setup();
    const { rerender } = render(<NotificationBell items={[]} />);
    await ue.click(screen.getByRole('button', { name: 'Notifications' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('No notifications')).toBeInTheDocument();
    expect(within(dialog).queryByRole('list')).not.toBeInTheDocument();
    rerender(<NotificationBell items={[]} emptyState={<p>All caught up</p>} />);
    expect(within(dialog).getByText('All caught up')).toBeInTheDocument();
  });

  it('loading shows a status spinner instead of the list or empty state', async () => {
    const ue = userEvent.setup();
    render(<NotificationBell items={[]} loading />);
    await ue.click(screen.getByRole('button', { name: 'Notifications' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('status')).toHaveTextContent('Loading notifications');
    expect(within(dialog).queryByText('No notifications')).not.toBeInTheDocument();
  });

  it('renders an avatar node when provided', async () => {
    const ue = userEvent.setup();
    render(
      <NotificationBell items={[{ id: 'x', title: 'Hi', timestamp: 'now', avatar: <span data-testid="av" /> }]} />,
    );
    await ue.click(screen.getByRole('button', { name: /notifications/i }));
    expect(await screen.findByTestId('av')).toBeInTheDocument();
  });

  it('reports open changes and supports controlled open', async () => {
    const onOpenChange = vi.fn();
    const ue = userEvent.setup();
    const { rerender } = render(<NotificationBell items={ITEMS} open={false} onOpenChange={onOpenChange} />);
    await ue.click(screen.getByRole('button', { name: /notifications/i }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<NotificationBell items={ITEMS} open onOpenChange={onOpenChange} />);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});

describe('NotificationBell — activation + focus edge cases', () => {
  it('clicking a link row fires onSelect and closes the panel', async () => {
    const onSelect = vi.fn();
    const ue = userEvent.setup();
    render(<NotificationBell items={[{ id: 'l', title: 'Go', timestamp: 'now', href: '#go', onSelect }]} />);
    await ue.click(screen.getByRole('button', { name: /notifications/i }));
    await ue.click(await screen.findByRole('link', { name: /go/i }));
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('focuses the panel itself when it holds no controls', async () => {
    const ue = userEvent.setup();
    render(<NotificationBell items={[]} />);
    await ue.click(screen.getByRole('button', { name: 'Notifications' }));
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(dialog).toHaveFocus());
  });
});

describe('NotificationBell — live announcement', () => {
  it('announces politely only when the unread count goes up (not on mount or decrease)', () => {
    const { rerender } = render(<NotificationBell items={[]} unreadCount={2} />);
    const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(region).toBeInTheDocument();
    expect(region).toHaveTextContent('');
    act(() => rerender(<NotificationBell items={[]} unreadCount={3} />));
    expect(region).toHaveTextContent('3 unread notifications');
    act(() => rerender(<NotificationBell items={[]} unreadCount={3} />));
    expect(region).toHaveTextContent('3 unread notifications');
    act(() => rerender(<NotificationBell items={[]} unreadCount={1} />));
    expect(region).toHaveTextContent('');
    act(() => rerender(<NotificationBell items={[]} unreadCount={2} />));
    expect(region).toHaveTextContent('2 unread notifications');
  });

  it('uses singular wording for one unread', () => {
    const { rerender } = render(<NotificationBell items={[]} unreadCount={0} />);
    act(() => rerender(<NotificationBell items={[]} unreadCount={1} />));
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent('1 unread notification');
    expect(screen.getByRole('button', { name: 'Notifications, 1 unread' })).toBeInTheDocument();
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-10-02T12:00:00Z');
  it.each([
    [new Date('2026-10-02T11:59:50Z'), 'just now'],
    [new Date('2026-10-02T11:59:00Z'), '1 minute ago'],
    [new Date('2026-10-02T11:00:00Z'), '1 hour ago'],
    [new Date('2026-10-01T12:00:00Z'), 'yesterday'],
    [new Date('2026-09-25T12:00:00Z'), 'last week'],
    [new Date('2026-08-02T12:00:00Z'), '2 months ago'],
    [new Date('2024-10-02T12:00:00Z'), '2 years ago'],
    [new Date('2026-10-02T14:00:00Z'), 'in 2 hours'],
  ])('%s → %s', (date, expected) => {
    expect(formatRelativeTime(date, now)).toBe(expected);
  });

  it('parses ISO date strings and returns other strings verbatim', () => {
    expect(formatRelativeTime('2026-10-02T11:00:00Z', now)).toBe('1 hour ago');
    expect(formatRelativeTime('2h ago', now)).toBe('2h ago');
  });
});
