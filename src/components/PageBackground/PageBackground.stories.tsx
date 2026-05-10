import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageBackground } from './PageBackground';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../Card';

const meta: Meta<typeof PageBackground> = {
  title: 'Layout/PageBackground',
  component: PageBackground,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Page-tone wrapper that paints a token-driven surface across the ' +
          'full viewport. Five variants (`default` / `warm` / `warm-muted` / ' +
          '`accent` / `inverse`) flip with the theme automatically. Compose ' +
          'with `Container` for inner page layout.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'warm', 'warm-muted', 'accent', 'inverse'],
      description: 'Surface tone. All variants flip automatically under dark mode.',
      table: { defaultValue: { summary: 'default' } },
    },
    as: {
      control: 'select',
      options: ['div', 'section', 'main'],
      description: 'Rendered HTML element. Use `main` for a single-landmark page.',
      table: { defaultValue: { summary: 'div' } },
    },
  },
};
export default meta;

type Story = StoryObj<typeof PageBackground>;

const SampleContent = () => (
  <div className="p-12 flex flex-col gap-6 max-w-3xl">
    <h1 className="text-3xl font-semibold">Page heading</h1>
    <p className="text-base">
      PageBackground sets a token-driven surface for an entire route or
      subtree. Compose it with Card, Container, and other layout primitives
      for richer pages.
    </p>
    <div className="flex gap-4 flex-wrap">
      <Card padding="md" className="w-72">
        <CardHeader>
          <CardTitle as="h2">Card on this surface</CardTitle>
          <CardDescription>
            Cards sit on top of the chosen page background.
          </CardDescription>
        </CardHeader>
        <CardContent>
          The card uses its own surface token, so contrast against the page
          background works in both light and dark modes.
        </CardContent>
      </Card>
      <Card padding="md" className="w-72">
        <CardHeader>
          <CardTitle as="h2">Another card</CardTitle>
          <CardDescription>For visual rhythm.</CardDescription>
        </CardHeader>
        <CardContent>Lorem ipsum dolor sit amet.</CardContent>
      </Card>
    </div>
  </div>
);

export const Default: Story = {
  args: { variant: 'default' },
  parameters: {
    docs: {
      description: {
        story:
          'Default surface — `bg-background` / `text-foreground` from the ' +
          'shadcn contract. Maps to `--neutral-50` in light, `--neutral-900` ' +
          'in dark.',
      },
    },
  },
  render: (args) => (
    <PageBackground {...args}>
      <SampleContent />
    </PageBackground>
  ),
};

export const Warm: Story = {
  args: { variant: 'warm' },
  parameters: {
    docs: {
      description: {
        story:
          'Warm cream surface — beige in light mode, neutral-800 in dark. ' +
          'Use for marketing or studio-tone pages.',
      },
    },
  },
  render: (args) => (
    <PageBackground {...args}>
      <SampleContent />
    </PageBackground>
  ),
};

export const WarmMuted: Story = {
  name: 'Warm muted',
  args: { variant: 'warm-muted' },
  parameters: {
    docs: {
      description: {
        story:
          'Slightly heavier warm surface — beige in light, neutral-700 in ' +
          'dark. Lifts cards on top of the page chrome.',
      },
    },
  },
  render: (args) => (
    <PageBackground {...args}>
      <SampleContent />
    </PageBackground>
  ),
};

export const Accent: Story = {
  args: { variant: 'accent' },
  parameters: {
    docs: {
      description: {
        story:
          'Brand-accent surface — pink in light, neutral-700 in dark. ' +
          'Reserve for hero or campaign pages.',
      },
    },
  },
  render: (args) => (
    <PageBackground {...args}>
      <SampleContent />
    </PageBackground>
  ),
};

export const Inverse: Story = {
  args: { variant: 'inverse' },
  parameters: {
    docs: {
      description: {
        story:
          'Inverse pairing — dark surface with light text in light mode and ' +
          'the reverse in dark. Useful for high-contrast launcher screens.',
      },
    },
  },
  render: (args) => (
    <PageBackground {...args}>
      <SampleContent />
    </PageBackground>
  ),
};

export const AllVariants: Story = {
  name: 'All variants',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'All five variants tiled side-by-side for visual / dark-mode ' +
          'review. Each tile flips together with the theme.',
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
      {(['default', 'warm', 'warm-muted', 'accent', 'inverse'] as const).map(
        (variant) => (
          <PageBackground
            key={variant}
            variant={variant}
            className="min-h-[40vh] p-8"
          >
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-wide opacity-70">
                variant
              </span>
              <span className="text-xl font-semibold">{variant}</span>
              <p className="text-sm max-w-sm">
                Surface tile preview. Background and text colour flip together
                so contrast holds in light and dark.
              </p>
            </div>
          </PageBackground>
        ),
      )}
    </div>
  ),
};
