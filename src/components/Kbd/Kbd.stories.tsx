import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from './Kbd';
import { SearchBar } from '../SearchBar';

const meta: Meta<typeof Kbd> = {
  title: 'Components/Kbd',
  component: Kbd,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Keyboard-shortcut hint. Renders each entry in `keys` as its own ' +
          '`<kbd>` chip joined by `separator` (default `+`). Used in command ' +
          'palettes, menu-item shortcuts, and help-page copy. ' +
          '`aria-hidden="true"` by default — flip it to `false` when the ' +
          'shortcut is the only thing announcing the keystroke.',
      },
    },
  },
  args: { keys: ['⌘', 'K'] },
  argTypes: {
    keys: {
      control: 'object',
      description: 'Array of key labels — each becomes its own chip. Required.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: '`sm` = 20px chip (default), `md` = 24px chip. Match to surrounding text size.',
      table: { defaultValue: { summary: 'sm' } },
    },
    separator: {
      control: 'text',
      description: 'Node rendered between chips. Defaults to `+`. Pass `""` for no separator.',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Kbd>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Two-key chord with the default `+` separator.',
      },
    },
  },
};

export const Single: Story = {
  args: { keys: ['Esc'] },
  parameters: {
    docs: {
      description: {
        story:
          'Single key — no separator rendered. Useful for "press Esc to ' +
          'cancel" inline copy.',
      },
    },
  },
};

export const ThreeKeys: Story = {
  args: { keys: ['Ctrl', 'Shift', 'P'] },
  parameters: {
    docs: {
      description: {
        story:
          'Three-key chord — confirms separators render between each ' +
          'pair, not before the first or after the last chip.',
      },
    },
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Two sizes side by side. `sm` aligns with `text-xs` body copy, ' +
          '`md` matches `text-sm` and reads better in larger menus.',
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Kbd keys={['⌘', 'K']} size="sm" />
      <Kbd keys={['⌘', 'K']} size="md" />
    </div>
  ),
};

export const NextToSearchBar: Story = {
  name: 'Inside SearchBar (dashboard sketch)',
  parameters: {
    docs: {
      description: {
        story:
          'Dashboard pattern — the shortcut sits in the `SearchBar` trailing ' +
          'slot to advertise the command-palette key without taking up its own row.',
      },
    },
  },
  render: () => (
    <div className="w-80">
      <SearchBar
        placeholder="Search…"
        fullWidth
        trailing={<Kbd keys={['⌘', 'K']} />}
      />
    </div>
  ),
};

export const AnnouncedToScreenReader: Story = {
  name: 'aria-hidden={false} (help-page form)',
  parameters: {
    docs: {
      description: {
        story:
          'Help-page form — `aria-hidden={false}` so a screen reader does ' +
          'announce the keys. Reach for this when the shortcut is the ' +
          'only way the user discovers the keystroke.',
      },
    },
  },
  render: () => (
    <p className="text-sm">
      Press <Kbd keys={['⌘', 'K']} aria-hidden={false} /> to open the command
      palette.
    </p>
  ),
};
