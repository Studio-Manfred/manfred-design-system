import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './Select';

function Uncontrolled({ defaultValue }: { defaultValue?: string }) {
  return (
    <Select defaultValue={defaultValue}>
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry" disabled>
          Cherry
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function Controlled({ onValueChange }: { onValueChange: (v: string) => void }) {
  const [value, setValue] = React.useState<string>('');
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onValueChange(v);
      }}
    >
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe('Select', () => {
  it('renders the trigger with placeholder when no value', () => {
    render(<Uncontrolled />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Pick a fruit');
    expect(trigger).toHaveAttribute('data-placeholder');
  });

  it('opens the popover on trigger click and shows items', async () => {
    const user = userEvent.setup();
    render(<Uncontrolled />);
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    expect(await screen.findByRole('option', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
  });

  it('selecting an item updates the value (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<Uncontrolled />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Banana' }));
    expect(trigger).toHaveTextContent('Banana');
  });

  it('controlled value flows through onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Controlled onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Apple' }));
    expect(onValueChange).toHaveBeenCalledWith('apple');
    expect(trigger).toHaveTextContent('Apple');
  });

  it('disabled item is not selectable', async () => {
    const user = userEvent.setup();
    render(<Uncontrolled />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(trigger);
    const cherry = await screen.findByRole('option', { name: 'Cherry' });
    expect(cherry).toHaveAttribute('data-disabled');
    // Clicking a disabled item must not change the trigger value.
    await user.click(cherry);
    expect(trigger).toHaveTextContent('Pick a fruit');
  });

  it('keyboard navigation: ArrowDown highlights and Enter selects', async () => {
    const user = userEvent.setup();
    render(<Uncontrolled />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    trigger.focus();
    // Open via keyboard.
    await user.keyboard('{ArrowDown}');
    // First item gets focus when the listbox opens.
    await screen.findByRole('option', { name: 'Apple' });
    await user.keyboard('{Enter}');
    expect(trigger).toHaveTextContent('Apple');
  });

  it('Escape closes the popover without selecting', async () => {
    const user = userEvent.setup();
    render(<Uncontrolled />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(trigger);
    await screen.findByRole('option', { name: 'Apple' });
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('option', { name: 'Apple' })).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent('Pick a fruit');
  });

  it('status="error" applies error visuals and aria-invalid', () => {
    render(
      <Select>
        <SelectTrigger aria-label="Fruit" status="error">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    expect(trigger).toHaveAttribute('data-status', 'error');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards id and aria-describedby to the trigger', () => {
    render(
      <Select>
        <SelectTrigger aria-label="Fruit" id="fruit" aria-describedby="fruit-help">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    expect(trigger).toHaveAttribute('id', 'fruit');
    expect(trigger).toHaveAttribute('aria-describedby', 'fruit-help');
  });

  it('leading icon is decorative and hidden from assistive tech', () => {
    const { container } = render(
      <Select>
        <SelectTrigger aria-label="Fruit" leadingIcon="search">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    const decorativeWrappers = container.querySelectorAll('[aria-hidden="true"]');
    // The leading-icon span and the chevron span both opt out of AT.
    expect(decorativeWrappers.length).toBeGreaterThanOrEqual(2);
  });

  it('type-ahead jumps to a matching item by first letter', async () => {
    const user = userEvent.setup();
    render(<Uncontrolled />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('option', { name: 'Apple' });
    // Type 'b' to jump to Banana, then commit with Enter.
    await user.keyboard('b');
    await user.keyboard('{Enter}');
    expect(trigger).toHaveTextContent('Banana');
  });
});
