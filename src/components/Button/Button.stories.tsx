import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Primary call-to-action button. Six visual variants ' +
          '(`primary` / `brand` / `destructive` / `outline` / `ghost` / ' +
          '`inverse`), three sizes, optional loading state, and `asChild` to ' +
          'render the button as a different element (e.g. an `<a>`) while ' +
          'keeping the visual treatment. Built on a `cva` variant system ' +
          'bound to design tokens — flips with theme automatically.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'brand', 'destructive', 'outline', 'ghost', 'inverse'],
      description:
        'Visual style. `primary` is the default neutral button; `brand` is the ' +
        'high-contrast CTA used sparingly; `destructive` signals delete / ' +
        'remove / cancel-with-consequence actions; `outline` and `ghost` are ' +
        'quieter; `inverse` is for use on the brand-blue background.',
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description:
        'Button height + padding scale. `sm` = 32px, `md` = 40px (default), ' +
        '`lg` = 48px.',
      table: { defaultValue: { summary: 'md' } },
    },
    fullWidth: {
      control: 'boolean',
      description:
        'Stretch the button to fill the available container width — useful in ' +
        'forms and dialog footers.',
      table: { defaultValue: { summary: 'false' } },
    },
    asChild: {
      control: 'boolean',
      description:
        'Render the button as the child element using Radix `Slot` instead of ' +
        'a native `<button>`. Useful for `<a>` styled as a button.',
      table: { defaultValue: { summary: 'false' } },
    },
    isLoading: {
      control: 'boolean',
      description:
        'Show a loading state — disables interaction and sets `aria-busy="true"`. ' +
        'The caller renders any spinner or label change inside `children`.',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description:
        'Disable interaction. Inherited from native `<button>`. Disabled buttons ' +
        'show a 40% opacity treatment and `cursor-not-allowed`.',
    },
    children: {
      control: 'text',
      description: 'Button label or content. Required.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Click me',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive sandbox — toggle every prop via the Controls panel below.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: 'Click me' });
    // Button must be present and labelled before interaction is meaningful.
    expect(btn).toBeInTheDocument();
    // Click verifies the button accepts pointer events without throwing.
    await userEvent.click(btn);
    // Button stays in the DOM after click — basic stability check.
    expect(btn).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every visual variant side by side. The bottom row sits on the ' +
          'brand-blue background so the `inverse` variant has somewhere to live.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="primary">Primary</Button>
        <Button variant="brand">Brand</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          padding: '32px',
          borderRadius: '12px',
          background: 'var(--color-brand-logo-blue)',
        }}
      >
        <Button variant="inverse">Inverse</Button>
        <Button variant="inverse">Get in touch</Button>
      </div>
    </div>
  ),
};

export const Destructive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Destructive action variant. Routes through the `--destructive` / ' +
          '`--destructive-foreground` shadcn-contract tokens, so dark-mode ' +
          'rebinding is automatic. Use for delete / remove / ' +
          'cancel-with-consequence actions — pair with a confirmation flow ' +
          '(`Dialog`) rather than firing the destructive action on first click.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="destructive">Delete</Button>
      <Button variant="destructive" disabled>
        Delete
      </Button>
      <Button variant="destructive" size="sm">
        Remove
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [primaryDelete] = canvas.getAllByRole('button', { name: 'Delete' });
    // Variant is reachable and labelled — the bare minimum AllVariants
    // doesn't enforce per-button. Spot-check that the destructive bg
    // utility actually compiled, locking the token plumbing in CI.
    expect(primaryDelete).toBeInTheDocument();
    expect(primaryDelete.className).toContain('bg-destructive');
  },
};

export const AllSizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three size scales — `sm` (32px) for dense UIs, `md` (40px, default) ' +
          'for most cases, `lg` (48px) for prominent CTAs.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default, disabled, and loading states. `isLoading` disables ' +
          'interaction and announces `aria-busy="true"` to assistive tech; the ' +
          'caller is responsible for any spinner or label change inside `children`.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
      <Button isLoading>Loading…</Button>
    </div>
  ),
};

export const FullWidth: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Stretch the button to fill the available width. Useful for form ' +
          'submit buttons and dialog footers where the button should occupy ' +
          'the full content column.',
      },
    },
  },
  render: () => (
    <div style={{ width: '320px' }}>
      <Button fullWidth>Full Width Button</Button>
    </div>
  ),
};

export const AsChild: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Render the button as a styled link by passing `asChild` and an `<a>` ' +
          'child. ARIA + focus styles still apply. The child must accept ' +
          '`className` and `ref` (Radix `Slot` requirement).',
      },
    },
  },
  render: () => (
    <Button asChild>
      <a href="#top">Link styled as button</a>
    </Button>
  ),
};
