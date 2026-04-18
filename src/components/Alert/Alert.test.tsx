import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from './Alert';

describe('Alert', () => {
  it('has role=alert', () => {
    render(<Alert>Info</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders title and body', () => {
    render(<Alert title="Saved">Changes persisted</Alert>);
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Changes persisted')).toBeInTheDocument();
  });

  it.each(['info', 'success', 'warning', 'error'] as const)('renders icon for %s', (variant) => {
    const { container } = render(<Alert variant={variant}>msg</Alert>);
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(1);
  });

  it('icon can be suppressed', () => {
    const { container } = render(
      <Alert variant="info" icon={false}>
        msg
      </Alert>,
    );
    expect(container.querySelectorAll('svg').length).toBe(0);
  });

  it('shows close button and fires onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Alert onClose={onClose}>msg</Alert>);
    await user.click(screen.getByRole('button', { name: 'Dismiss alert' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('hides close button when onClose is absent', () => {
    render(<Alert>msg</Alert>);
    expect(screen.queryByRole('button', { name: 'Dismiss alert' })).not.toBeInTheDocument();
  });
});
