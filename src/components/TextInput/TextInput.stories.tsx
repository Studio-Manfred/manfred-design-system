import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextInput } from './TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'Components/TextInput',
  component: TextInput,
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
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    status: { control: 'select', options: ['default', 'error', 'success'] },
  },
};

export default meta;

type Story = StoryObj<typeof TextInput>;

export const Playground: Story = {
  args: {
    size: 'md',
    status: 'default',
    placeholder: 'Enter text…',
  },
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '280px' }}>
      <TextInput placeholder="Search…" leadingIcon="search" />
      <TextInput placeholder="Email" leadingIcon="info" trailingIcon="check-circle" />
      <TextInput placeholder="Password" leadingIcon="eye-off" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '280px' }}>
      <TextInput placeholder="Default" status="default" />
      <TextInput placeholder="Error state" status="error" defaultValue="bad input" />
      <TextInput placeholder="Success state" status="success" defaultValue="valid input" />
      <TextInput placeholder="Disabled" disabled defaultValue="disabled" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '280px' }}>
      <TextInput placeholder="Small" size="sm" />
      <TextInput placeholder="Medium" size="md" />
      <TextInput placeholder="Large" size="lg" />
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div style={{ width: '400px' }}>
      <TextInput placeholder="Full width input" fullWidth />
    </div>
  ),
};
