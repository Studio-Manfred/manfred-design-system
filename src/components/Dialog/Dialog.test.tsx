import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './Dialog';

function Fixture({ showCloseButton }: { showCloseButton?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Body copy</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe('Dialog', () => {
  it('is closed by default', () => {
    render(<Fixture />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText('Open'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body copy')).toBeInTheDocument();
  });

  it('DialogTitle and DialogDescription are linked via aria', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText('Open'));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('DialogClose button closes the dialog', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText('Open'));
    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('default X close button is rendered', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText('Open'));
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
  });

  it('showCloseButton=false suppresses the X button', async () => {
    const user = userEvent.setup();
    render(<Fixture showCloseButton={false} />);
    await user.click(screen.getByText('Open'));
    expect(screen.queryByRole('button', { name: 'Close dialog' })).not.toBeInTheDocument();
  });

  it('Escape key closes the dialog', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText('Open'));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  describe('keyboard and focus', () => {
    it('opens from the keyboard and moves focus into the dialog', async () => {
      const user = userEvent.setup();
      render(<Fixture />);
      await user.tab();
      expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
      await user.keyboard('{Enter}');
      const dialog = await screen.findByRole('dialog');
      // First tabbable in DOM order is the footer action; the X comes last.
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    });

    it('traps Tab and Shift+Tab inside the dialog', async () => {
      const user = userEvent.setup();
      render(<Fixture />);
      await user.click(screen.getByRole('button', { name: 'Open' }));
      const cancel = screen.getByRole('button', { name: 'Cancel' });
      const close = screen.getByRole('button', { name: 'Close dialog' });
      expect(cancel).toHaveFocus();
      await user.tab();
      expect(close).toHaveFocus();
      await user.tab();
      expect(cancel).toHaveFocus();
      await user.tab({ shift: true });
      expect(close).toHaveFocus();
    });

    it('Escape returns focus to the trigger', async () => {
      const user = userEvent.setup();
      render(<Fixture />);
      await user.tab();
      await user.keyboard('{Enter}');
      await screen.findByRole('dialog');
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
    });

    it('closing via the X button returns focus to the trigger', async () => {
      const user = userEvent.setup();
      render(<Fixture />);
      await user.click(screen.getByRole('button', { name: 'Open' }));
      await user.tab();
      await user.keyboard('{Enter}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
    });

    it('hides the page behind the open dialog from assistive tech', async () => {
      const user = userEvent.setup();
      render(<Fixture />);
      await user.click(screen.getByRole('button', { name: 'Open' }));
      // Radix marks siblings aria-hidden so the reading cursor cannot leave.
      expect(screen.queryByRole('button', { name: 'Open' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Open', hidden: true })).toBeInTheDocument();
    });
  });

  it('accessible name and description resolve to title and description text', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByText('Open'));
    const dialog = screen.getByRole('dialog', { name: 'Title' });
    expect(dialog).toHaveAccessibleDescription('Body copy');
  });
});
