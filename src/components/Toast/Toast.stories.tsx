import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toaster, toast } from './Toast';
import { Button } from '../Button';

const meta: Meta = {
  title: 'Components/Toast',
  parameters: { layout: 'centered' },
};

export default meta;

type Story = StoryObj;

export const Playground: Story = {
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
