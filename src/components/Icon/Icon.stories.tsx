import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import { iconPaths } from './iconPaths';
import type { IconName } from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  parameters: { layout: 'centered' },
  argTypes: {
    name: {
      control: 'select',
      options: Object.keys(iconPaths) as IconName[],
    },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const Playground: Story = {
  args: {
    name: 'check',
    size: 'md',
  },
};

export const Labelled: Story = {
  args: {
    name: 'check',
    size: 'md',
    label: 'Check mark',
  },
};

export const AllIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', maxWidth: '600px' }}>
      {(Object.keys(iconPaths) as IconName[]).map((name) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            width: '64px',
          }}
        >
          <Icon name={name} size="md" />
          <span
            style={{
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              fontFamily: 'var(--font-family-base)',
              lineHeight: '1.3',
            }}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Icon name="search" size={size} />
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
