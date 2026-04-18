import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
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

export const ErrorState: Story = {
  render: () => (
    <Checkbox label="You must accept the terms to continue" error />
  ),
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
