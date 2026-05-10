import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toaster, toast } from './Toast';
import { Button } from '../Button';

const meta: Meta = {
  title: 'Components/Toast',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Toast notifications wrapping `sonner`. Mount one `<Toaster />` ' +
          'near the app root, then fire toasts imperatively from anywhere ' +
          'using the `toast(...)` helper (`.success` / `.error` / `.warning` ' +
          '/ `.info` / `.promise` / `.dismiss`). The Toaster component ' +
          'pre-applies token-driven classes for the four intents. Sonner ' +
          'announces each toast via an `aria-live` region.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default neutral toast fired from a button click — demonstrates the ' +
          '`toast(message, options)` signature with description and duration.',
      },
    },
  },
  render: () => (
    <>
      <Button
        variant="brand"
        onClick={() =>
          toast('This is a toast notification!', {
            description: 'Powered by sonner',
            duration: 4000,
          })
        }
      >
        Show Toast
      </Button>
      <Toaster />
    </>
  ),
};

export const AllVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All four intent variants — `info` / `success` / `warning` / `error` ' +
          '— each picking up its own feedback colour token from the design ' +
          'system.',
      },
    },
  },
  render: () => (
    <>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button onClick={() => toast.info('Informational toast.', { description: 'Info' })}>
          Info
        </Button>
        <Button onClick={() => toast.success('Action completed!', { description: 'Success' })}>
          Success
        </Button>
        <Button onClick={() => toast.warning('Please review.', { description: 'Warning' })}>
          Warning
        </Button>
        <Button onClick={() => toast.error('Something failed.', { description: 'Error' })}>
          Error
        </Button>
      </div>
      <Toaster />
    </>
  ),
};

export const WithAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Toast with an inline action button (typical undo pattern). The ' +
          'action callback can fire follow-up toasts.',
      },
    },
  },
  render: () => (
    <>
      <Button
        onClick={() =>
          toast('Item archived', {
            description: 'It was moved to your archive.',
            action: {
              label: 'Undo',
              onClick: () => toast.success('Restored!'),
            },
          })
        }
      >
        Archive with undo
      </Button>
      <Toaster />
    </>
  ),
};

export const Persistent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`duration: Infinity` keeps the toast onscreen until the user ' +
          'dismisses it. Reserve for blocking errors that demand action.',
      },
    },
  },
  render: () => (
    <>
      <Button
        onClick={() =>
          toast.error('Persistent error — dismiss manually.', {
            duration: Infinity,
          })
        }
      >
        Show persistent
      </Button>
      <Toaster />
    </>
  ),
};
