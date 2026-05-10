import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from './Label';
import { TextInput } from '../TextInput';
import { Checkbox } from '../Checkbox';
import { FormField } from '../FormField';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Token-styled wrapper around `@radix-ui/react-label`. Pairs the ' +
          'visible label text with a form control via `htmlFor`, picks up ' +
          'click + focus delegation from Radix, and offers an optional ' +
          '`required` asterisk affordance. For the higher-level pattern that ' +
          'also renders helper / error text use `FormField`.',
      },
    },
  },
  argTypes: {
    htmlFor: {
      control: 'text',
      description:
        'ID of the form control this label describes. Required for click-to-focus and screen-reader pairing.',
    },
    required: {
      control: 'boolean',
      description:
        'Show the red asterisk affordance. Decorative only — set `required` / `aria-required` on the input too.',
      table: { defaultValue: { summary: 'false' } },
    },
    children: {
      control: 'text',
      description: 'Label text.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Plain label paired with a `TextInput` via `htmlFor`. Clicking the ' +
          'label text focuses the input — that pairing is what `Label` exists for.',
      },
    },
  },
  render: () => (
    <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Label htmlFor="email-default">Email address</Label>
      <TextInput id="email-default" placeholder="you@example.com" fullWidth />
    </div>
  ),
};

export const Required: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Adds the visual `*` affordance via `required`. The asterisk is ' +
          '`aria-hidden`; the input itself carries `required` so assistive ' +
          'tech announces the requirement.',
      },
    },
  },
  render: () => (
    <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Label htmlFor="email-required" required>
        Email address
      </Label>
      <TextInput id="email-required" placeholder="you@example.com" required fullWidth />
    </div>
  ),
};

export const WithCheckbox: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Label can pair with any control that takes an `id`, not just text ' +
          'inputs — here, a Checkbox. The clickable area extends across the ' +
          'label text so the target is comfortable for pointer + touch users.',
      },
    },
  },
  render: () => (
    <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Label htmlFor="terms-cb">Terms of service</Label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Checkbox id="terms-cb" />
        <Label htmlFor="terms-cb">I agree to the terms</Label>
      </div>
    </div>
  ),
};

export const WithFormField: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Side-by-side: a manually composed `Label` + `TextInput`, and the ' +
          '`FormField` higher-level wrapper that renders its own label. Use ' +
          '`FormField` when you also need helper / error text plumbing; reach ' +
          'for raw `Label` when the layout needs to differ.',
      },
    },
  },
  render: () => (
    <div
      style={{
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Label htmlFor="manual-email" required>
          Manual composition
        </Label>
        <TextInput
          id="manual-email"
          placeholder="Standalone Label + TextInput"
          required
          fullWidth
        />
      </div>

      <FormField label="FormField composition" htmlFor="ff-email" required>
        <TextInput
          id="ff-email"
          placeholder="FormField renders its own label"
          required
          fullWidth
        />
      </FormField>
    </div>
  ),
};
