import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack, VStack, HStack } from './Stack';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';
import { Button } from '../Button';
import { Badge } from '../Badge';

const meta: Meta<typeof Stack> = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: { layout: 'centered' },
  argTypes: {
    direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    gap: { control: 'select', options: [1, 2, 3, 4, 6, 8, 12] },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'stretch'],
    },
    justify: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'between', 'around'],
    },
    wrap: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    as: {
      control: 'select',
      options: ['div', 'section', 'nav', 'ul', 'ol', 'li'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Stack>;

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 py-2 rounded-[var(--radius-sm)] bg-secondary text-foreground">
    {children}
  </div>
);

export const Default: Story = {
  render: (args) => (
    <Stack {...args} className="w-72">
      <Box>One</Box>
      <Box>Two</Box>
      <Box>Three</Box>
    </Stack>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <HStack gap={4}>
      <Button variant="brand">Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Discard</Button>
    </HStack>
  ),
};

export const GapScale: Story = {
  name: 'Gap scale (1 / 2 / 3 / 4 / 6 / 8 / 12)',
  render: () => (
    <VStack gap={6} className="w-80">
      {([1, 2, 3, 4, 6, 8, 12] as const).map((g) => (
        <div key={g}>
          <div className="mb-1 text-xs text-muted-foreground">gap={g}</div>
          <HStack gap={g}>
            <Box>A</Box>
            <Box>B</Box>
            <Box>C</Box>
          </HStack>
        </div>
      ))}
    </VStack>
  ),
};

export const AlignAndJustify: Story = {
  render: () => (
    <VStack gap={4} className="w-80">
      <div className="text-xs text-muted-foreground">justify="between"</div>
      <HStack justify="between" className="w-full">
        <Box>Left</Box>
        <Box>Right</Box>
      </HStack>
      <div className="text-xs text-muted-foreground">align="center"</div>
      <HStack align="center" gap={3} className="h-16 bg-muted rounded-md px-3">
        <Box>Tall enough</Box>
        <span className="text-sm">centered</span>
      </HStack>
    </VStack>
  ),
};

export const ListOfCards: Story = {
  name: 'List of Cards (real-world use)',
  render: () => (
    <VStack as="ul" gap={4} className="w-96 list-none p-0">
      {['Conversion rate', 'Active users', 'Open tickets'].map((label) => (
        <li key={label}>
          <Card>
            <CardHeader>
              <CardTitle as="h3">{label}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <span className="text-2xl font-semibold">12.4%</span>
              <Badge variant="success" size="sm">
                +2.1pp
              </Badge>
            </CardContent>
          </Card>
        </li>
      ))}
    </VStack>
  ),
};

export const Wrapping: Story = {
  render: () => (
    <HStack gap={2} wrap className="w-80">
      {Array.from({ length: 12 }, (_, i) => (
        <Box key={i}>tag-{i + 1}</Box>
      ))}
    </HStack>
  ),
};
