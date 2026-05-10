import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from './Container';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../Card';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Centred max-width wrapper for page layout. Five `size` steps map ' +
          'to the container tokens; `padded` controls the responsive ' +
          'horizontal padding. Render as the right landmark via `as` ' +
          '(`main` / `section` / `article`).',
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Max-width step. `full` disables the cap entirely.',
      table: { defaultValue: { summary: 'lg' } },
    },
    as: {
      control: 'select',
      options: ['div', 'main', 'section', 'article'],
      description: 'Rendered HTML element. Pick the right landmark for the page outline.',
      table: { defaultValue: { summary: 'div' } },
    },
    padded: {
      control: 'boolean',
      description: 'Responsive horizontal padding. Disable for edge-to-edge surfaces.',
      table: { defaultValue: { summary: 'true' } },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Container>;

const Demo = ({ label }: { label: string }) => (
  <div className="rounded-md border border-dashed border-border bg-card p-6 text-sm text-foreground">
    <p className="font-medium">{label}</p>
    <p className="text-muted-foreground">
      The dashed outline shows the Container&apos;s rendered width. Resize the
      preview to see the responsive padding kick in.
    </p>
  </div>
);

export const Default: Story = {
  args: { size: 'lg', padded: true, as: 'div' },
  parameters: {
    docs: {
      description: {
        story:
          'Default container — 64rem max-width with the responsive padding ' +
          'on. Most pages start here.',
      },
    },
  },
  render: (args) => (
    <Container {...args}>
      <Demo label="size=lg (default) — 64rem max-width, responsive padding" />
    </Container>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All five size steps stacked. Resize the preview to see how each ' +
          'caps the content width.',
      },
    },
  },
  render: () => (
    <div className="space-y-4 py-6">
      <Container size="sm">
        <Demo label="size=sm — 40rem" />
      </Container>
      <Container size="md">
        <Demo label="size=md — 48rem" />
      </Container>
      <Container size="lg">
        <Demo label="size=lg — 64rem" />
      </Container>
      <Container size="xl">
        <Demo label="size=xl — 80rem" />
      </Container>
      <Container size="full">
        <Demo label="size=full — no max-width cap" />
      </Container>
    </div>
  ),
};

export const EdgeToEdge: Story = {
  name: 'Edge-to-edge (padded=false)',
  args: { size: 'full', padded: false },
  parameters: {
    docs: {
      description: {
        story:
          '`size="full"` + `padded={false}` lets the content bleed to the ' +
          'viewport edges. Useful for hero blocks and tools (canvas, maps) ' +
          'that own the layout themselves.',
      },
    },
  },
  render: (args) => (
    <Container {...args}>
      <Demo label="size=full + padded=false — bleeds to viewport edges" />
    </Container>
  ),
};

export const AsMainLandmark: Story = {
  name: 'As <main> landmark',
  parameters: {
    docs: {
      description: {
        story:
          'Render the Container as `<main>` to give screen readers a single ' +
          'main landmark. Pair with an `aria-label` when the page has more ' +
          'than one major content area.',
      },
    },
  },
  render: () => (
    <Container as="main" size="lg" aria-label="Page main content">
      <Card>
        <CardHeader>
          <CardTitle>Page title</CardTitle>
          <CardDescription>Container rendered as a main landmark.</CardDescription>
        </CardHeader>
        <CardContent>
          Use <code>as=&quot;main&quot;</code> at the top level of a route to give
          screen readers a single main landmark.
        </CardContent>
      </Card>
    </Container>
  ),
};
