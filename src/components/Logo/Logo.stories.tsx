import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Foundation/Logo',
  component: Logo,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['wordmark', 'monogram'] },
    color:   { control: 'select', options: ['blue', 'black', 'white'] },
    height:  { control: { type: 'range', min: 20, max: 120, step: 4 } },
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
};

export const AllVariants: Story = {
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
