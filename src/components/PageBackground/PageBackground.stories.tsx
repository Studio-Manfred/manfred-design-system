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
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'warm', 'warm-muted', 'accent', 'inverse'],
    },
    as: { control: 'select', options: ['div', 'section', 'main'] },
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
  render: (args) => (
    <PageBackground {...args}>
      <SampleContent />
    </PageBackground>
  ),
};

export const Warm: Story = {
  args: { variant: 'warm' },
  render: (args) => (
    <PageBackground {...args}>
      <SampleContent />
    </PageBackground>
  ),
};

export const WarmMuted: Story = {
  name: 'Warm muted',
  args: { variant: 'warm-muted' },
  render: (args) => (
    <PageBackground {...args}>
      <SampleContent />
    </PageBackground>
  ),
};

export const Accent: Story = {
  args: { variant: 'accent' },
  render: (args) => (
    <PageBackground {...args}>
      <SampleContent />
    </PageBackground>
  ),
};

export const Inverse: Story = {
  args: { variant: 'inverse' },
  render: (args) => (
    <PageBackground {...args}>
      <SampleContent />
    </PageBackground>
  ),
};

export const AllVariants: Story = {
  name: 'All variants',
  parameters: { layout: 'fullscreen' },
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
