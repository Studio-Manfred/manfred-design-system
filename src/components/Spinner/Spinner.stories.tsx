import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Playground: Story = {
  args: {
    size: 'md',
    label: 'Loading',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Spinner size={size} />
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-family-base)',
            }}
          >
            {size}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const OnDarkBackground: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '32px',
        alignItems: 'center',
        padding: '32px',
        borderRadius: '12px',
        background: 'var(--color-brand-logo-blue)',
        color: 'var(--color-brand-logo-paper)',
      }}
    >
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};
