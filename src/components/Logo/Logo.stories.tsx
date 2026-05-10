import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import { Logo } from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Foundation/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Manfred brand mark — wordmark or monogram, rendered as inline SVG. ' +
          'Colours are brand-literal tokens that intentionally **do not** rebind ' +
          'under dark mode (`--color-brand-logo-blue` / `-ink` / `-paper`). ' +
          'Pick the right `color` for the surface manually rather than expecting ' +
          'theme to flip it. Wrapped in a `role="img"` span so assistive tech ' +
          'announces it as one image.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['wordmark', 'monogram'],
      description:
        'Full "Manfred" lockup (`wordmark`) or single-letter `M` (`monogram`).',
      table: { defaultValue: { summary: 'wordmark' } },
    },
    color: {
      control: 'select',
      options: ['blue', 'black', 'white'],
      description:
        'Brand-literal fill — does NOT flip with theme. `white` is for dark / ' +
        'brand backgrounds; `black` / `blue` for light surfaces.',
      table: { defaultValue: { summary: 'blue' } },
    },
    height: {
      control: { type: 'range', min: 20, max: 120, step: 4 },
      description: 'Height in pixels. Width scales proportionally via viewBox.',
      table: { defaultValue: { summary: '48' } },
    },
    'aria-label': {
      control: 'text',
      description:
        'Accessible name. Defaults to "Manfred" / "M" — override when the logo ' +
        'has a different meaning in context (e.g. "Manfred home").',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Logo>;

export const Playground: Story = {
  args: {
    variant: 'wordmark',
    color: 'blue',
    height: 48,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive sandbox — toggle variant, colour, and height via the Controls panel.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Logo wraps the SVG in role="img" with a default aria-label of "Manfred" for the wordmark.
    expect(canvas.getByRole('img', { name: 'Manfred' })).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All variant + colour combinations. The bottom row sits on a dark ' +
          'background so the `white` colour has the contrast it needs — a ' +
          'reminder that brand colours do not theme-flip.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
      <Logo variant="wordmark"  color="blue"  height={48} />
      <Logo variant="monogram"  color="blue"  height={48} />
      <Logo variant="wordmark"  color="black" height={48} />
      <Logo variant="monogram"  color="black" height={48} />
      <div style={{ background: 'var(--color-brand-logo-ink)', padding: '16px', borderRadius: '8px' }}>
        <Logo variant="wordmark" color="white" height={48} />
      </div>
      <div style={{ background: 'var(--color-brand-logo-ink)', padding: '16px', borderRadius: '8px' }}>
        <Logo variant="monogram" color="white" height={48} />
      </div>
    </div>
  ),
};

export const OnBrandBackgrounds: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'How the logo lands on the four common brand surfaces. Use this as a ' +
          'reference for picking `color` per surface — there is no automatic ' +
          'theme flip for brand colours.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <div style={{ background: 'var(--color-brand-logo-blue)', padding: '24px', borderRadius: '8px' }}>
        <Logo variant="wordmark" color="white" height={40} />
      </div>
      <div style={{ background: 'var(--color-brand-logo-ink)', padding: '24px', borderRadius: '8px' }}>
        <Logo variant="wordmark" color="white" height={40} />
      </div>
      <div style={{ background: 'var(--color-bg-warm-muted)', padding: '24px', borderRadius: '8px' }}>
        <Logo variant="wordmark" color="black" height={40} />
      </div>
      <div style={{ background: 'var(--color-bg-warm)', padding: '24px', borderRadius: '8px' }}>
        <Logo variant="wordmark" color="blue" height={40} />
      </div>
    </div>
  ),
};
