import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Boolean toggle built on `@radix-ui/react-switch`. Three sizes, an ' +
          'optional inline `label`, plus `loading` and `error` states for ' +
          'async saves and form validation. Click-on-label works whenever the ' +
          'control is given an `id`.',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'inline-radio' },
      options: ['sm', 'md', 'lg'],
      description: 'Track + thumb scale.',
      table: { defaultValue: { summary: 'md' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable interaction. Inherited from Radix `Switch.Root`.',
    },
    loading: {
      control: 'boolean',
      description: 'Replace thumb with a spinner; sets `aria-busy` and disables interaction.',
    },
    error: {
      control: 'boolean',
      description: 'Sets `aria-invalid` and gives the track a red border.',
    },
    label: {
      control: 'text',
      description: 'Optional inline label rendered to the right.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: { 'aria-label': 'Toggle setting' },
  parameters: {
    docs: {
      description: {
        story:
          'Bare switch with an `aria-label` — use when the surrounding row ' +
          'already labels the control visually.',
      },
    },
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Enable notifications',
    id: 'notifications',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Switch with an inline label. The component wraps both elements in ' +
          'a `<label htmlFor>` so clicking the text toggles the switch.',
      },
    },
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All three size scales. Use `sm` in dense lists, `md` (default) ' +
          'in standard forms, `lg` in marketing settings.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Switch size="sm" label="Small" id="sw-sm" />
      <Switch size="md" label="Medium (default)" id="sw-md" defaultChecked />
      <Switch size="lg" label="Large" id="sw-lg" defaultChecked />
    </div>
  ),
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every visible state — unchecked, checked, disabled (off / on), ' +
          'loading, and error. Useful for token / dark-mode review.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Fully controlled switch — the parent owns `checked` and reacts to ' +
          '`onCheckedChange`. The label updates with the boolean state.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Settings form pattern — a labelled row with description per switch. ' +
          'Each switch is independently controlled.',
      },
    },
  },
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
          background: 'var(--popover)',
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
