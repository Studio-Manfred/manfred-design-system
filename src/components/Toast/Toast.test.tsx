import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster, toast } from './Toast';

describe('Toast (sonner wrapper)', () => {
  it('renders a Toaster region', () => {
    render(<Toaster />);
    // sonner exposes section[aria-label="Notifications"] by default
    const region = document.querySelector('section[aria-label^="Notifications"]');
    expect(region).toBeInTheDocument();
  });

  it('toast() adds a toast to the DOM', async () => {
    render(<Toaster />);
    toast('Saved!');
    await waitFor(() => expect(screen.getByText('Saved!')).toBeInTheDocument());
  });

  it('toast.success adds a success toast', async () => {
    render(<Toaster />);
    toast.success('Done');
    await waitFor(() => expect(screen.getByText('Done')).toBeInTheDocument());
  });

  it('toast.error adds an error toast', async () => {
    render(<Toaster />);
    toast.error('Oops');
    await waitFor(() => expect(screen.getByText('Oops')).toBeInTheDocument());
  });

  it('toasts can be triggered from a button click', async () => {
    const user = userEvent.setup();
    function App() {
      return (
        <>
          <button onClick={() => toast('From click')}>go</button>
          <Toaster />
        </>
      );
    }
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'go' }));
    await waitFor(() => expect(screen.getByText('From click')).toBeInTheDocument());
  });

  describe('announcement and keyboard', () => {
    afterEach(() => {
      toast.dismiss();
    });

    it('the region is a polite live region announcing additions', () => {
      render(<Toaster />);
      const region = document.querySelector('section[aria-label^="Notifications"]')!;
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region).toHaveAttribute('aria-relevant', 'additions text');
    });

    it('the region label advertises the keyboard shortcut', () => {
      render(<Toaster />);
      expect(document.querySelector('section[aria-label="Notifications alt+T"]')).toBeInTheDocument();
    });

    it('each toast is one Tab stop; the region and list are not', async () => {
      const user = userEvent.setup();
      render(
        <>
          <button type="button">Before</button>
          <Toaster />
          <button type="button">After</button>
        </>,
      );
      toast('Queued');
      const message = await screen.findByText('Queued');
      await user.tab();
      await user.tab();
      // The toast <li> (tabIndex 0) is focusable; section/ol are tabIndex -1.
      expect(message.closest('li')).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('Alt+T moves focus to the toast list, and the action is keyboard-operable', async () => {
      const user = userEvent.setup();
      const onUndo = vi.fn();
      render(<Toaster />);
      toast('Item deleted', { action: { label: 'Undo', onClick: onUndo } });
      const message = await screen.findByText('Item deleted');
      await user.keyboard('{Alt>}t{/Alt}');
      const list = message.closest('ol')!;
      expect(list).toHaveFocus();
      await user.tab();
      expect(message.closest('li')).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'Undo' })).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(onUndo).toHaveBeenCalledOnce();
    });
  });
});
