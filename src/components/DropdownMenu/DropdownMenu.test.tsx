import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './DropdownMenu';

function BoardActions({
  onRename = () => {},
  onArchive = () => {},
  onDelete = () => {},
  deleteDisabled = false,
}: {
  onRename?: (e: Event) => void;
  onArchive?: (e: Event) => void;
  onDelete?: (e: Event) => void;
  deleteDisabled?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Board actions for Markus">
          …
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Markus</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onRename} icon={<svg data-testid="rename-icon" />}>
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onArchive}>Archive</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete} disabled={deleteDisabled}>
          Delete board
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function setup(props: React.ComponentProps<typeof BoardActions> = {}) {
  const ue = userEvent.setup();
  render(<BoardActions {...props} />);
  const trigger = screen.getByRole('button', { name: 'Board actions for Markus' });
  return { ue, trigger };
}

describe('DropdownMenu (STU-1012)', () => {
  it('trigger is a closed menu button', () => {
    const { trigger } = setup();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('click opens a menu labelled by the trigger, first item focused', async () => {
    const { ue, trigger } = setup();
    await ue.click(trigger);
    const menu = await screen.findByRole('menu', { name: 'Board actions for Markus' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const items = within(menu).getAllByRole('menuitem');
    expect(items.map((i) => i.textContent)).toEqual(['Rename', 'Archive', 'Delete board']);
    expect(within(menu).getByRole('separator')).toBeInTheDocument();
    expect(within(menu).getByText('Markus')).toBeInTheDocument();
    await waitFor(() => expect(items[0]).toHaveFocus());
    items.forEach((i) => expect(i).toHaveAttribute('tabindex', '-1'));
  });

  it('renders the icon slot hidden from AT', async () => {
    const { ue, trigger } = setup();
    await ue.click(trigger);
    const icon = await screen.findByTestId('rename-icon');
    expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([['{Enter}'], [' '], ['{ArrowDown}']])(
    '%s on the trigger opens with the first item focused',
    async (key) => {
      const { ue, trigger } = setup();
      trigger.focus();
      await ue.keyboard(key);
      const items = await screen.findAllByRole('menuitem');
      await waitFor(() => expect(items[0]).toHaveFocus());
    },
  );

  it('ArrowUp on the trigger opens with the last enabled item focused', async () => {
    const { ue, trigger } = setup();
    trigger.focus();
    await ue.keyboard('{ArrowUp}');
    const items = await screen.findAllByRole('menuitem');
    await waitFor(() => expect(items[2]).toHaveFocus());
  });

  it('arrow keys, Home and End move focus with wrap', async () => {
    const { ue, trigger } = setup();
    await ue.click(trigger);
    const items = await screen.findAllByRole('menuitem');
    await waitFor(() => expect(items[0]).toHaveFocus());
    await ue.keyboard('{ArrowDown}');
    expect(items[1]).toHaveFocus();
    await ue.keyboard('{End}');
    expect(items[2]).toHaveFocus();
    await ue.keyboard('{ArrowDown}');
    expect(items[0]).toHaveFocus();
    await ue.keyboard('{ArrowUp}');
    expect(items[2]).toHaveFocus();
    await ue.keyboard('{Home}');
    expect(items[0]).toHaveFocus();
  });

  it('skips disabled items when navigating; they are aria-disabled and inert', async () => {
    const onDelete = vi.fn();
    const { ue, trigger } = setup({ deleteDisabled: true, onDelete });
    await ue.click(trigger);
    const items = await screen.findAllByRole('menuitem');
    const del = screen.getByRole('menuitem', { name: 'Delete board' });
    expect(del).toHaveAttribute('aria-disabled', 'true');
    await waitFor(() => expect(items[0]).toHaveFocus());
    await ue.keyboard('{End}');
    expect(items[1]).toHaveFocus();
    await ue.keyboard('{ArrowDown}');
    expect(items[0]).toHaveFocus();
    fireEvent.click(del);
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('typeahead focuses the next item starting with the typed characters', async () => {
    const { ue, trigger } = setup();
    await ue.click(trigger);
    const items = await screen.findAllByRole('menuitem');
    await waitFor(() => expect(items[0]).toHaveFocus());
    await ue.keyboard('d');
    expect(items[2]).toHaveFocus();
    await ue.keyboard('a'); // buffer "da" → no match, focus stays
    expect(items[2]).toHaveFocus();
  });

  it('typeahead buffer resets after a pause', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const ue = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<BoardActions />);
      await ue.click(screen.getByRole('button', { name: 'Board actions for Markus' }));
      const items = await screen.findAllByRole('menuitem');
      await waitFor(() => expect(items[0]).toHaveFocus());
      await ue.keyboard('d');
      expect(items[2]).toHaveFocus();
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      await ue.keyboard('a');
      expect(items[1]).toHaveFocus();
    } finally {
      vi.useRealTimers();
    }
  });

  it('typeahead ignores modifier chords', async () => {
    const { ue, trigger } = setup();
    await ue.click(trigger);
    const menu = await screen.findByRole('menu');
    const items = within(menu).getAllByRole('menuitem');
    await waitFor(() => expect(items[0]).toHaveFocus());
    fireEvent.keyDown(menu, { key: 'd', ctrlKey: true });
    expect(items[0]).toHaveFocus();
  });

  it('selecting an item fires onSelect, closes and returns focus to the trigger', async () => {
    const onRename = vi.fn();
    const { ue, trigger } = setup({ onRename });
    await ue.click(trigger);
    await ue.click(await screen.findByRole('menuitem', { name: 'Rename' }));
    expect(onRename).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('Enter on a focused item selects it', async () => {
    const onArchive = vi.fn();
    const { ue, trigger } = setup({ onArchive });
    await ue.click(trigger);
    const items = await screen.findAllByRole('menuitem');
    await waitFor(() => expect(items[0]).toHaveFocus());
    await ue.keyboard('{ArrowDown}{Enter}');
    expect(onArchive).toHaveBeenCalledOnce();
  });

  it('onSelect can call event.preventDefault() to keep the menu open', async () => {
    const { ue, trigger } = setup({ onRename: (e) => e.preventDefault() });
    await ue.click(trigger);
    await ue.click(await screen.findByRole('menuitem', { name: 'Rename' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('Escape closes and returns focus to the trigger', async () => {
    const { ue, trigger } = setup();
    await ue.click(trigger);
    await screen.findByRole('menu');
    await ue.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('Tab closes the menu (focus back on the trigger)', async () => {
    const { ue, trigger } = setup();
    await ue.click(trigger);
    await screen.findByRole('menu');
    await ue.keyboard('{Tab}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('marks the destructive variant with data-variant', async () => {
    const { ue, trigger } = setup();
    await ue.click(trigger);
    expect(await screen.findByRole('menuitem', { name: 'Delete board' })).toHaveAttribute(
      'data-variant',
      'destructive',
    );
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveAttribute(
      'data-variant',
      'default',
    );
  });

  it('supports controlled open + onOpenChange', async () => {
    const ue = userEvent.setup();
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = React.useState(true);
      return (
        <DropdownMenu
          open={open}
          onOpenChange={(o) => {
            onOpenChange(o);
            setOpen(o);
          }}
        >
          <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>One</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    render(<Controlled />);
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    await ue.click(screen.getByRole('menuitem', { name: 'One' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('renders a default <button> trigger without asChild, and defaultOpen opens it', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger className="t">Actions</DropdownMenuTrigger>
        <DropdownMenuContent side="top">
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveClass('t');
    expect(await screen.findByRole('menu')).toBeInTheDocument();
  });

  it('asChild items render the child element (e.g. a link) and Space activates it', async () => {
    const ue = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild onSelect={onSelect}>
            <a href="#open">Open board</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const link = await screen.findByRole('menuitem', { name: 'Open board' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '#open');
    await waitFor(() => expect(link).toHaveFocus());
    await ue.keyboard(' ');
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('composes consumer onClick / onKeyDown handlers on items and trigger', async () => {
    const ue = userEvent.setup();
    const onClick = vi.fn();
    const onTriggerKeyDown = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger onKeyDown={onTriggerKeyDown}>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onClick}>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();
    await ue.keyboard('{ArrowDown}');
    expect(onTriggerKeyDown).toHaveBeenCalled();
    await ue.click(await screen.findByRole('menuitem', { name: 'One' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('ArrowDown/ArrowUp on the trigger while open move focus into the menu', async () => {
    const { ue, trigger } = setup();
    await ue.click(trigger);
    const items = await screen.findAllByRole('menuitem');
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    expect(items[2]).toHaveFocus();
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(items[0]).toHaveFocus();
  });

  it('an empty menu ignores navigation keys', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent />
      </DropdownMenu>,
    );
    const menu = await screen.findByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'x' });
    expect(within(menu).queryAllByRole('menuitem')).toHaveLength(0);
  });

  it('throws a helpful error when parts are used outside <DropdownMenu>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<DropdownMenuTrigger>x</DropdownMenuTrigger>)).toThrow(
      /must be used within <DropdownMenu>/,
    );
    spy.mockRestore();
  });
});
