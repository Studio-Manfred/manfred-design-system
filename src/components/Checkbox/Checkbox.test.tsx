import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders an unchecked checkbox by default', () => {
    render(<Checkbox label="Accept" />);
    const cb = screen.getByRole('checkbox', { name: 'Accept' });
    expect(cb).toHaveAttribute('data-state', 'unchecked');
  });

  it('respects defaultChecked', () => {
    render(<Checkbox label="A" defaultChecked />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'checked');
  });

  it('toggles on click in uncontrolled mode', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="A" />);
    const cb = screen.getByRole('checkbox');
    expect(cb).toHaveAttribute('data-state', 'unchecked');
    await user.click(cb);
    expect(cb).toHaveAttribute('data-state', 'checked');
  });

  it('fires onCheckedChange with new state', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox label="A" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('supports controlled mode', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <Checkbox label="A" checked={false} onCheckedChange={onCheckedChange} />,
    );
    await user.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    rerender(<Checkbox label="A" checked onCheckedChange={onCheckedChange} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'checked');
  });

  it('renders indeterminate state', () => {
    render(<Checkbox label="A" indeterminate />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'indeterminate');
  });

  it('marks aria-invalid when error is set', () => {
    render(<Checkbox label="A" error />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('disabled blocks interaction', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox label="A" disabled onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('renders without a label', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('label element is associated via htmlFor when id is set', () => {
    render(<Checkbox id="terms" label="Accept terms" />);
    const label = screen.getByText('Accept terms').closest('label')!;
    expect(label).toHaveAttribute('for', 'terms');
  });
});
