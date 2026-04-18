import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: { layout: 'padded' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    variant: { control: 'select', options: ['default', 'brand', 'success', 'warning', 'error'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
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
};

export const Variants: Story = {
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
  render: () => (
    <div style={{ width: '400px' }}>
      <ProgressBar value={65} animated label="Processing…" />
    </div>
  ),
};

export const Interactive: Story = {
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
