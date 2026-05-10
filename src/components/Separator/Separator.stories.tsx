import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import { Separator } from './Separator';
import { Typography } from '../Typography';
import { VStack, HStack } from '../Stack';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../Card';

const meta: Meta<typeof Separator> = {
  title: 'Components/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Hairline divider built on `@radix-ui/react-separator`. Picks up ' +
          'the `--border` token and stretches across its parent. Defaults to ' +
          'a horizontal `role="separator"`; flip to vertical or set ' +
          '`decorative` to remove it from the a11y tree.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      description: 'Layout axis. Vertical needs a parent with explicit height.',
      table: { defaultValue: { summary: 'horizontal' } },
    },
    decorative: {
      control: 'boolean',
      description: 'Remove from the a11y tree when the separator is purely visual.',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default horizontal rule between two paragraphs — the most common ' +
          'use, breaking up stacked content.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Non-decorative Separator exposes role="separator" so AT announces the structural break.
    expect(canvas.getByRole('separator')).toBeInTheDocument();
  },
  render: () => (
    <VStack gap="md" className="w-80">
      <Typography variant="body">
        Above the separator. Used to break up vertical content.
      </Typography>
      <Separator />
      <Typography variant="body" color="muted">
        Below the separator. Same surface, different section.
      </Typography>
    </VStack>
  ),
};

export const Vertical: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Vertical rule inside a row — typical toolbar pattern. The parent ' +
          'sets the height; the separator fills the cross axis.',
      },
    },
  },
  render: () => (
    <HStack gap="md" align="center" className="h-6">
      <span className="text-sm">Docs</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Source</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Issues</span>
    </HStack>
  ),
};

export const InCard: Story = {
  name: 'Inside a Card',
  parameters: {
    docs: {
      description: {
        story:
          'Separator marking the boundary between a `CardHeader` and its ' +
          '`CardContent`. Demonstrates how the divider inherits the surface ' +
          'tokens of its container.',
      },
    },
  },
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Project settings</CardTitle>
        <CardDescription>
          Manage how this project is configured.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <Typography variant="bodySmall" color="muted">
          Section content goes here. The separator marks the boundary
          between the header and the body.
        </Typography>
      </CardContent>
    </Card>
  ),
};
