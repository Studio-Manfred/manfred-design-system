import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Determinate progress bar built on `@radix-ui/react-progress`. ' +
          'Five colour variants (`default` / `brand` / `success` / `warning` ' +
          '/ `error`), three sizes, an optional caption with percentage ' +
          'readout, and an optional animated stripes overlay for live ' +
          'operations. Radix supplies `role="progressbar"` semantics — pass ' +
          '`label` so AT users hear a meaningful caption.',
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current progress (0–100). Values outside the range are clamped.',
    },
    variant: {
      control: 'select',
      options: ['default', 'brand', 'success', 'warning', 'error'],
      description:
        'Fill colour. `brand` for normal progress; state variants for ' +
        'validation / upload outcomes; `default` for a quiet neutral.',
      table: { defaultValue: { summary: 'brand' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Track height. `sm` = 4px, `md` = 8px (default), `lg` = 12px.',
      table: { defaultValue: { summary: 'md' } },
    },
    label: {
      control: 'text',
      description: 'Visible caption above the track. Also drives the `aria-label` on the Root.',
    },
    showValue: {
      control: 'boolean',
      description: 'Show the percentage readout to the right of the label.',
      table: { defaultValue: { summary: 'false' } },
    },
    animated: {
      control: 'boolean',
      description:
        'Add a diagonal-stripes overlay that animates left-to-right. ' +
        'Decorative only — fill width still tracks `value`.',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Playground: Story = {
  args: {
    value: 65,
    variant: 'brand',
    size: 'md',
    label: 'Upload progress',
    showValue: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive sandbox — drag the value range, swap variant + size, ' +
          'toggle the caption + percentage readout via the Controls panel.',
      },
    },
  },
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All five colour variants side by side at fixed values. The state ' +
          'variants (`success` / `warning` / `error`) exist for outcome ' +
          'feedback — pair with the matching status copy in the label.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px' }}>
      <ProgressBar value={70} variant="brand" label="Brand" showValue />
      <ProgressBar value={85} variant="success" label="Success" showValue />
      <ProgressBar value={45} variant="warning" label="Warning" showValue />
      <ProgressBar value={30} variant="error" label="Error" showValue />
      <ProgressBar value={60} variant="default" label="Default" showValue />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three height scales. Use `sm` inside dense list rows or table ' +
          'cells, `md` for most page-level progress, `lg` for prominent ' +
          'standalone progress on a hero / dashboard surface.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '400px' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-family-base)', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Small (4px)</div>
        <ProgressBar value={60} size="sm" />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-family-base)', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Medium (8px)</div>
        <ProgressBar value={60} size="md" />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-family-base)', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Large (12px)</div>
        <ProgressBar value={60} size="lg" />
      </div>
    </div>
  ),
};

export const Animated: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Adds the diagonal-stripes overlay via `animated`. Use this when an ' +
          'operation is genuinely in flight and the user should see motion ' +
          '— the fill width still tracks `value` so progress stays honest.',
      },
    },
  },
  render: () => (
    <div style={{ width: '400px' }}>
      <ProgressBar value={65} animated label="Processing…" />
    </div>
  ),
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Wired to a native `<input type="range">` so you can scrub the ' +
          'value and see the fill respond in real time. Useful for sanity-' +
          'checking the 250ms transform transition during review.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(40);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px' }}>
        <ProgressBar value={value} label="File upload" showValue />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          style={{ width: '100%' }}
          aria-label="Adjust progress value"
        />
      </div>
    );
  },
};
