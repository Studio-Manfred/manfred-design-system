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
});
