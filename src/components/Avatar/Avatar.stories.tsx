import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  args: {
    alt: 'Jens Wedin',
    name: 'Jens Wedin',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: ['neutral', 'brand'] },
    src: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

export const SingleInitial: Story = {
  args: { alt: 'User M', name: 'M' },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Avatar {...args} size="sm" />
      <Avatar {...args} size="md" />
      <Avatar {...args} size="lg" />
    </div>
  ),
};

export const Brand: Story = {
  args: { variant: 'brand' },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/96?img=12',
  },
};

export const ImageFailsToLoad: Story = {
  name: 'Image fails → initials fallback',
  args: { src: 'https://example.invalid/missing.jpg' },
};

export const InTopBar: Story = {
  name: 'TopBar usage (dashboard sketch)',
  render: () => (
    <header className="flex items-center justify-between w-[480px] h-12 px-4 bg-card border border-border rounded-md">
      <span className="text-sm font-semibold">Mitt Intranat</span>
      <Avatar alt="Account: M" name="M" size="sm" variant="brand" />
    </header>
  ),
};
