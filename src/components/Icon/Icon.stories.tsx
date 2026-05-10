import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import { Icon } from './Icon';
import { iconPaths } from './iconPaths';
import type { IconName } from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Single-colour SVG icon from the Manfred curated set. Strokes via ' +
          '`currentColor`, so the icon inherits text colour from its parent — ' +
          'drop it inside a button or label and it picks up the surrounding ' +
          'style automatically. Names are restricted to the `IconName` union; ' +
          'add new glyphs in `iconPaths.ts` rather than hand-writing SVG. ' +
          'Pass `label` to make the icon meaningful (`role="img"` + ' +
          '`aria-label`); omit for decorative use (`aria-hidden`).',
      },
    },
  },
  argTypes: {
    name: {
      control: 'select',
      options: Object.keys(iconPaths) as IconName[],
      description: 'Glyph to render. Restricted to the curated `IconName` union.',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Visual size — `xs` (12px), `sm` (16px), `md` (20px, default), `lg` (24px), `xl` (32px).',
      table: { defaultValue: { summary: 'md' } },
    },
    label: {
      control: 'text',
      description:
        "Accessible label. Set for meaningful icons (`role='img'` + `aria-label`); omit for decorative.",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const Playground: Story = {
  args: {
    name: 'check',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive sandbox — pick a glyph and a size from the Controls ' +
          'panel below. Renders without `label`, so the icon is decorative.',
      },
    },
  },
};

export const Labelled: Story = {
  args: {
    name: 'check',
    size: 'md',
    label: 'Check mark',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Standalone icon with an accessible name. Use this shape when the ' +
          'icon is the only thing communicating the action (icon-only button, ' +
          'standalone status glyph).',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // When `label` is provided the SVG gets role="img" + aria-label so AT can announce a meaningful name.
    expect(canvas.getByRole('img', { name: 'Check mark' })).toBeInTheDocument();
  },
};

export const AllIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every glyph in the curated set with its `IconName`. Visual ' +
          'inventory — use it to pick a name, then look up the prop in code.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', maxWidth: '600px' }}>
      {(Object.keys(iconPaths) as IconName[]).map((name) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            width: '64px',
          }}
        >
          <Icon name={name} size="md" />
          <span
            style={{
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              fontFamily: 'var(--font-family-base)',
              lineHeight: '1.3',
            }}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Five-step size scale. Stroke width stays at 1.5px across sizes ' +
          'so the optical weight is consistent — useful when icons sit ' +
          'side-by-side at different sizes.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Icon name="search" size={size} />
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-family-base)',
            }}
          >
            {size}
          </span>
        </div>
      ))}
    </div>
  ),
};
