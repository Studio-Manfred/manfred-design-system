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
    docs: {
      description: {
        component:
          'Date input with a popover calendar. Built on `@radix-ui/react-popover` ' +
          'for the trigger/popover plumbing and `react-day-picker` v9 for the ' +
          'grid + keyboard model. Two modes — `single` (default) for a ' +
          'single date and `range` for a `{ from, to }` window. Trigger ' +
          'styling matches `TextInput` via `inputLikeVariants` so it sits ' +
          'cleanly inside a `FormField`. `minDate` / `maxDate` constrain the ' +
          'window; pass a `date-fns` `locale` to localise month names. In ' +
          'range mode `name` serializes to two hidden inputs, suffixed ' +
          '`_from` and `_to` (see the README).',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'range'],
      description: '`single` (default) picks one date; `range` picks `{ from, to }` across two clicks.',
      table: { defaultValue: { summary: 'single' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Trigger height — `sm` = 32px, `md` = 40px (default), `lg` = 48px.',
      table: { defaultValue: { summary: 'md' } },
    },
    status: {
      control: 'select',
      options: ['default', 'error', 'success'],
      description: '`error` flips the trigger border to the error token and sets `aria-invalid="true"`.',
      table: { defaultValue: { summary: 'default' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch the trigger to fill its container — useful inside `FormField` columns.',
      table: { defaultValue: { summary: 'false' } },
    },
    minDate: {
      control: 'date',
      description: 'Earliest selectable date (inclusive). Days before are disabled.',
    },
    maxDate: {
      control: 'date',
      description: 'Latest selectable date (inclusive). Days after are disabled.',
    },
    clearable: {
      control: 'boolean',
      description: 'Show a "Clear" button in the popover footer when a value is set.',
      table: { defaultValue: { summary: 'true' } },
    },
    showTodayButton: {
      control: 'boolean',
      description: 'Show a "Today" button that jumps the calendar caption to the current month.',
      table: { defaultValue: { summary: 'true' } },
    },
    placeholder: {
      control: 'text',
      description: 'Trigger text shown when no date is selected.',
    },
    name: {
      control: 'text',
      description:
        'Hidden-input name. In range mode, expands to `${name}_from` and `${name}_to`.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable interaction and dim the trigger.',
    },
    required: {
      control: 'boolean',
      description: 'Mark required for native form validation + `aria-required`.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Interactive sandbox — the parent owns `value` and updates via ' +
          '`onValueChange`. Toggle props in the Controls panel below.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<Date | undefined>();
    return <DatePicker value={value} onValueChange={setValue} />;
  },
};

export const WithValue: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Controlled with a pre-selected date so the trigger renders the ' +
          'localised default format and the popover opens centred on that month.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<Date | undefined>(new Date(2026, 3, 15));
    return <DatePicker value={value} onValueChange={setValue} />;
  },
};

export const WithConstraints: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Constrain selectable dates to a window with `minDate` / `maxDate`. ' +
          'Days outside the range render disabled and are unreachable by ' +
          'keyboard — the rdp roving-tabindex skips them.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Standard form pattern — `FormField` owns the label and required ' +
          'asterisk, `DatePicker` is the input. `htmlFor` matches the ' +
          'trigger `id` so the label-click target is the trigger button.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Failure state in a `FormField` — `status="error"` flips the trigger ' +
          'border, sets `aria-invalid="true"`, and the field message ' +
          'announces via `role="alert"`.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Range mode, fully argTypes-driven. Two-click selection — first ' +
          'click sets `from`, second click sets `to`. Trigger renders ' +
          '"from – to" once both are picked.',
      },
    },
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
  parameters: {
    docs: {
      description: {
        story:
          'Range mode with `minDate` / `maxDate` and a pre-filled ' +
          '`defaultValue`. Useful for booking flows where availability ' +
          'is known up front.',
      },
    },
  },
  render: (args) => (
    <div className="w-80">
      <DatePicker {...(args as DatePickerRangeProps)} />
    </div>
  ),
};

export const RangeInFormField: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Range mode inside a real `<form>` — `name="stay"` serialises to ' +
          'two hidden inputs: `stay_from` and `stay_to`. The submit handler ' +
          'reads them via `FormData` and alerts the result.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Verifies the partial-range UX — after the first click the popover ' +
          'stays open and the trigger renders a "from – …" placeholder until ' +
          'the user picks the second date.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Keyboard regression for single mode — tab to trigger, `ArrowDown` ' +
          'opens the popover (Radix combobox idiom), `Escape` closes it ' +
          'without committing a selection.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Keyboard regression for range mode — `ArrowDown` opens, arrow keys ' +
          'navigate within the calendar, first `Enter` commits `from` and ' +
          'keeps the popover open (partial state), second `Enter` commits ' +
          '`to` and closes.',
      },
    },
  },
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
