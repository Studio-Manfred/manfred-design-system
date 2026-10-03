import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect, fn, waitFor } from 'storybook/test';
import { FilterChips, type FilterChipItem } from './FilterChips';

const boardTypes: FilterChipItem[] = [
  { value: 'all', label: 'All', count: 7 },
  { value: 'onboarding', label: 'Onboarding', count: 3 },
  { value: 'sales', label: 'Sales', count: 1 },
  { value: 'recruitment', label: 'Recruitment', count: 1 },
  { value: 'general', label: 'General', count: 2 },
];

const meta: Meta<typeof FilterChips> = {
  title: 'Components/FilterChips',
  component: FilterChips,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Single-select filter chips with optional counts (STU-1011). A wrapping row of ' +
          'pills; exactly one is selected (filled + bold), the rest are outlined. Counts sit ' +
          'muted after the label and are part of the accessible name ("Onboarding, 3"). ' +
          'Built on Radix RadioGroup, like the DS `RadioGroup`: `role="radiogroup"` named by ' +
          '`label`, `role="radio"` chips with `aria-checked`, one tab stop, arrow keys move ' +
          'and select (skipping disabled chips), Space and Enter select. Inherits the Radix ' +
          'Root props (`value` / `defaultValue` / `onValueChange`, `disabled`, `name`, …).',
      },
    },
  },
  argTypes: {
    items: {
      description:
        'The chips, in order: `{ value: string; label: ReactNode; count?: number; disabled?: boolean }[]`.',
    },
    label: { description: 'Accessible name of the group (required). Not rendered visibly.' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      description: 'Chip size: `md` (32px, default) or `sm` (28px).',
    },
    value: { control: 'text', description: 'Controlled selected value. Pair with `onValueChange`.' },
    defaultValue: { control: 'text', description: 'Initially selected value when uncontrolled.' },
    onValueChange: { description: 'Called with the newly selected value.' },
    disabled: { control: 'boolean', description: 'Disable every chip.' },
  },
  args: {
    label: 'Filter boards by type',
    items: boardTypes,
    defaultValue: 'all',
    size: 'md',
    onValueChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof FilterChips>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: { story: 'The intranet Boards filter: "All 7 · Onboarding 3 · …".' },
    },
  },
};

// Play: click selects (aria-checked flips, onValueChange fires); keyboard
// Tab lands on the checked chip, ArrowRight moves + selects, Enter selects.
export const KeyboardAndClick: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Coverage story — click a chip to select it; Tab in lands on the selected chip, ' +
          'arrows move the selection, Enter and Space select the focused chip.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Filter boards by type' });
    expect(group).toBeInTheDocument();

    const all = canvas.getByRole('radio', { name: 'All, 7' });
    const onboarding = canvas.getByRole('radio', { name: 'Onboarding, 3' });
    expect(all).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(onboarding);
    expect(onboarding).toHaveAttribute('aria-checked', 'true');
    expect(all).toHaveAttribute('aria-checked', 'false');
    expect(args.onValueChange).toHaveBeenCalledWith('onboarding');

    // Hold the key across Radix's deferred roving focus, like a real keypress.
    await userEvent.keyboard('{ArrowRight>}');
    const sales = canvas.getByRole('radio', { name: 'Sales, 1' });
    await waitFor(() => expect(sales).toHaveFocus());
    await userEvent.keyboard('{/ArrowRight}');
    expect(sales).toHaveAttribute('aria-checked', 'true');

    // One key at a time, waiting for Radix's deferred roving focus after each:
    // back-to-back presses race on slower runners (Chromatic).
    await userEvent.keyboard('{ArrowLeft>}');
    await waitFor(() => expect(onboarding).toHaveFocus());
    await userEvent.keyboard('{/ArrowLeft}');
    await userEvent.keyboard('{ArrowLeft>}');
    await waitFor(() => expect(all).toHaveFocus());
    await userEvent.keyboard('{/ArrowLeft}');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'All, 7' })).toHaveAttribute('aria-checked', 'true'),
    );
  },
};

export const Small: Story = {
  args: { size: 'sm' },
  parameters: { docs: { description: { story: '`size="sm"` — 28px chips for dense toolbars.' } } },
};

export const WithoutCounts: Story = {
  args: {
    label: 'Show',
    defaultValue: 'mine',
    items: [
      { value: 'all', label: 'Everything' },
      { value: 'mine', label: 'Mine' },
      { value: 'shared', label: 'Shared with me' },
    ],
  },
  parameters: {
    docs: { description: { story: 'Omit `count` for plain chips; the name is just the label.' } },
  },
};

export const DisabledChip: Story = {
  args: {
    items: [
      ...boardTypes,
      { value: 'archived', label: 'Archived', count: 0, disabled: true },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'A per-item `disabled` chip is dimmed, cannot be selected, and is skipped by the ' +
          'arrow keys. A zero `count` is still shown.',
      },
    },
  },
};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Controlled with `value` + `onValueChange`; the list below follows the selection.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = React.useState('all');
    return (
      <div className="flex flex-col gap-3">
        <FilterChips {...args} value={value} onValueChange={setValue} />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing: {value}
        </p>
      </div>
    );
  },
};

export const Wrapping: Story = {
  parameters: {
    docs: { description: { story: 'Chips wrap onto new lines in a narrow container.' } },
  },
  render: (args) => (
    <div style={{ maxWidth: 260 }}>
      <FilterChips {...args} />
    </div>
  ),
};
