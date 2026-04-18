import { describe, it, expect } from 'vitest';
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
});
