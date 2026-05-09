import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders with role="switch" (Radix)', () => {
    render(<Switch label="Notifications" />);
    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('starts unchecked by default', () => {
    render(<Switch label="A" />);
    expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'unchecked');
  });

  it('respects defaultChecked', () => {
    render(<Switch label="A" defaultChecked />);
    expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked');
  });

  it('toggles on click in uncontrolled mode', async () => {
    const user = userEvent.setup();
    render(<Switch label="A" />);
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('data-state', 'unchecked');
    await user.click(sw);
    expect(sw).toHaveAttribute('data-state', 'checked');
  });

  it('fires onCheckedChange with new value', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="A" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('disabled prevents toggling', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="A" disabled onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('loading sets aria-busy and prevents toggling', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="A" loading onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('aria-busy', 'true');
    expect(sw).toBeDisabled();
    await user.click(sw);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('error sets aria-invalid and applies error border class', () => {
    render(<Switch label="A" error />);
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('aria-invalid', 'true');
    expect(sw.className).toMatch(/feedback-error-fg/);
  });

  it('forwards size sm to track classes', () => {
    render(<Switch label="A" size="sm" />);
    expect(screen.getByRole('switch').className).toMatch(/h-4 w-7/);
  });

  it('forwards size lg to track classes', () => {
    render(<Switch label="A" size="lg" />);
    expect(screen.getByRole('switch').className).toMatch(/h-6 w-11/);
  });

  it('default size is md', () => {
    render(<Switch label="A" />);
    expect(screen.getByRole('switch').className).toMatch(/h-5 w-9/);
  });

  it('label click toggles the switch', async () => {
    const user = userEvent.setup();
    render(<Switch id="notify" label="Enable notifications" />);
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('data-state', 'unchecked');
    await user.click(screen.getByText('Enable notifications'));
    expect(sw).toHaveAttribute('data-state', 'checked');
  });

  it('label is associated via htmlFor when id is set', () => {
    render(<Switch id="notify" label="Enable notifications" />);
    const label = screen.getByText('Enable notifications').closest('label')!;
    expect(label).toHaveAttribute('for', 'notify');
  });

  it('renders without a label', () => {
    render(<Switch aria-label="Standalone" />);
    expect(screen.getByRole('switch', { name: 'Standalone' })).toBeInTheDocument();
  });

  it('supports controlled mode', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <Switch label="A" checked={false} onCheckedChange={onCheckedChange} />,
    );
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    rerender(<Switch label="A" checked onCheckedChange={onCheckedChange} />);
    expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked');
  });
});
