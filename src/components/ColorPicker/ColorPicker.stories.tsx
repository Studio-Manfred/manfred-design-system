import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { useState } from 'react';
import { ColorPicker, DEFAULT_COLOR_PICKER_PALETTE } from './ColorPicker';

const meta: Meta<typeof ColorPicker> = {
  title: 'Components/ColorPicker',
  component: ColorPicker,
  parameters: {
    layout: 'centered',
    // Global preview disables 'region' because isolated stories aren't pages.
    // Re-enable here so axe reports landmark violations on this interactive component.
    a11y: {
      config: {
        rules: [{ id: 'region', enabled: true }],
      },
    },
    docs: {
      description: {
        component:
          'Accessible palette-based colour picker. Renders a horizontal ' +
          '`role="radiogroup"` of round swatches, each announced by its ' +
          'hex value. Radix `RadioGroup` handles arrow-key navigation, ' +
          'roving tab-index, and `aria-checked`. Set `allowCustom` to append ' +
          'a validated hex text input; Tab moves from the swatches into the ' +
          'input. Wrap in the DS `Popover` when a compact toolbar trigger is ' +
          'needed — the picker itself does not own a popover.',
      },
    },
  },
  argTypes: {
    value: {
      control: 'color',
      description:
        'Controlled hex value. Pair with `onChange`. When the value ' +
        "doesn't match a palette entry (case-insensitive), no swatch is " +
        'highlighted.',
    },
    palette: {
      control: 'object',
      description:
        'Ordered list of hex swatches. Defaults to the eight brand-adjacent hexes exported as `DEFAULT_COLOR_PICKER_PALETTE`.',
    },
    allowCustom: {
      control: 'boolean',
      description:
        'Append a hex text input that commits on blur or Enter. Invalid values set `aria-invalid="true"`.',
      table: { defaultValue: { summary: 'false' } },
    },
    label: {
      control: 'text',
      description:
        'Accessible name for the radiogroup. Defaults to "Colour"; superseded by `aria-labelledby`.',
    },
    size: {
      control: { type: 'inline-radio' },
      options: ['sm', 'md', 'lg'],
      description: 'Swatch pixel size — `sm` = 20px, `md` = 28px, `lg` = 36px.',
      table: { defaultValue: { summary: 'md' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable interaction and dim the entire control.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The default palette — eight brand-adjacent hexes covering the common whiteboard-stroke scenarios.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<string>(DEFAULT_COLOR_PICKER_PALETTE[2]);
    return (
      <ColorPicker value={value} onChange={setValue} label="Stroke colour" />
    );
  },
};

export const WithCustomHex: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Enables the trailing hex input. Type any 3- or 6-digit hex and blur or press Enter to commit; invalid values flip `aria-invalid` on the input.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<string>('#3355aa');
    return (
      <ColorPicker
        value={value}
        onChange={setValue}
        label="Stroke colour"
        allowCustom
      />
    );
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Dims the swatches and the hex input, and blocks interaction on all controls.',
      },
    },
  },
  render: () => (
    <ColorPicker
      value={DEFAULT_COLOR_PICKER_PALETTE[2]}
      onChange={() => {}}
      label="Stroke colour"
      disabled
      allowCustom
    />
  ),
};

export const CustomPalette: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Any hex list works — order is preserved and casing is echoed back to the consumer on selection.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<string>('#ff0000');
    return (
      <ColorPicker
        value={value}
        onChange={setValue}
        label="Highlight colour"
        palette={['#ff0000', '#ff7a00', '#ffe600', '#00c853', '#00b0ff', '#9b26b6']}
      />
    );
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The three swatch sizes side by side.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ColorPicker
        value={DEFAULT_COLOR_PICKER_PALETTE[2]}
        onChange={() => {}}
        label="Small"
        size="sm"
      />
      <ColorPicker
        value={DEFAULT_COLOR_PICKER_PALETTE[2]}
        onChange={() => {}}
        label="Medium (default)"
        size="md"
      />
      <ColorPicker
        value={DEFAULT_COLOR_PICKER_PALETTE[2]}
        onChange={() => {}}
        label="Large"
        size="lg"
      />
    </div>
  ),
};

// Play: focus first swatch, arrow-right, confirm the next swatch is checked.
export const KeyboardInteraction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Keyboard regression — focus the first swatch, press ArrowRight, confirm the next swatch is checked. Radix wires up roving tab-index and aria-checked.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<string>(DEFAULT_COLOR_PICKER_PALETTE[0]);
    return (
      <ColorPicker value={value} onChange={setValue} label="Stroke colour" />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('radio', {
      name: DEFAULT_COLOR_PICKER_PALETTE[0],
    });
    const third = canvas.getByRole('radio', {
      name: DEFAULT_COLOR_PICKER_PALETTE[2],
    });

    // Pointer click selects — guards against onValueChange wiring regressing
    // under Radix's roving-focus pattern.
    await userEvent.click(third);
    await canvas.findByRole('radio', {
      name: DEFAULT_COLOR_PICKER_PALETTE[2],
      checked: true,
    });

    // Keyboard parity — focus a swatch and confirm arrow-key moves selection.
    // Use direct focus() here: a real user would Tab into the group, but from
    // a post-click state Tab lands on the next focusable rather than the
    // radiogroup. The intent is "arrow-key advances selection when focused",
    // which focus() + toHaveFocus expresses precisely.
    first.focus();
    expect(first).toHaveFocus();
    // Hold the arrow across a tick — Radix uses a document keydown/keyup flag,
    // and user-event releases keys synchronously by default.
    await userEvent.keyboard('{ArrowRight>}');
    await new Promise((r) => setTimeout(r, 0));
    await userEvent.keyboard('{/ArrowRight}');
    await canvas.findByRole('radio', {
      name: DEFAULT_COLOR_PICKER_PALETTE[1],
      checked: true,
    });
  },
};
