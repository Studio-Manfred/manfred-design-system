import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Indeterminate progress indicator drawn with an SVG arc. Three ' +
          'sizes (`sm` / `md` / `lg`) and a built-in `role="status"` plus ' +
          '`sr-only` label so it announces correctly to assistive tech. Use ' +
          'for short waits where progress can\'t be measured.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size scale — 16px / 24px / 40px.',
      table: { defaultValue: { summary: 'md' } },
    },
    label: {
      control: 'text',
      description: 'Visually-hidden label read by screen readers.',
      table: { defaultValue: { summary: 'Loading' } },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Playground: Story = {
  args: {
    size: 'md',
    label: 'Loading',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive sandbox — toggle size and screen-reader label via the ' +
          'Controls panel.',
      },
    },
  },
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three sizes side by side. `sm` for inline use (button labels), ' +
          '`md` (default) for inline blocks, `lg` for full-surface loading.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Spinner on the brand-blue surface. The arc inherits the brand ' +
          'colour token, so the contrast stays readable against the logo blue.',
      },
    },
  },
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
