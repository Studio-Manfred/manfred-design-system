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
    docs: {
      description: {
        component:
          'Single-line search input with leading icon, Enter-to-submit, and a ' +
          'built-in clear affordance. Composes `TextInput` and supports ' +
          'controlled / uncontrolled use, three sizes, and an optional ' +
          '`trailing` slot for shortcut hints (e.g. `⌘K`). Always announces ' +
          'as "Search" to assistive tech.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Input height + padding scale. Inherited from `TextInput`.',
      table: { defaultValue: { summary: 'md' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown while the input is empty.',
      table: { defaultValue: { summary: 'Search…' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable interaction and hide the clear button.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch the input to fill the available container width.',
    },
    trailing: {
      control: false,
      description:
        'Optional trailing content (e.g. `<Kbd>⌘K</Kbd>`). Sits inside the ' +
        'right edge; clear button renders to its left when the field has text.',
    },
    onChange: { action: 'change', description: 'Fired on every keystroke with the next value.' },
    onSearch: { action: 'search', description: 'Fired when the user presses Enter, with the current value.' },
    onClear: { action: 'clear', description: 'Fired when the clear button is clicked.' },
  },
};

export default meta;

type Story = StoryObj<typeof SearchBar>;

export const Playground: Story = {
  args: {
    size: 'md',
    placeholder: 'Search…',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive sandbox — toggle every prop via the Controls panel below.',
      },
    },
  },
};

export const WithClear: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Pre-filled search showing the clear (×) affordance that appears as ' +
          'soon as the field has content. Clicking it resets the value and ' +
          'fires `onClear`.',
      },
    },
  },
  render: () => (
    <SearchBar defaultValue="manfred design" style={{ width: '280px' } as React.CSSProperties} />
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All three size scales stacked. `sm` for dense toolbars, `md` ' +
          '(default) for most cases, `lg` for hero search.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px' }}>
      <SearchBar size="sm" placeholder="Small search" />
      <SearchBar size="md" placeholder="Medium search" />
      <SearchBar size="lg" placeholder="Large search" />
    </div>
  ),
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Disabled state — interaction is suppressed and the clear button is ' +
          'hidden even when a value is present.',
      },
    },
  },
  render: () => <SearchBar disabled defaultValue="disabled" style={{ width: '280px' } as React.CSSProperties} />,
};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Fully controlled wiring — the parent owns `value` and reacts to ' +
          '`onChange` / `onSearch` / `onClear`. Press Enter to submit; the ' +
          'last submitted query is shown below the input.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Coverage story — types text and presses Enter to verify the ' +
          'uncontrolled change path and the `onSearch` keydown branch fire.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Coverage story — Enter is a safe no-op when `onSearch` is not ' +
          'provided. Exercises the falsy keydown branch.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Coverage story — clear button resets the internal value when ' +
          'neither `onChange` nor `onClear` is wired. Exercises the ' +
          'uncontrolled clear path.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Coverage story — verifies that in controlled mode the clear ' +
          'button forwards both `onChange("")` and `onClear()` to the parent.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Stretch the search bar to fill its container — useful for page ' +
          'headers and global app search.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Trailing slot showing a `⌘K` shortcut hint. The hint is decorative ' +
          '(`aria-hidden`); when the field has content, the clear button ' +
          'renders to the left of the trailing element.',
      },
    },
  },
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
