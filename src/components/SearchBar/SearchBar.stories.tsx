import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import React, { useState } from 'react';
import { SearchBar } from './SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
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
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;

type Story = StoryObj<typeof SearchBar>;

export const Playground: Story = {
  args: {
    size: 'md',
    placeholder: 'Search…',
  },
};

export const WithClear: Story = {
  render: () => (
    <SearchBar defaultValue="manfred design" style={{ width: '280px' } as React.CSSProperties} />
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px' }}>
      <SearchBar size="sm" placeholder="Small search" />
      <SearchBar size="md" placeholder="Medium search" />
      <SearchBar size="lg" placeholder="Large search" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => <SearchBar disabled defaultValue="disabled" style={{ width: '280px' } as React.CSSProperties} />,
};

export const Controlled: Story = {
  render: () => {
    const [query, setQuery] = useState('');
    const [lastSearch, setLastSearch] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={setLastSearch}
          onClear={() => setQuery('')}
          placeholder="Type and press Enter…"
          fullWidth
        />
        {lastSearch && (
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-family-base)',
            }}
          >
            Last search: "{lastSearch}"
          </span>
        )}
      </div>
    );
  },
};

// ── Coverage-improving stories ───────────────────────────────────────────────

// Play: type text + Enter — covers handleChange (uncontrolled: setInternalValue)
// and handleKeyDown (e.key === 'Enter' && onSearch → truthy branch).
export const TypeAndSearch: Story = {
  render: () => {
    const [lastSearch, setLastSearch] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
        <SearchBar onSearch={setLastSearch} placeholder="Type and press Enter…" />
        {lastSearch && <span>Last: {lastSearch}</span>}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Search' });
    await userEvent.type(input, 'hello world');
    await userEvent.keyboard('{Enter}');
    await canvas.findByText('Last: hello world');
  },
};

// Play: type text + Enter with no onSearch prop — covers handleKeyDown
// (e.key === 'Enter' && onSearch → falsy branch, no-op).
export const TypeNoSearch: Story = {
  render: () => (
    <SearchBar style={{ width: '280px' } as React.CSSProperties} placeholder="No onSearch prop" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Search' });
    await userEvent.type(input, 'test');
    await userEvent.keyboard('{Enter}');
  },
};

// Play: type then click Clear — covers handleClear uncontrolled path
// (setInternalValue('') called, onChange/onClear undefined).
export const ClearUncontrolled: Story = {
  render: () => (
    <SearchBar style={{ width: '280px' } as React.CSSProperties} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Search' });
    await userEvent.type(input, 'test query');
    const clearBtn = await canvas.findByRole('button', { name: 'Clear search' });
    await userEvent.click(clearBtn);
  },
};

// Play: type in controlled mode then click Clear — covers handleChange (controlled:
// no setInternalValue) and handleClear controlled path (onChange + onClear called).
export const ClearControlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <SearchBar
        value={value}
        onChange={setValue}
        onClear={() => setValue('')}
        style={{ width: '280px' } as React.CSSProperties}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Search' });
    await userEvent.type(input, 'hello');
    const clearBtn = await canvas.findByRole('button', { name: 'Clear search' });
    await userEvent.click(clearBtn);
  },
};

// fullWidth renders the fullWidth CSS class
export const FullWidth: Story = {
  render: () => (
    <div style={{ width: '400px' }}>
      <SearchBar fullWidth placeholder="Full-width search" />
    </div>
  ),
};

// New v0.10 — `trailing` slot. Most common consumer is a Kbd shortcut hint;
// any decorative or interactive element works. Clear button (when input
// has a value) renders to the LEFT of trailing — closest to the text.
export const WithTrailing: Story = {
  render: () => (
    <div style={{ width: '280px' }}>
      <SearchBar
        fullWidth
        placeholder="Search…"
        trailing={
          <kbd
            aria-hidden="true"
            className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 font-mono text-[0.6875rem] bg-secondary text-muted-foreground border border-border rounded-[var(--radius-sm)]"
          >
            ⌘K
          </kbd>
        }
      />
    </div>
  ),
};
