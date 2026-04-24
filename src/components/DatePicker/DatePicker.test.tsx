import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';

describe('DatePicker — trigger render', () => {
  it('renders placeholder when no value is set', () => {
    render(<DatePicker placeholder="Pick a date" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick a date');
  });

  it('renders formatted value using the default short locale format', () => {
    // 2026-04-24 in sv locale via date-fns "P" token → "2026-04-24"
    render(<DatePicker value={new Date(2026, 3, 24)} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('2026-04-24');
  });

  it('renders formatted value using a custom formatValue function', () => {
    render(
      <DatePicker
        value={new Date(2026, 3, 24)}
        formatValue={(d) => `custom-${d.getFullYear()}`}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('custom-2026');
  });

  it('passes size/status/fullWidth/disabled through to the trigger classes', () => {
    render(<DatePicker size="lg" status="error" fullWidth disabled />);
    const btn = screen.getByRole('combobox');
    expect(btn).toBeDisabled();
    // Presence of status-driven class is enough; exact class string is implementation
    expect(btn.className).toMatch(/error|feedback-error/);
    expect(btn.querySelector('svg')).toBeInTheDocument();
  });
});

describe('DatePicker — popover + selection', () => {
  it('trigger has combobox role and dialog-haspopup ARIA', () => {
    render(<DatePicker />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the popover when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('fires onValueChange(Date) when a day is clicked (uncontrolled)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker defaultValue={new Date(2026, 3, 15)} onValueChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    const target = await screen.findByRole('button', { name: /\b17\b/ });
    await user.click(target);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it('respects controlled `value` (does not auto-update internal state)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={new Date(2026, 3, 15)} onValueChange={onChange} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('2026-04-15');
    await user.click(screen.getByRole('combobox'));
    const target = await screen.findByRole('button', { name: /\b17\b/ });
    await user.click(target);
    expect(onChange).toHaveBeenCalled();
    // Consumer hasn't updated `value` — trigger still shows 15
    expect(screen.getByRole('combobox')).toHaveTextContent('2026-04-15');
  });
});
