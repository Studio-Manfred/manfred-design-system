import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from './Popover';

function Fixture() {
  return (
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>
        <p>Panel body</p>
        <PopoverClose>Close</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

describe('Popover', () => {
  it('is closed by default', () => {
    render(<Fixture />);
    expect(screen.queryByText('Panel body')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens on trigger click and reports aria-expanded', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.getByText('Panel body')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes via PopoverClose', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.getByText('Panel body')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByText('Panel body')).not.toBeInTheDocument());
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Fixture />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.getByText('Panel body')).toBeInTheDocument());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('Panel body')).not.toBeInTheDocument());
  });

  describe('keyboard and focus', () => {
    it('Enter on the trigger opens the popover and moves focus inside it', async () => {
      const user = userEvent.setup();
      render(<Fixture />);
      await user.tab();
      expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
      await user.keyboard('{Enter}');
      const panel = await screen.findByRole('dialog');
      expect(panel).toContainElement(document.activeElement as HTMLElement);
      expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    });

    it('Space on the trigger opens the popover', async () => {
      const user = userEvent.setup();
      render(<Fixture />);
      await user.tab();
      await user.keyboard(' ');
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('Escape returns focus to the trigger', async () => {
      const user = userEvent.setup();
      render(<Fixture />);
      await user.tab();
      await user.keyboard('{Enter}');
      await screen.findByRole('dialog');
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
    });

    it('trigger aria-controls points at the open panel', async () => {
      const user = userEvent.setup();
      render(<Fixture />);
      const trigger = screen.getByRole('button', { name: 'Open' });
      await user.click(trigger);
      const panel = await screen.findByRole('dialog');
      expect(trigger).toHaveAttribute('aria-controls', panel.id);
    });
  });
});
