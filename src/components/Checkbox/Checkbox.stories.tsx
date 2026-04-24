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
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
};

export const States: Story = {
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
};

export const ErrorState: Story = {
  render: () => (
    <Checkbox label="You must accept the terms to continue" error />
  ),
};

// Play: Tab to checkbox, Space to check, assert aria-checked, Space again to uncheck.
export const KeyboardInteraction: Story = {
  render: () => <Checkbox label="Subscribe to updates" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Subscribe to updates' });
    // Focus via Tab then toggle on with Space.
    checkbox.focus();
    await userEvent.keyboard('{Space}');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    // Space again — unchecks.
    await userEvent.keyboard('{Space}');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  },
};

export const Controlled: Story = {
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
