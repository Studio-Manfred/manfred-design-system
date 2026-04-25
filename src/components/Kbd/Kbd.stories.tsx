import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from './Kbd';
import { SearchBar } from '../SearchBar';

const meta: Meta<typeof Kbd> = {
  title: 'Components/Kbd',
  component: Kbd,
  parameters: { layout: 'centered' },
  args: { keys: ['⌘', 'K'] },
  argTypes: {
    keys: { control: 'object' },
    size: { control: 'select', options: ['sm', 'md'] },
    separator: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<typeof Kbd>;

export const Default: Story = {};

export const Single: Story = {
  args: { keys: ['Esc'] },
};

export const ThreeKeys: Story = {
  args: { keys: ['Ctrl', 'Shift', 'P'] },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Kbd keys={['⌘', 'K']} size="sm" />
      <Kbd keys={['⌘', 'K']} size="md" />
    </div>
  ),
};

export const NextToSearchBar: Story = {
  name: 'Inside SearchBar (dashboard sketch)',
  render: () => (
    // SearchBar doesn't expose a trailing slot, so the Kbd is absolutely
    // positioned over the trailing edge — matches the Mitt Intranat sketch.
    <div className="relative w-80">
      <SearchBar placeholder="Search…" fullWidth />
      <span className="absolute right-3 top-1/2 -translate-y-1/2">
        <Kbd keys={['⌘', 'K']} />
      </span>
    </div>
  ),
};

export const AnnouncedToScreenReader: Story = {
  name: 'aria-hidden={false} (help-page form)',
  render: () => (
    <p className="text-sm">
      Press <Kbd keys={['⌘', 'K']} aria-hidden={false} /> to open the command
      palette.
    </p>
  ),
};
