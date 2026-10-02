import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect, waitFor } from 'storybook/test';
import { NotificationBell, type NotificationItem } from './NotificationBell';
import { Avatar } from '../Avatar';

const meta: Meta<typeof NotificationBell> = {
  title: 'Components/NotificationBell',
  component: NotificationBell,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Bell icon button with an unread indicator (count badge capped at "9+", ' +
          'or a dot) that opens a panel of notifications. Presentational + ' +
          'interaction only: the consumer supplies `items`, read state and ' +
          'navigation. Place it in `AppHeader`\'s `actions` slot. The bell is ' +
          'named "Notifications, N unread"; the badge is `aria-hidden`; the ' +
          'panel is a labelled dialog; increases in the unread count are ' +
          'announced politely.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof NotificationBell>;

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);

const ITEMS: NotificationItem[] = [
  {
    id: '1',
    title: (
      <>
        <strong>Moa</strong> commented on “Q4 plan”
      </>
    ),
    description: 'Looks good to me — let’s ship it on Monday.',
    timestamp: minutesAgo(5),
    href: '#card-1',
    avatar: <Avatar alt="Moa" name="Moa Svensson" size="sm" />,
  },
  {
    id: '2',
    title: (
      <>
        <strong>Jens</strong> mentioned you in “Kickoff”
      </>
    ),
    timestamp: minutesAgo(90),
    href: '#card-2',
    avatar: <Avatar alt="Jens" name="Jens Wedin" size="sm" />,
  },
  {
    id: '3',
    title: 'Board “Archive 2025” was archived',
    timestamp: minutesAgo(60 * 26),
    read: true,
    href: '#board-3',
  },
];

export const Unread: Story = {
  name: 'Unread (count badge)',
  args: { items: ITEMS, onMarkAllRead: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const bell = canvas.getByRole('button', { name: 'Notifications, 2 unread' });
    expect(bell).toHaveAttribute('aria-expanded', 'false');

    // Keyboard open → focus moves into the labelled dialog.
    bell.focus();
    await userEvent.keyboard('{Enter}');
    const dialog = await body.findByRole('dialog', { name: 'Notifications' });
    expect(bell).toHaveAttribute('aria-expanded', 'true');
    const markAll = within(dialog).getByRole('button', { name: 'Mark all as read' });
    await waitFor(() => expect(markAll).toHaveFocus());
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(3);

    // Tab walks the items.
    await userEvent.tab();
    expect(within(dialog).getAllByRole('link')[0]).toHaveFocus();

    // Esc closes and returns focus to the bell.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(bell).toHaveFocus());

    // Leave it open for the snapshot + axe.
    await userEvent.click(bell);
    await body.findByRole('dialog');
  },
};

export const Dot: Story = {
  name: 'Dot indicator',
  args: { items: ITEMS, indicator: 'dot' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button', { name: 'Notifications, 2 unread' })).toBeInTheDocument();
  },
};

export const ManyUnread: Story = {
  name: 'Count capped at 9+',
  args: { items: [], unreadCount: 14 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bell = canvas.getByRole('button', { name: 'Notifications, 14 unread' });
    expect(bell).toHaveTextContent('9+');
  },
};

export const AllRead: Story = {
  name: 'All read',
  args: { items: ITEMS.map((i) => ({ ...i, read: true })), onMarkAllRead: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bell = canvas.getByRole('button', { name: 'Notifications' });
    await userEvent.click(bell);
    const dialog = await within(document.body).findByRole('dialog');
    // Nothing unread → no "Mark all as read".
    expect(within(dialog).queryByRole('button', { name: 'Mark all as read' })).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Notifications' }));
    const dialog = await within(document.body).findByRole('dialog');
    expect(within(dialog).getByText('No notifications')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { items: [], loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Notifications' }));
    const dialog = await within(document.body).findByRole('dialog');
    expect(within(dialog).getByRole('status')).toHaveTextContent('Loading notifications');
  },
};

/** Live data: "Simulate new" bumps the count; the polite live region announces it. */
export const LiveUpdates: Story = {
  name: 'Live updates (announced politely)',
  render: () => {
    const [items, setItems] = React.useState<NotificationItem[]>(ITEMS);
    return (
      <div className="flex items-center gap-4">
        <NotificationBell
          items={items}
          onMarkAllRead={() => setItems((all) => all.map((i) => ({ ...i, read: true })))}
        />
        <button
          type="button"
          className="text-sm underline"
          onClick={() =>
            setItems((all) => [
              { id: String(all.length + 1), title: 'New comment on “Roadmap”', timestamp: new Date(), href: '#new' },
              ...all,
            ])
          }
        >
          Simulate new notification
        </button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvasElement.querySelector('[aria-live="polite"]');
    expect(region).toHaveTextContent('');
    await userEvent.click(canvas.getByRole('button', { name: 'Simulate new notification' }));
    expect(canvas.getByRole('button', { name: 'Notifications, 3 unread' })).toBeInTheDocument();
    await waitFor(() => expect(region).toHaveTextContent('3 unread notifications'));
  },
};
