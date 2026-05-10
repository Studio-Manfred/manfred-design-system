import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { TextInput } from './TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'Components/TextInput',
  component: TextInput,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size scale shared with `Textarea` and `Select`.',
      table: { defaultValue: { summary: 'md' } },
    },
    status: {
      control: 'select',
      options: ['default', 'error', 'success'],
      description: 'Validation status. `error` flips `aria-invalid`.',
      table: { defaultValue: { summary: 'default' } },
    },
    leadingIcon: {
      control: 'text',
      description: 'Manfred icon name rendered inside the left edge.',
    },
    trailingIcon: {
      control: 'text',
      description: 'Manfred icon name rendered inside the right edge.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch the input to fill its container.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable interaction. Inherited from native `<input>`.',
    },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Single-line text input — the workhorse of the form system. Three ' +
          'sizes, validation `status`, and optional leading + trailing icons. ' +
          'Wrapper styling comes from the shared `inputLikeVariants` so it ' +
          'lines up with `Select`, `Textarea`, and `SearchBar`.',
      },
    },
    // Global preview disables 'region' because isolated stories aren't pages.
    // Re-enable here so axe reports landmark violations on this interactive component.
    a11y: {
      config: {
        rules: [
          { id: 'region', enabled: true },
        ],
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TextInput>;

export const Playground: Story = {
  args: {
    size: 'md',
    status: 'default',
    placeholder: 'Enter text…',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive sandbox — toggle every prop via the Controls panel ' +
          'below.',
      },
    },
  },
};

export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three inputs with leading and / or trailing icons. Icons are ' +
          'decorative — keep the meaning in the label, not the icon.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '280px' }}>
      <TextInput placeholder="Search…" leadingIcon="search" />
      <TextInput placeholder="Email" leadingIcon="info" trailingIcon="check-circle" />
      <TextInput placeholder="Password" leadingIcon="eye-off" />
    </div>
  ),
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default, error, success, and disabled. `status="error"` flips ' +
          '`aria-invalid` on the inner `<input>`.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '280px' }}>
      <TextInput placeholder="Default" status="default" />
      <TextInput placeholder="Error state" status="error" defaultValue="bad input" />
      <TextInput placeholder="Success state" status="success" defaultValue="valid input" />
      <TextInput placeholder="Disabled" disabled defaultValue="disabled" />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All three size scales stacked. Match the size used by sibling form ' +
          'controls in the same form.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '280px' }}>
      <TextInput placeholder="Small" size="sm" />
      <TextInput placeholder="Medium" size="md" />
      <TextInput placeholder="Large" size="lg" />
    </div>
  ),
};

export const FullWidth: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Stretch the input to fill its container — typical pattern for form ' +
          'fields and dialog bodies.',
      },
    },
  },
  render: () => (
    <div style={{ width: '400px' }}>
      <TextInput placeholder="Full width input" fullWidth />
    </div>
  ),
};

// Play: focus the input, type a value, assert the input reflects the typed text.
export const KeyboardInteraction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Coverage story — types into the input and asserts the value ' +
          'reflects the keystrokes.',
      },
    },
  },
  render: () => <TextInput aria-label="Name" placeholder="Enter your name…" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Name' });
    await userEvent.click(input);
    await userEvent.type(input, 'Manfred');
    expect((input as HTMLInputElement).value).toBe('Manfred');
  },
};
