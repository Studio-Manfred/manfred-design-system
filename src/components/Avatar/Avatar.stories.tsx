import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compact identity badge — a person or account represented by an ' +
          'image with an initials fallback. Three sizes (`sm` / `md` / ' +
          '`lg`) and two visual variants (`neutral` / `brand`). Renders ' +
          'as a `<span role="img">` carrying the required `alt` as its ' +
          'accessible label.',
      },
    },
  },
  args: {
    alt: 'Jens Wedin',
    name: 'Jens Wedin',
  },
  argTypes: {
    alt: {
      control: 'text',
      description:
        'Required accessible name. Read aloud by assistive tech as the ' +
        'avatar\'s label — pass the person or account name.',
    },
    src: {
      control: 'text',
      description:
        'Optional image URL. Falls back to initials if missing or fails to load.',
    },
    name: {
      control: 'text',
      description:
        'Source for initial derivation when no image is shown. Defaults to ' +
        '`alt`. Override when displayed initials should differ from the ' +
        'accessible name.',
    },
    initials: {
      control: 'text',
      description:
        'Override the derived initials with an explicit string. Use sparingly.',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Diameter scale: `sm` 28px, `md` 36px (default), `lg` 48px.',
      table: { defaultValue: { summary: 'md' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['neutral', 'brand'],
      description:
        '`neutral` for most cases; `brand` for the user\'s own account or ' +
        'a primary identity slot.',
      table: { defaultValue: { summary: 'neutral' } },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default neutral avatar — no image, falls back to initials derived ' +
          'from `name`. The most common shape in lists, cards, and headers ' +
          'where photos aren\'t available.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Avatar renders a span with role="img" so AT announces it as a single image, not a path soup.
    expect(canvas.getByRole('img', { name: 'Jens Wedin' })).toBeInTheDocument();
  },
};

export const SingleInitial: Story = {
  args: { alt: 'User M', name: 'M' },
  parameters: {
    docs: {
      description: {
        story:
          'Single-character name. Confirms derivation handles short strings ' +
          'without padding or wrapping artefacts.',
      },
    },
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All three sizes side by side. Diameters: 28 / 36 / 48px. Use `sm` ' +
          'in dense lists, `md` for most surfaces, `lg` for profile headers ' +
          'or empty states.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Brand variant — high-contrast surface used for the signed-in user ' +
          'or a primary account slot, distinguishing "me" from "everyone else" ' +
          'in a participant list.',
      },
    },
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/96?img=12',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Image-backed avatar. The wrapping `role="img"` carries the ' +
          'accessible name; the inner `<img>` is `aria-hidden` so the name ' +
          'isn\'t announced twice.',
      },
    },
  },
};

export const ImageFailsToLoad: Story = {
  name: 'Image fails → initials fallback',
  args: { src: 'https://example.invalid/missing.jpg' },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the failure path — when the image fails to load, the ' +
          '`onError` handler swaps in the initials fallback automatically. ' +
          'Important for resilience against broken CDNs or stale URLs.',
      },
    },
  },
};

export const InTopBar: Story = {
  name: 'TopBar usage (dashboard sketch)',
  parameters: {
    docs: {
      description: {
        story:
          'Realistic placement: avatar in a dashboard top bar, sized `sm` and ' +
          '`brand` variant to mark the current user. Verifies the component ' +
          'sits cleanly inside other surfaces.',
      },
    },
  },
  render: () => (
    <header className="flex items-center justify-between w-[480px] h-12 px-4 bg-card border border-border rounded-md">
      <span className="text-sm font-semibold">Mitt Intranat</span>
      <Avatar alt="Account: M" name="M" size="sm" variant="brand" />
    </header>
  ),
};
