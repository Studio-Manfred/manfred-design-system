import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from './Label';
import { TextInput } from '../TextInput';
import { Checkbox } from '../Checkbox';
import { FormField } from '../FormField';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  parameters: { layout: 'centered' },
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  render: () => (
    <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Label htmlFor="email-default">Email address</Label>
      <TextInput id="email-default" placeholder="you@example.com" fullWidth />
    </div>
  ),
};

export const Required: Story = {
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
