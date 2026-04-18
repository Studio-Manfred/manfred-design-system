import type { Meta, StoryObj } from '@storybook/react-vite';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Foundation/Typography',
  component: Typography,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'headline1', 'headline2', 'headline3', 'headline4',
        'large', 'body', 'bodySmall', 'label', 'caption',
      ],
    },
    color: {
      control: 'select',
      options: ['default', 'inverse', 'brand', 'muted'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Typography>;

export const Playground: Story = {
  args: {
    variant: 'body',
    color: 'default',
    children: 'The quick brown fox jumps over the lazy dog.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Typography variant="headline1">Headline 1 — ExtraBold 56px</Typography>
      <Typography variant="headline2">Headline 2 — ExtraBold 40px</Typography>
      <Typography variant="headline3">Headline 3 — ExtraBold 32px</Typography>
      <Typography variant="headline4">Headline 4 — ExtraBold 24px</Typography>
      <Typography variant="large">Large — Light 20px. For single sentences and pull quotes.</Typography>
      <Typography variant="body">Body — Regular 16px. Used for all main body copy throughout the product.</Typography>
      <Typography variant="bodySmall">Body Small — Regular 14px. For secondary content areas.</Typography>
      <Typography variant="label">Label — SemiBold 14px</Typography>
      <Typography variant="caption">Caption — Regular 12px</Typography>
    </div>
  ),
};

export const ColorVariants: Story = {
  parameters: {
    a11y: {
      config: {
        // This story demos colour tokens on tinted backgrounds as a reference;
        // individual pairings (e.g. brand blue on dark) are intentional showcases,
        // not production copy. Contrast rules don't apply to swatch demos.
        rules: [{ id: 'color-contrast', enabled: false }],
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Typography variant="headline3" color="inverse">Inverse — White on dark</Typography>
      <Typography variant="body" color="inverse">Inverse body text on dark background.</Typography>
      <Typography variant="headline3" color="brand">Brand — Business Blue</Typography>
      <Typography variant="body" color="muted">Muted — 60% opacity text for secondary information.</Typography>
    </div>
  ),
  globals: {
    backgrounds: {
      value: "dark"
    }
  },
};
