import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    // Global preview disables 'region' because isolated stories aren't pages.
    // Re-enable here so axe reports landmark violations on this interactive component.
    a11y: {
      config: {
        rules: [
          { id: 'region', enabled: true },
        ],
      },
    },
    docs: {
      description: {
        component:
          'Accessible checkbox built on `@radix-ui/react-checkbox`. ' +
          'Supports checked, unchecked, and indeterminate states with an ' +
          'optional inline `label`, plus an `error` flag that flips the ' +
          'border to the error token and sets `aria-invalid="true"`. ' +
          'Radix wires up `Space`, click, and `aria-checked` for you.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description:
        'Visible label rendered next to the box. Wraps the control in a `<label>` so clicking text toggles.',
    },
    checked: {
      control: 'boolean',
      description:
        'Controlled checked state. Use with `onCheckedChange`. Omit for uncontrolled with `defaultChecked`.',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial checked state for the uncontrolled mode.',
    },
    indeterminate: {
      control: 'boolean',
      description:
        'Render the mixed state. Overrides `checked` visually; useful for parent "select all" rows.',
      table: { defaultValue: { summary: 'false' } },
    },
    error: {
      control: 'boolean',
      description: 'Flag invalid input — sets `aria-invalid="true"` and shifts the border to the error token.',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable interaction. Renders at 50% opacity with `cursor-not-allowed`.',
    },
    required: {
      control: 'boolean',
      description: 'Mark the box required for native form validation.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive sandbox — toggle every prop via the Controls panel below.',
      },
    },
  },
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every state side by side — unchecked, checked, indeterminate, and ' +
          'their disabled counterparts. Confirms the visual treatment for each ' +
          '`data-state` Radix can emit.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled unchecked" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
    </div>
  ),
};

export const WithLabel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Real-world labels in a form-style stack. The `<label>` wrapper means ' +
          'clicking either the box or the text toggles the state.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Checkbox label="Subscribe to newsletter" defaultChecked />
      <Checkbox label="Remember me on this device" />
      <Checkbox label="Agree to privacy policy" />
    </div>
  ),
};

export const Standalone: Story = {
  args: { 'aria-label': 'Accept terms' },
  parameters: {
    docs: {
      description: {
        story:
          'Box without a visible label — pass `aria-label` (or wire up an external ' +
          '`<label htmlFor>`) so screen readers still announce the control.',
      },
    },
  },
};

export const ErrorState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Failure state — `error` border colour plus `aria-invalid="true"`. ' +
          'In production wrap in a `FormField` so the failure also has a visible message.',
      },
    },
  },
  render: () => (
    <Checkbox label="You must accept the terms to continue" error />
  ),
};

// Play: Tab to checkbox, Space to check, assert aria-checked, Space again to uncheck.
export const KeyboardInteraction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Keyboard regression — tab to focus, `Space` to toggle, `Space` again to ' +
          'untoggle. Confirms Radix maps the key to the same handler as a click.',
      },
    },
  },
  render: () => <Checkbox label="Subscribe to updates" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Subscribe to updates' });

    // Pointer click toggles checked — guards against onCheckedChange
    // wiring regressing under Radix's button-with-aria-checked pattern.
    await userEvent.click(checkbox);
    await canvas.findByRole('checkbox', { name: 'Subscribe to updates', checked: true });
    await userEvent.click(checkbox);
    await canvas.findByRole('checkbox', { name: 'Subscribe to updates', checked: false });

    // Keyboard parity — focus the checkbox and toggle via Space.
    // Use direct focus() here: tab() from a post-click state lands on the
    // next focusable rather than the checkbox we just clicked. The intent
    // is "checkbox is keyboard-toggleable when focused", which focus() +
    // toHaveFocus expresses precisely.
    checkbox.focus();
    expect(checkbox).toHaveFocus();
    // Space on a focused role=checkbox button fires the native click; Radix
    // toggles on click. Raw ' ' is the user-event keymap entry — '{Space}'
    // isn't a reserved descriptor and gets treated as a literal. findByRole
    // with { checked } waits for Radix to propagate the state update.
    await userEvent.keyboard(' ');
    await canvas.findByRole('checkbox', { name: 'Subscribe to updates', checked: true });
    await userEvent.keyboard(' ');
    await canvas.findByRole('checkbox', { name: 'Subscribe to updates', checked: false });
  },
};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Controlled mode — parent owns `checked` and updates via `onCheckedChange`. ' +
          'The label text mirrors the state to make the wiring visible.',
      },
    },
  },
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
        <Checkbox
          label={checked ? 'Checked' : 'Unchecked'}
          checked={checked}
          onCheckedChange={(state) => setChecked(state === true)}
        />
        <span
          style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-base)',
          }}
        >
          State: {checked ? 'true' : 'false'}
        </span>
      </div>
    );
  },
};
