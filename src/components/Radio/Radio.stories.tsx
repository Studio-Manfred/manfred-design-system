import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from './Radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: { layout: 'centered' },
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Playground: Story = {
  render: () => (
    <RadioGroup defaultValue="a">
      <RadioGroupItem id="p-a" value="a" label="Option A" />
      <RadioGroupItem id="p-b" value="b" label="Option B" />
      <RadioGroupItem id="p-c" value="c" label="Option C" />
    </RadioGroup>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('a');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <RadioGroup value={value} onValueChange={setValue}>
          <RadioGroupItem id="c-a" value="a" label="Option A" />
          <RadioGroupItem id="c-b" value="b" label="Option B" />
          <RadioGroupItem id="c-c" value="c" label="Option C" />
        </RadioGroup>
        <span
          style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-base)',
            marginTop: '4px',
          }}
        >
          Selected: {value}
        </span>
      </div>
    );
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <RadioGroup defaultValue="checked">
        <RadioGroupItem id="s-un" value="unchecked" label="Unchecked" />
        <RadioGroupItem id="s-ch" value="checked" label="Checked" />
      </RadioGroup>
      <RadioGroup defaultValue="d-checked">
        <RadioGroupItem id="s-du" value="d-unchecked" label="Disabled unchecked" disabled />
        <RadioGroupItem id="s-dc" value="d-checked" label="Disabled checked" disabled />
      </RadioGroup>
      <RadioGroup>
        <RadioGroupItem id="s-err" value="err" label="Error state" error />
      </RadioGroup>
    </div>
  ),
};
