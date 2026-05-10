import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { userEvent, within, expect } from 'storybook/test';
import { RadioGroup, RadioGroupItem } from './Radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compound radio surface built on `@radix-ui/react-radio-group`. ' +
          '`RadioGroup` is the container (`role="radiogroup"`); ' +
          '`RadioGroupItem` is the individual control with optional `label` ' +
          'and `error` props. Radix supplies arrow-key selection, roving ' +
          'tabindex, and `aria-checked` semantics — set `aria-label` on the ' +
          'group when there is no visible heading.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Uncontrolled group with `defaultValue`. The whole label + control ' +
          'is the click target; arrow keys move selection between items.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Radix RadioGroup supplies role="radio" with aria-checked for each item.
    const optionA = canvas.getByRole('radio', { name: 'Option A' });
    expect(optionA).toBeInTheDocument();
    // Clicking Option B changes the selection — verify Radix state update fires correctly.
    const optionB = canvas.getByRole('radio', { name: 'Option B' });
    await userEvent.click(optionB);
    expect(optionB).toBeChecked();
  },
  render: () => (
    <RadioGroup defaultValue="a">
      <RadioGroupItem id="p-a" value="a" label="Option A" />
      <RadioGroupItem id="p-b" value="b" label="Option B" />
      <RadioGroupItem id="p-c" value="c" label="Option C" />
    </RadioGroup>
  ),
};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Controlled via `value` + `onValueChange`. The selected value ' +
          'echoes below the group so it is obvious that state lives outside ' +
          'the component.',
      },
    },
  },
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

export const StandaloneItems: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Items with no `label` prop — only the 18px controls render. Use ' +
          'this when the layout supplies labels separately (e.g. inside a ' +
          'comparison table). Names come from `aria-label` on each item, and ' +
          '`aria-label` on the group describes the choice.',
      },
    },
  },
  render: () => (
    <RadioGroup defaultValue="a" aria-label="Plan">
      <RadioGroupItem id="sa-a" value="a" aria-label="Plan A" />
      <RadioGroupItem id="sa-b" value="b" aria-label="Plan B" />
    </RadioGroup>
  ),
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Coverage of every visual state — checked / unchecked, disabled in ' +
          'both states, and the `error` border treatment. The error variant ' +
          'is purely visual; production use should pair it with announced ' +
          'error text via `FormField`.',
      },
    },
  },
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
