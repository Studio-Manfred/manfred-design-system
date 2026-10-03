import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect, fn, waitFor } from 'storybook/test';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './DropdownMenu';
import { Button } from '../Button';
import { Icon } from '../Icon';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  subcomponents: {
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
  } as Record<string, React.ComponentType<unknown>>,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Actions menu behind a trigger (STU-1012), shared with the AppHeader user menu. ' +
          'Compose `DropdownMenu` + `DropdownMenuTrigger asChild` + `DropdownMenuContent` with ' +
          '`DropdownMenuItem`s, optional `DropdownMenuLabel`s and `DropdownMenuSeparator`s. ' +
          'Trigger: `aria-haspopup="menu"` + `aria-expanded`; the menu is named by the trigger. ' +
          'Keyboard: Enter / Space / ArrowDown open on the first item (ArrowUp on the last), ' +
          'arrows / Home / End move with wrap and skip disabled items, typing jumps to a ' +
          'matching item, Enter / Space select, Escape and Tab close and return focus to the ' +
          'trigger. `onSelect(event)` closes the menu unless you call `event.preventDefault()`.',
      },
    },
  },
  argTypes: {
    open: { control: 'boolean', description: 'Controlled open state. Pair with `onOpenChange`.' },
    defaultOpen: { control: 'boolean', description: 'Initial open state when uncontrolled.' },
    onOpenChange: { description: 'Called with the new open state.' },
  },
};

export default meta;

type Story = StoryObj<typeof DropdownMenu>;

function MoreTrigger({ label }: { label: string }) {
  return (
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" aria-label={label}>
        <span aria-hidden="true">…</span>
      </Button>
    </DropdownMenuTrigger>
  );
}

const onRename = fn();
const onArchive = fn();
const onDelete = fn();

/** The intranet board card's "…" menu. */
export const BoardActions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'An icon-button trigger ("Board actions for Markus") with `align="end"`, a ' +
          '`DropdownMenuLabel`, two items, a separator and a `variant="destructive"` item.',
      },
    },
  },
  render: () => (
    <DropdownMenu>
      <MoreTrigger label="Board actions for Markus" />
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Markus</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onRename}>Rename</DropdownMenuItem>
        <DropdownMenuItem onSelect={onArchive}>Archive</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          Delete board
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// Play: keyboard open (ArrowDown → first item), arrow nav, Escape returns
// focus; click open → select closes and fires onSelect.
export const KeyboardInteraction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Coverage story — ArrowDown on the trigger opens the menu on the first item, ' +
          'ArrowDown moves, Escape closes and returns focus; clicking an item fires ' +
          '`onSelect` and closes the menu.',
      },
    },
  },
  render: BoardActions.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Board actions for Markus' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const menu = await body.findByRole('menu', { name: 'Board actions for Markus' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const items = within(menu).getAllByRole('menuitem');
    await waitFor(() => expect(items[0]).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(items[1]).toHaveFocus());

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('menuitem', { name: 'Rename' }));
    await waitFor(() => expect(onRename).toHaveBeenCalled());
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  },
};

export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The `icon` slot takes any node (a DS `Icon` here); it is hidden from assistive ' +
          'tech, so the label carries the meaning.',
      },
    },
  },
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Page actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={<Icon name="external-link" size="sm" />}>
          Open in new tab
        </DropdownMenuItem>
        <DropdownMenuItem icon={<Icon name="settings" size="sm" />}>Page settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" icon={<Icon name="x-circle" size="sm" />}>
          Delete page
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const DisabledItem: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`disabled` items are dimmed, `aria-disabled`, skipped by the keyboard, and never ' +
          'call `onSelect`.',
      },
    },
  },
  render: () => (
    <DropdownMenu defaultOpen>
      <MoreTrigger label="Card actions" />
      <DropdownMenuContent>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem disabled>Move to another board</DropdownMenuItem>
        <DropdownMenuItem>Copy link</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const LinkItems: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`asChild` renders the child element as the item — an `<a href>` or a router ' +
          '`<Link>` for navigation. Space activates links too. Put any icon inside the child.',
      },
    },
  },
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Go to
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <a href="#boards">Boards</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="#blog">Blog</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const KeepOpenOnSelect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`onSelect(event)` closes the menu unless it calls `event.preventDefault()` — for ' +
          'a toggle that should stay visible.',
      },
    },
  },
  render: () => {
    const [compact, setCompact] = React.useState(false);
    return (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setCompact((c) => !c);
            }}
          >
            {compact ? 'Use comfortable view' : 'Use compact view'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const Placement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`side` (`top` / `right` / `bottom` / `left`), `align` (`start` / `center` / `end`) ' +
          'and `sideOffset` (px, default 4) place the panel; it flips when there is no room.',
      },
    },
  },
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Opens to the right
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={8}>
        <DropdownMenuItem>One</DropdownMenuItem>
        <DropdownMenuItem>Two</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: { story: 'Controlled with `open` + `onOpenChange`.' },
    },
  },
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="flex items-center gap-3">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-sm text-muted-foreground">Menu is {open ? 'open' : 'closed'}</span>
      </div>
    );
  },
};
