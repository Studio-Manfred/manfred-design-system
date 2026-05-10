import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack, VStack, HStack } from './Stack';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';
import { Button } from '../Button';
import { Badge } from '../Badge';

const meta: Meta<typeof Stack> = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Sibling-spacing primitive. DS components carry no outer margin so ' +
          'composition stays predictable; Stack owns the gap between ' +
          'siblings. `VStack` and `HStack` are pre-bound aliases for clearer ' +
          'call sites. The `gap` scale is locked to the spacing tokens.',
      },
    },
  },
  argTypes: {
    direction: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: 'Layout axis.',
      table: { defaultValue: { summary: 'vertical' } },
    },
    gap: {
      control: 'select',
      options: [1, 2, 3, 4, 6, 8, 12],
      description: 'Spacing between siblings, mapped to the `--space-*` tokens.',
      table: { defaultValue: { summary: '4' } },
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'stretch'],
      description: '`align-items` passthrough.',
      table: { defaultValue: { summary: 'stretch' } },
    },
    justify: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'between', 'around'],
      description: '`justify-content` passthrough.',
      table: { defaultValue: { summary: 'start' } },
    },
    wrap: {
      control: 'boolean',
      description: 'Allow flex children to wrap onto a new line.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch the stack to fill its container.',
    },
    as: {
      control: 'select',
      options: ['div', 'section', 'nav', 'ul', 'ol', 'li'],
      description: 'Rendered HTML element. Use `ul`/`ol`/`li` for lists.',
      table: { defaultValue: { summary: 'div' } },
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
  parameters: {
    docs: {
      description: {
        story:
          'Vertical Stack with three boxes — the default direction. Toggle ' +
          'every variant via the Controls panel.',
      },
    },
  },
  render: (args) => (
    <Stack {...args} className="w-72">
      <Box>One</Box>
      <Box>Two</Box>
      <Box>Three</Box>
    </Stack>
  ),
};

export const Horizontal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`HStack` (pre-bound horizontal Stack) used for an action button ' +
          'row. Same API minus `direction`.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Each step on the gap scale rendered between three boxes. Use this ' +
          'to confirm token rhythm before settling on a gap.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          '`justify="between"` for split rows, `align="center"` for centring ' +
          'content with mixed heights — the two flex controls used most.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Render the Stack as `<ul>` (with `<li>` children) so each card is ' +
          'a list item — the right semantic for a set of comparable items.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          '`wrap` lets horizontal stacks flow onto a second line — the ' +
          'pattern for tag clouds and chip groups.',
      },
    },
  },
  render: () => (
    <HStack gap={2} wrap className="w-80">
      {Array.from({ length: 12 }, (_, i) => (
        <Box key={i}>tag-{i + 1}</Box>
      ))}
    </HStack>
  ),
};
