import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compound tabbed view built on `@radix-ui/react-tabs`. Two visual ' +
          'variants (`segmented` pill switcher, `underline` classic strip) and ' +
          'two sizes (`sm` / `md`) shared with descendant `TabsList` / ' +
          '`TabsTrigger` via context. Roving focus, arrow-key navigation, and ' +
          'tab/tabpanel ARIA come from Radix.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['segmented', 'underline'],
      description: 'Visual style. `segmented` for app-level toggles; `underline` for in-page sections.',
      table: { defaultValue: { summary: 'segmented' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      description: 'Trigger height + text size.',
      table: { defaultValue: { summary: 'md' } },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Segmented: Story = {
  args: { variant: 'segmented', size: 'md' },
  parameters: {
    docs: {
      description: {
        story:
          'Default `segmented` variant — a pill switcher inside a bordered ' +
          'track. Best for binary or small-set view switches.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The tab list must be present and named so AT can announce the group.
    expect(canvas.getByRole('tablist', { name: 'View' })).toBeInTheDocument();
    // The default tab is selected — verify aria-selected is "true" on the active trigger.
    const boardTab = canvas.getByRole('tab', { name: 'Board' });
    expect(boardTab).toHaveAttribute('aria-selected', 'true');
    // Clicking the Dashboard tab switches selection — verify Radix state update fires.
    await userEvent.click(canvas.getByRole('tab', { name: 'Dashboard' }));
    expect(canvas.getByRole('tab', { name: 'Dashboard' })).toHaveAttribute('aria-selected', 'true');
    // ArrowLeft keyboard navigation moves focus back to the Board tab in Radix's roving tabindex.
    await userEvent.keyboard('{ArrowLeft}');
    expect(canvas.getByRole('tab', { name: 'Board' })).toHaveAttribute('aria-selected', 'true');
  },
  render: (args) => (
    <Tabs defaultValue="board" {...args}>
      <TabsList aria-label="View">
        <TabsTrigger value="board">Board</TabsTrigger>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
      </TabsList>
      <TabsContent value="board">Board content</TabsContent>
      <TabsContent value="dashboard">Dashboard content</TabsContent>
    </Tabs>
  ),
};

export const Underline: Story = {
  args: { variant: 'underline', size: 'md' },
  parameters: {
    docs: {
      description: {
        story:
          '`underline` variant — sits flush above content with a single rule. ' +
          'Use for in-page sections where the tabs aren\'t the page\'s primary ' +
          'navigation chrome.',
      },
    },
  },
  render: (args) => (
    <Tabs defaultValue="overview" {...args}>
      <TabsList aria-label="Sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview content</TabsContent>
      <TabsContent value="activity">Activity content</TabsContent>
      <TabsContent value="settings">Settings content</TabsContent>
    </Tabs>
  ),
};

export const SmallSegmented: Story = {
  args: { variant: 'segmented', size: 'sm' },
  parameters: {
    docs: {
      description: {
        story:
          'Compact `sm` segmented switcher — fits inside toolbars and table ' +
          'headers without dominating the row.',
      },
    },
  },
  render: (args) => (
    <Tabs defaultValue="day" {...args}>
      <TabsList aria-label="Range">
        <TabsTrigger value="day">Day</TabsTrigger>
        <TabsTrigger value="week">Week</TabsTrigger>
        <TabsTrigger value="month">Month</TabsTrigger>
      </TabsList>
      <TabsContent value="day">Day</TabsContent>
      <TabsContent value="week">Week</TabsContent>
      <TabsContent value="month">Month</TabsContent>
    </Tabs>
  ),
};

export const SideBySide: Story = {
  name: 'Both variants side by side',
  parameters: {
    docs: {
      description: {
        story:
          'Both variants stacked for visual / dark-mode review. Demonstrates ' +
          'how segmented vs underline read at the same scale.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <Tabs defaultValue="board" variant="segmented">
        <TabsList aria-label="View">
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="board">Segmented — Board</TabsContent>
        <TabsContent value="dashboard">Segmented — Dashboard</TabsContent>
      </Tabs>

      <Tabs defaultValue="overview" variant="underline">
        <TabsList aria-label="Sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Underline — Overview</TabsContent>
        <TabsContent value="activity">Underline — Activity</TabsContent>
      </Tabs>
    </div>
  ),
};

export const DisabledTab: Story = {
  args: { variant: 'segmented' },
  parameters: {
    docs: {
      description: {
        story:
          'A `disabled` trigger remains visible but skips roving focus and ' +
          'cannot activate. Use for tabs the user lacks permission to view.',
      },
    },
  },
  render: (args) => (
    <Tabs defaultValue="board" {...args}>
      <TabsList aria-label="View">
        <TabsTrigger value="board">Board</TabsTrigger>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="archive" disabled>
          Archive
        </TabsTrigger>
      </TabsList>
      <TabsContent value="board">Board</TabsContent>
      <TabsContent value="dashboard">Dashboard</TabsContent>
      <TabsContent value="archive">Archive</TabsContent>
    </Tabs>
  ),
};
