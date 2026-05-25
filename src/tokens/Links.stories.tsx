import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';

const meta: Meta = {
  title: 'Foundation/Tokens/Links',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Anchor link tokens and the `.manfred-prose` wrapper. The DS owns ' +
          'the brand link decision (peach-on-blue, brand-blue-on-white, plus ' +
          'underline + 4px offset) so downstream surfaces — including raw HTML ' +
          'injected through React\'s escape hatch from a CMS — pick up the right ' +
          'treatment by adding `manfred-prose` to a wrapper. See `tokens.css` ' +
          'for the four `--color-text-link*` tokens.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const proseText: React.CSSProperties = {
  fontFamily: 'var(--font-family-base)',
  fontSize: 'var(--font-size-md)',
  lineHeight: 'var(--line-height-relaxed)',
  margin: 0,
};

export const OnWhite: Story = {
  name: 'On white surface',
  parameters: {
    docs: {
      description: {
        story:
          'Default treatment: brand-blue link colour with underline + 4px offset. ' +
          'Hover lifts to `--blue-600`. Apply by wrapping prose surfaces in ' +
          '`<div className="manfred-prose">`.',
      },
    },
  },
  render: () => (
    <div
      className="manfred-prose"
      style={{
        padding: 'var(--space-6)',
        maxWidth: 560,
        background: 'var(--color-bg-default)',
      }}
    >
      <p style={proseText}>
        Manfred is a small studio. <a href="#example">Get in touch</a> if you have a
        product problem worth shaping, or read about{' '}
        <a href="#mission">our mission</a> first.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Get in touch' });
    const styles = window.getComputedStyle(link);
    expect(styles.textDecorationLine).toContain('underline');
    expect(styles.textUnderlineOffset).toBe('4px');
  },
};

export const OnBrand: Story = {
  name: 'On brand-blue surface',
  parameters: {
    docs: {
      description: {
        story:
          'Add `manfred-prose--on-brand` alongside `manfred-prose` when the ' +
          'wrapper sits on a brand-blue surface. Default colour swaps to peach ' +
          '(`--pink`); hover lifts to white. Identity-fixed in both light and dark ' +
          'mode — the brand surface itself does not theme-flip.',
      },
    },
  },
  render: () => (
    <div
      className="manfred-prose manfred-prose--on-brand"
      style={{
        padding: 'var(--space-6)',
        maxWidth: 560,
        background: 'var(--color-business-blue)',
        color: 'var(--color-text-on-brand)',
      }}
    >
      <p style={proseText}>
        Say hi to <a href="#hakan">@håkan</a>, <a href="#david">@david</a>, or{' '}
        <a href="#moa">@moa</a> — we read everything that lands in the inbox.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: '@håkan' });
    const styles = window.getComputedStyle(link);
    expect(styles.textDecorationLine).toContain('underline');
    expect(styles.textUnderlineOffset).toBe('4px');
  },
};
