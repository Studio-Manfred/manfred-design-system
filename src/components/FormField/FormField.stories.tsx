import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormField } from './FormField';
import { TextInput } from '../TextInput';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Form-field layout primitive. Composes a `<label>`, the wrapped ' +
          'input (passed via `children`), and an optional helper / error ' +
          '`message` into a consistent vertical stack. Use it around any DS ' +
          'form control — `TextInput`, `Checkbox`, `DatePicker`. `status` ' +
          'controls the message colour, icon, and ARIA live-region: `error` ' +
          'uses `role="alert"`; `hint` and `success` use a polite live-region.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Visible label text. Required.',
    },
    htmlFor: {
      control: 'text',
      description: "Wired to `<label htmlFor>` — pass the wrapped input's `id`.",
    },
    status: {
      control: 'select',
      options: ['default', 'hint', 'error', 'success'],
      description: 'Drives the message colour + icon. `error` renders the message as `role="alert"`.',
      table: { defaultValue: { summary: 'default' } },
    },
    message: {
      control: 'text',
      description: 'Helper / hint / error text below the input. Hidden when omitted.',
    },
    required: {
      control: 'boolean',
      description: 'Show a red asterisk after the label. Decorative — also set `required` on the input.',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

export default meta;

type Story = StoryObj<typeof FormField>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default field — label + input only, no message line. Toggle ' +
          'props in the Controls panel below to explore the other states.',
      },
    },
  },
  render: () => (
    <div style={{ width: '320px' }}>
      <FormField label="Email address" htmlFor="email-play">
        <TextInput id="email-play" placeholder="you@example.com" fullWidth />
      </FormField>
    </div>
  ),
};

export const WithError: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Failure state — `status="error"` colours the message + icon, ' +
          'and the message renders as `role="alert"` so screen readers ' +
          'announce it on submit. The wrapped `TextInput` mirrors the ' +
          'error border via its own `status` prop.',
      },
    },
  },
  render: () => (
    <div style={{ width: '320px' }}>
      <FormField
        label="Email address"
        htmlFor="email-error"
        status="error"
        message="Please enter a valid email address."
      >
        <TextInput
          id="email-error"
          defaultValue="notanemail"
          status="error"
          fullWidth
        />
      </FormField>
    </div>
  ),
};

export const WithSuccess: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Confirmation state — `status="success"` for inline async ' +
          'validation (e.g. "username available"). Uses a polite ' +
          'live-region rather than `role="alert"`.',
      },
    },
  },
  render: () => (
    <div style={{ width: '320px' }}>
      <FormField
        label="Username"
        htmlFor="username-ok"
        status="success"
        message="Username is available!"
      >
        <TextInput
          id="username-ok"
          defaultValue="jens_wedin"
          status="success"
          fullWidth
        />
      </FormField>
    </div>
  ),
};

export const WithHint: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Neutral guidance — `status="hint"` for "must be 8+ characters" ' +
          'style helper copy. Pairs with the info icon and muted text.',
      },
    },
  },
  render: () => (
    <div style={{ width: '320px' }}>
      <FormField
        label="Password"
        htmlFor="password-hint"
        status="hint"
        message="Must be at least 8 characters with a number."
      >
        <TextInput
          id="password-hint"
          type="password"
          placeholder="Enter password"
          fullWidth
        />
      </FormField>
    </div>
  ),
};

export const Required: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Required field — the asterisk is decorative (`aria-hidden`); ' +
          'the wrapped input also carries `required` so the browser and ' +
          'AT both pick it up.',
      },
    },
  },
  render: () => (
    <div style={{ width: '320px' }}>
      <FormField label="Full name" htmlFor="fullname" required>
        <TextInput id="fullname" placeholder="Jane Doe" fullWidth />
      </FormField>
    </div>
  ),
};

export const FullForm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three fields stacked — confirms the vertical rhythm and the way ' +
          '`required`, `error`, and `hint` states sit alongside each other ' +
          'in a real form column.',
      },
    },
  },
  render: () => (
    <div style={{ width: '360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <FormField label="Full name" htmlFor="ff-name" required>
        <TextInput id="ff-name" placeholder="Jane Doe" fullWidth />
      </FormField>
      <FormField
        label="Email"
        htmlFor="ff-email"
        required
        status="error"
        message="This email is already in use."
      >
        <TextInput
          id="ff-email"
          defaultValue="jane@taken.com"
          status="error"
          fullWidth
        />
      </FormField>
      <FormField
        label="Password"
        htmlFor="ff-pw"
        status="hint"
        message="At least 8 characters with a number."
      >
        <TextInput id="ff-pw" type="password" placeholder="••••••••" fullWidth />
      </FormField>
    </div>
  ),
};
