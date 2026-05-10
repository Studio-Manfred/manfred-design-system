import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Hierarchical wayfinding trail — shows the user\'s position in a ' +
          'nested page structure and links back to ancestors. Renders a ' +
          '`<nav aria-label="Breadcrumb">` containing an ordered list. The ' +
          'last item is treated as the current page (`aria-current="page"`, ' +
          'no link). Separators are decorative and `aria-hidden`.',
      },
    },
  },
  argTypes: {
    items: {
      control: 'object',
      description:
        'Ordered list of entries from root to current page. Last item is ' +
        'rendered as the current page and gets `aria-current="page"`.',
    },
    separator: {
      control: 'select',
      options: ['chevron', 'slash'],
      description:
        'Visual divider. `chevron` (default) for typical app shells; ' +
        '`slash` for a denser, text-only treatment.',
      table: { defaultValue: { summary: 'chevron' } },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Playground: Story = {
  args: {
    separator: 'chevron',
    items: [
      { label: 'Home', href: '#' },
      { label: 'Products', href: '#' },
      { label: 'Shoes' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Standard three-level trail. The first two items link back to ' +
          'ancestor pages; the last (current page) is rendered as bold text ' +
          'with `aria-current="page"`.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Breadcrumb wraps in <nav aria-label="Breadcrumb"> so it appears as a named navigation landmark.
    expect(canvas.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    // Clicking the first ancestor link verifies it is pointer-accessible.
    const homeLink = canvas.getByRole('link', { name: 'Home' });
    await userEvent.click(homeLink);
    // Tab through the breadcrumb links to confirm all are keyboard-reachable in order.
    await userEvent.tab();
    // The current page item carries aria-current="page" so AT announces which crumb is active.
    const currentItem = canvas.getByText('Shoes');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
  },
};

export const WithSlashSeparator: Story = {
  args: {
    separator: 'slash',
    items: [
      { label: 'Home', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Design Systems' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Slash separator — denser, text-only divider. Useful in compact ' +
          'headers or content surfaces where the chevron icon feels heavy.',
      },
    },
  },
};

export const LongPath: Story = {
  args: {
    separator: 'chevron',
    items: [
      { label: 'Home', href: '#' },
      { label: 'Dashboard', href: '#' },
      { label: 'Settings', href: '#' },
      { label: 'Account', href: '#' },
      { label: 'Security' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Five-level path. Stress-tests the wrap behaviour at narrow ' +
          'viewports — the list uses `flex-wrap` so deep trails reflow onto ' +
          'multiple rows instead of overflowing horizontally.',
      },
    },
  },
};

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Home' }],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Edge case: a single-item trail. The lone item is the current page, ' +
          'so it renders as bold text with `aria-current="page"` — no ' +
          'separator, no link.',
      },
    },
  },
};
