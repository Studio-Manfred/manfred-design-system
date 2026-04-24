import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { useState } from 'react';
import { DatePicker, type DatePickerRangeProps } from './DatePicker';
import { FormField } from '../FormField';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
    // Global preview disables 'region' because isolated stories aren't pages.
    // Re-enable here so axe reports landmark violations on this interactive component.
    a11y: {
      config: {
        rules: [
          { id: 'region', enabled: true },
          // react-day-picker portals its focus guards and aria-controls target
          // outside the scanned subtree — same pattern the Dialog stories hit.
          // Disabled with justification to keep the a11y panel actionable.
          { id: 'aria-valid-attr-value', enabled: false },
          { id: 'aria-hidden-focus', enabled: false },
        ],
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Playground: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return <DatePicker value={value} onValueChange={setValue} />;
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>(new Date(2026, 3, 15));
    return <DatePicker value={value} onValueChange={setValue} />;
  },
};

export const WithConstraints: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return (
      <DatePicker
        value={value}
        onValueChange={setValue}
        minDate={new Date(2026, 3, 1)}
        maxDate={new Date(2026, 3, 30)}
        placeholder="April 2026 only"
      />
    );
  },
};

export const InFormField: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return (
      <FormField label="Date of birth" htmlFor="dob" required>
        <DatePicker id="dob" value={value} onValueChange={setValue} required />
      </FormField>
    );
  },
};

export const ErrorState: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return (
      <FormField label="Delivery date" htmlFor="delivery" status="error" message="Please pick a date">
        <DatePicker id="delivery" value={value} onValueChange={setValue} status="error" />
      </FormField>
    );
  },
};

export const RangePlayground: Story = {
  args: {
    mode: 'range',
    size: 'md',
    status: 'default',
    fullWidth: false,
    disabled: false,
    clearable: true,
    showTodayButton: true,
  },
  render: (args) => (
    <div className="w-80">
      <DatePicker {...(args as DatePickerRangeProps)} />
    </div>
  ),
};

export const RangeWithConstraints: Story = {
  args: {
    mode: 'range',
    minDate: new Date('2026-04-05'),
    maxDate: new Date('2026-04-25'),
    defaultValue: { from: new Date('2026-04-10'), to: new Date('2026-04-15') },
  },
  render: (args) => (
    <div className="w-80">
      <DatePicker {...(args as DatePickerRangeProps)} />
    </div>
  ),
};

export const RangeInFormField: Story = {
  render: () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        alert(
          JSON.stringify({ from: data.get('stay_from'), to: data.get('stay_to') }),
        );
      }}
      className="flex flex-col gap-3 w-80"
    >
      <FormField label="Stay" htmlFor="stay">
        <DatePicker id="stay" mode="range" name="stay" />
      </FormField>
      <button
        type="submit"
        className="mt-2 self-start rounded border border-[var(--color-border-strong)] px-3 py-1 text-sm"
      >
        Submit
      </button>
    </form>
  ),
};

export const RangePartialState: Story = {
  args: { mode: 'range' },
  render: (args) => (
    <div className="w-80">
      <DatePicker {...(args as DatePickerRangeProps)} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);
    // Popover renders in a Portal — query document.body rather than canvasElement.
    const popover = within(document.body);
    // rdp day buttons carry a locale-aware aria-label containing a month name.
    // Multiple days match, so grab the first enabled one.
    const dayButtons = await popover.findAllByRole('button', {
      name: /\b\d+\s+(april|maj|mars|februari|januari|juni|juli|augusti|september|oktober|november|december|january|february|march|may|june|july|august|october)\b/i,
    });
    const firstEnabled = dayButtons.find((b) => !(b as HTMLButtonElement).disabled);
    if (!firstEnabled) throw new Error('No enabled day button found in popover');
    await userEvent.click(firstEnabled);
    // Popover stays open — first-click-on-empty becomes partial.
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Trigger shows a partial range (contains `…`).
    expect(trigger).toHaveTextContent(/…/);
  },
};

// Play: Tab to trigger, ArrowDown to open, Escape to close.
export const KeyboardInteraction: Story = {
  render: () => {
    const [value, setValue] = useState<Date | undefined>(new Date(2026, 3, 15));
    return <DatePicker value={value} onValueChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    // Tab focuses the trigger (only focusable in this render).
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    // ArrowDown opens the popover.
    await userEvent.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // findByRole waits for the portal to mount in document.body.
    await within(document.body).findByRole('dialog');
    // Escape closes without selecting.
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const RangeKeyboardInteraction: Story = {
  args: { mode: 'range' },
  render: (args) => (
    <div className="w-80">
      <DatePicker {...(args as DatePickerRangeProps)} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    trigger.focus();
    // ArrowDown opens popover and focuses first enabled day.
    await userEvent.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Navigate and commit `from`.
    await userEvent.keyboard('{ArrowRight}{Enter}');
    // Partial commits keep popover open. If the close actually fires here,
    // it means rdp's keyboard path hit a same-day single-commit — that's a
    // different code path. Flag it if we hit that.
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Navigate a few days right, commit `to`.
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
