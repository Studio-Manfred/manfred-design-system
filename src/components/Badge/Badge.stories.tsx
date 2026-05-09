import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Small inline label — counts, statuses, tags, attribute markers. ' +
          'Six variants split into two groups: `neutral` and `brand` for ' +
          'generic labels; `success` / `warning` / `error` / `info` for ' +
          'status. Status variants prepend a visually hidden severity prefix ' +
          'so meaning is never carried by colour alone.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'brand', 'success', 'warning', 'error', 'info'],
      description:
        'Visual style. `neutral` / `brand` are generic; `success` / ' +
        '`warning` / `error` / `info` are status variants with sr-only ' +
        'severity prefix.',
      table: { defaultValue: { summary: 'neutral' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description:
        'Two scales. `sm` for tight spaces (counts, inline tags); `md` ' +
        '(default) for stand-alone labels.',
      table: { defaultValue: { summary: 'md' } },
    },
    children: {
      control: 'text',
      description: 'Badge label. Keep short — one or two words, or a count.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Playground: Story = {
  args: {
    variant: 'neutral',
    size: 'md',
    children: 'Badge',
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

export const AllVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All six variants in one row so generic and status colours are ' +
          'comparable. Status variants (`success`, `warning`, `error`, `info`) ' +
          'include a visually hidden severity prefix that screen readers ' +
          'announce.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="brand">Brand</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Both size scales — `sm` for dense layouts (chip rows, count ' +
          'pills) and `md` for stand-alone status labels.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Badge size="sm" variant="brand">Small</Badge>
      <Badge size="md" variant="brand">Medium</Badge>
    </div>
  ),
};

export const AsNotificationCount: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Realistic usage: notification counts and short status labels — the ' +
          'two most common badge shapes in product UIs. Counts use the `sm` ' +
          'scale to fit beside icons or in compact list rows.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Badge variant="error" size="sm">3</Badge>
      <Badge variant="error">12</Badge>
      <Badge variant="info">New</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
    </div>
  ),
};
