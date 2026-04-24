import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';
import { isDateRange } from './datePickerStateHelpers';

describe('isDateRange', () => {
  it('returns true for DateRange objects', () => {
    expect(isDateRange({ from: new Date('2026-04-01'), to: new Date('2026-04-15') })).toBe(true);
    expect(isDateRange({ from: new Date('2026-04-01') })).toBe(true);
    expect(isDateRange({ from: undefined, to: undefined })).toBe(true);
    expect(isDateRange({})).toBe(true);
  });
  it('returns false for Date', () => {
    expect(isDateRange(new Date('2026-04-01'))).toBe(false);
  });
  it('returns false for undefined', () => {
    expect(isDateRange(undefined)).toBe(false);
  });
  it('returns false for primitives', () => {
    expect(isDateRange('2026-04-01')).toBe(false);
    expect(isDateRange(12345)).toBe(false);
    expect(isDateRange(null)).toBe(false);
  });
});

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

describe('DatePicker — constraints', () => {
  it('disables days before minDate', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={new Date(2026, 3, 15)} minDate={new Date(2026, 3, 10)} />);
    await user.click(screen.getByRole('combobox'));
    const day5 = await screen.findByRole('button', { name: /\b5\b/ });
    expect(day5).toBeDisabled();
  });

  it('disables days after maxDate', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={new Date(2026, 3, 15)} maxDate={new Date(2026, 3, 20)} />);
    await user.click(screen.getByRole('combobox'));
    const day25 = await screen.findByRole('button', { name: /\b25\b/ });
    expect(day25).toBeDisabled();
  });

  it('warns when minDate > maxDate and treats range as empty', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultValue={new Date(2026, 3, 15)}
        minDate={new Date(2026, 3, 25)}
        maxDate={new Date(2026, 3, 10)}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('minDate > maxDate'));
    const day15 = await screen.findByRole('button', { name: /\b15\b/ });
    expect(day15).toBeDisabled();
    warnSpy.mockRestore();
  });
});

describe('DatePicker — footer actions', () => {
  it('renders Clear button when clearable and value is set', async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={new Date(2026, 3, 15)} clearable />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('does not render Clear when no value is set', async () => {
    const user = userEvent.setup();
    render(<DatePicker clearable />);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('dialog');
    expect(screen.queryByRole('button', { name: /clear/i })).toBeNull();
  });

  it('Clear button fires onValueChange(undefined) and closes popover', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker defaultValue={new Date(2026, 3, 15)} onValueChange={onChange} clearable />);
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('button', { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders Today button when showTodayButton is true', async () => {
    const user = userEvent.setup();
    render(<DatePicker showTodayButton />);
    await user.click(screen.getByRole('combobox'));
    // Use getAllByRole to handle the case where the DayPicker also marks
    // today's date cell with an aria-label containing "Today".
    const todayButtons = await screen.findAllByRole('button', { name: /today/i });
    expect(todayButtons.length).toBeGreaterThanOrEqual(1);
    // The footer button has no aria-label override — it matches by text content.
    expect(todayButtons.some((btn) => btn.textContent?.trim() === 'Today')).toBe(true);
  });
});

describe('DatePicker — trigger ARIA and keyboard', () => {
  it('trigger has aria-controls pointing at the popover content id', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    const controls = trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(dialog.id || dialog.getAttribute('id')).toBe(controls);
  });

  it('ArrowDown on the trigger opens the popover', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('ArrowUp on the trigger opens the popover', async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('{ArrowUp}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('DatePicker — hidden form input', () => {
  it('does not render a hidden input when no name is provided', () => {
    const { container } = render(<DatePicker defaultValue={new Date(2026, 3, 15)} />);
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });

  it('renders a hidden input with ISO value when name is provided', () => {
    const { container } = render(
      <DatePicker name="birthdate" defaultValue={new Date(2026, 3, 15)} />,
    );
    const hidden = container.querySelector('input[type="hidden"]');
    expect(hidden).toBeInTheDocument();
    expect(hidden).toHaveAttribute('name', 'birthdate');
    expect(hidden).toHaveAttribute('value', '2026-04-15');
  });

  it('hidden input value is empty when no date is selected', () => {
    const { container } = render(<DatePicker name="deadline" />);
    const hidden = container.querySelector('input[type="hidden"]');
    expect(hidden).toHaveAttribute('value', '');
  });
});
