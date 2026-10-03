import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { FilterChips, type FilterChipItem } from './FilterChips';

// Radix moves roving focus in a setTimeout and only auto-selects while the
// arrow key is still held, so hold it across a tick like a real keypress.
async function press(ue: ReturnType<typeof userEvent.setup>, key: string) {
  await ue.keyboard(`{${key}>}`);
  await act(() => new Promise((r) => setTimeout(r, 0)));
  await ue.keyboard(`{/${key}}`);
}

const items: FilterChipItem[] = [
  { value: 'all', label: 'All', count: 7 },
  { value: 'onboarding', label: 'Onboarding', count: 3 },
  { value: 'sales', label: 'Sales', count: 1 },
  { value: 'archived', label: 'Archived', count: 0, disabled: true },
  { value: 'general', label: 'General' },
];

describe('FilterChips (STU-1011)', () => {
  it('renders a labelled radiogroup with one radio per item', () => {
    render(<FilterChips label="Filter boards by type" items={items} defaultValue="all" />);
    const group = screen.getByRole('radiogroup', { name: 'Filter boards by type' });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('includes the count in the accessible name ("Onboarding, 3"), and a zero count too', () => {
    render(<FilterChips label="Filter" items={items} defaultValue="all" />);
    expect(screen.getByRole('radio', { name: 'Onboarding, 3' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Archived, 0' })).toBeInTheDocument();
    // No count → just the label, no trailing separator.
    expect(screen.getByRole('radio', { name: 'General' })).toBeInTheDocument();
  });

  it('a text label + count is named by aria-label, so no browser inserts a space before the comma', () => {
    // Chromatic build 77: Chrome named the chip "All , 7" because flex items
    // and the absolutely positioned sr-only comma get spaces around them.
    render(<FilterChips label="Filter" items={items} defaultValue="all" />);
    expect(screen.getByRole('radio', { name: 'All, 7' })).toHaveAttribute('aria-label', 'All, 7');
    expect(screen.getByRole('radio', { name: 'General' })).not.toHaveAttribute('aria-label');
  });

  it('a rich (non-text) label keeps its content and the count in the name', () => {
    render(
      <FilterChips
        label="Filter"
        items={[{ value: 'x', label: <em>Starred</em>, count: 2 }]}
        defaultValue="x"
      />,
    );
    const chip = screen.getByRole('radio', { name: /Starred.*2/ });
    expect(chip).not.toHaveAttribute('aria-label');
  });

  it('marks the defaultValue chip checked (aria-checked + data-state)', () => {
    render(<FilterChips label="Filter" items={items} defaultValue="sales" />);
    const sales = screen.getByRole('radio', { name: 'Sales, 1' });
    expect(sales).toHaveAttribute('aria-checked', 'true');
    expect(sales).toHaveAttribute('data-state', 'checked');
    expect(screen.getByRole('radio', { name: 'All, 7' })).toHaveAttribute('aria-checked', 'false');
  });

  it('clicking a chip selects it and fires onValueChange (uncontrolled)', async () => {
    const ue = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <FilterChips label="Filter" items={items} defaultValue="all" onValueChange={onValueChange} />,
    );
    await ue.click(screen.getByRole('radio', { name: 'Onboarding, 3' }));
    expect(onValueChange).toHaveBeenCalledWith('onboarding');
    expect(screen.getByRole('radio', { name: 'Onboarding, 3' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('is controllable via value + onValueChange', async () => {
    const ue = userEvent.setup();
    function Controlled() {
      const [value, setValue] = React.useState('all');
      return (
        <>
          <FilterChips label="Filter" items={items} value={value} onValueChange={setValue} />
          <output data-testid="out">{value}</output>
        </>
      );
    }
    render(<Controlled />);
    await ue.click(screen.getByRole('radio', { name: 'Sales, 1' }));
    expect(screen.getByTestId('out')).toHaveTextContent('sales');
  });

  it('has a single tab stop: Tab lands on the checked chip only', async () => {
    const ue = userEvent.setup();
    render(
      <>
        <button type="button">before</button>
        <FilterChips label="Filter" items={items} defaultValue="onboarding" />
        <button type="button">after</button>
      </>,
    );
    screen.getByRole('button', { name: 'before' }).focus();
    await ue.tab();
    expect(screen.getByRole('radio', { name: 'Onboarding, 3' })).toHaveFocus();
    await ue.tab();
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus();
  });

  it('arrow keys move between chips and select them, skipping disabled chips', async () => {
    const ue = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <FilterChips label="Filter" items={items} defaultValue="sales" onValueChange={onValueChange} />,
    );
    screen.getByRole('radio', { name: 'Sales, 1' }).focus();
    await press(ue, 'ArrowRight');
    // "Archived" is disabled → skipped.
    expect(screen.getByRole('radio', { name: 'General' })).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith('general');
    await press(ue, 'ArrowLeft');
    expect(screen.getByRole('radio', { name: 'Sales, 1' })).toHaveFocus();
  });

  it.each([['{Enter}'], [' ']])('%s selects the focused chip', async (key) => {
    const onValueChange = vi.fn();
    render(
      <FilterChips label="Filter" items={items} value="all" onValueChange={onValueChange} />,
    );
    // Controlled + value pinned: focusing a non-checked chip programmatically
    // (no arrow key) must not select it; the key must.
    const sales = screen.getByRole('radio', { name: 'Sales, 1' });
    sales.focus();
    expect(onValueChange).not.toHaveBeenCalled();
    const ue = userEvent.setup();
    await ue.keyboard(key);
    expect(onValueChange).toHaveBeenCalledWith('sales');
  });

  it('a disabled chip is disabled and cannot be selected', async () => {
    const ue = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <FilterChips label="Filter" items={items} defaultValue="all" onValueChange={onValueChange} />,
    );
    const archived = screen.getByRole('radio', { name: 'Archived, 0' });
    expect(archived).toBeDisabled();
    await ue.click(archived);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('other keys do not select', async () => {
    const onValueChange = vi.fn();
    render(
      <FilterChips label="Filter" items={items} value="all" onValueChange={onValueChange} />,
    );
    screen.getByRole('radio', { name: 'Sales, 1' }).focus();
    const ue = userEvent.setup();
    await ue.keyboard('a');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('applies size classes (sm vs md default)', () => {
    const { rerender } = render(<FilterChips label="Filter" items={items} defaultValue="all" />);
    expect(screen.getByRole('radio', { name: 'All, 7' }).className).toMatch(/\bh-8\b/);
    rerender(<FilterChips label="Filter" items={items} defaultValue="all" size="sm" />);
    expect(screen.getByRole('radio', { name: 'All, 7' }).className).toMatch(/\bh-7\b/);
  });

  it('forwards ref and className to the group root', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <FilterChips ref={ref} label="Filter" items={items} defaultValue="all" className="custom" />,
    );
    expect(ref.current).toBe(screen.getByRole('radiogroup'));
    expect(ref.current).toHaveClass('custom');
    expect(ref.current).toHaveClass('flex-wrap');
  });
});
