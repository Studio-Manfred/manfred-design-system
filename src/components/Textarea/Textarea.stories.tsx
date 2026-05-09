import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { Textarea } from './Textarea';
import { FormField } from '../FormField';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    status: { control: 'select', options: ['default', 'error', 'success'] },
  },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {
  args: {
    size: 'md',
    status: 'default',
    placeholder: 'Tell us a bit about yourself…',
  },
  render: (args) => (
    <div style={{ width: '360px' }}>
      <Textarea {...args} fullWidth />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ width: '360px' }}>
      <FormField
        label="Bio"
        htmlFor="bio"
        message="Markdown is supported."
        status="hint"
      >
        <Textarea id="bio" placeholder="A few sentences about yourself…" fullWidth />
      </FormField>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '320px' }}>
      <Textarea placeholder="Small" size="sm" fullWidth />
      <Textarea placeholder="Medium" size="md" fullWidth />
      <Textarea placeholder="Large" size="lg" fullWidth />
    </div>
  ),
};

export const Statuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '320px' }}>
      <Textarea placeholder="Default" status="default" fullWidth />
      <Textarea
        placeholder="Error state"
        status="error"
        defaultValue="Too short."
        fullWidth
      />
      <Textarea
        placeholder="Success state"
        status="success"
        defaultValue="Looks good!"
        fullWidth
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: '320px' }}>
      <Textarea
        placeholder="Disabled"
        disabled
        defaultValue="You can't edit this right now."
        fullWidth
      />
    </div>
  ),
};

export const LongContent: Story = {
  render: () => (
    <div style={{ width: '420px' }}>
      <Textarea
        rows={5}
        defaultValue={`Manfred is a small studio that helps teams ship product. We work across discovery, design, and implementation — bringing UX strategy, design systems, and engineering together.

The Textarea component is built to handle long, multi-line input. Drag the handle in the bottom-right to resize vertically.`}
        fullWidth
      />
    </div>
  ),
};

// Play: focus, type into the textarea, assert the value reflects the typed text.
export const KeyboardInteraction: Story = {
  render: () => <Textarea aria-label="Note" placeholder="Write a note…" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Note' });
    await userEvent.click(textarea);
    await userEvent.type(textarea, 'Hello Manfred');
    expect((textarea as HTMLTextAreaElement).value).toBe('Hello Manfred');
  },
};
