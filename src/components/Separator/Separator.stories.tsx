import type { Meta, StoryObj } from '@storybook/react-vite';
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
  parameters: { layout: 'centered' },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    decorative: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
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
