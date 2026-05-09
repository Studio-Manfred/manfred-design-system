import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: { type: 'inline-radio' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    error: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: { 'aria-label': 'Toggle setting' },
};

export const WithLabel: Story = {
  args: {
    label: 'Enable notifications',
    id: 'notifications',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Switch size="sm" label="Small" id="sw-sm" />
      <Switch size="md" label="Medium (default)" id="sw-md" defaultChecked />
      <Switch size="lg" label="Large" id="sw-lg" defaultChecked />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Switch label="Unchecked" id="state-unchecked" />
      <Switch label="Checked" id="state-checked" defaultChecked />
      <Switch label="Disabled, off" id="state-disabled-off" disabled />
      <Switch label="Disabled, on" id="state-disabled-on" disabled defaultChecked />
      <Switch label="Loading" id="state-loading" loading />
      <Switch label="Error" id="state-error" error />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [on, setOn] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
        <Switch
          id="controlled"
          label={on ? 'Notifications on' : 'Notifications off'}
          checked={on}
          onCheckedChange={setOn}
        />
        <span
          style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-base)',
          }}
        >
          State: {on ? 'true' : 'false'}
        </span>
      </div>
    );
  },
};

export const InForm: Story = {
  render: () => {
    const [marketing, setMarketing] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          minWidth: '320px',
          padding: '20px',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-bg-surface)',
        }}
      >
        <SettingRow
          title="Marketing emails"
          description="Receive product news and tips."
          control={
            <Switch
              id="marketing"
              aria-label="Marketing emails"
              checked={marketing}
              onCheckedChange={setMarketing}
            />
          }
        />
        <SettingRow
          title="Two-factor authentication"
          description="Require a code when signing in from a new device."
          control={
            <Switch
              id="2fa"
              aria-label="Two-factor authentication"
              checked={twoFactor}
              onCheckedChange={setTwoFactor}
            />
          }
        />
      </div>
    );
  },
};

function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontFamily: 'var(--font-family-base)', fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {title}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)' }}>
          {description}
        </span>
      </div>
      {control}
    </div>
  );
}
