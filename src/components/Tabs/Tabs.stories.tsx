import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['segmented', 'underline'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Segmented: Story = {
  args: { variant: 'segmented', size: 'md' },
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
