import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// A11y coverage lives in Storybook (`ColorPicker.stories.tsx` runs axe on every
// story via the a11y addon). Matches DS convention — no direct axe-core import
// in unit tests. See MEMORY 2026-09-29 (STU-979) for the deviation rationale.
import { ColorPicker, DEFAULT_COLOR_PICKER_PALETTE } from './ColorPicker';

// Radix moves focus on a setTimeout and only *selects* the newly focused
// radio while an arrow key is still held (document keydown/keyup flag).
// user-event releases keys synchronously, so hold the key across a tick
// the way a real keypress does. Mirrors the pattern in Radio.test.tsx.
async function press(user: ReturnType<typeof userEvent.setup>, key: string) {
  await user.keyboard(`{${key}>}`);
  await act(() => new Promise((r) => setTimeout(r, 0)));
  await user.keyboard(`{/${key}}`);
}

const [BLACK, WHITE, BLUE, RED, GREEN, AMBER, PINK, BEIGE] =
  DEFAULT_COLOR_PICKER_PALETTE;

describe('ColorPicker', () => {
  it('renders a radiogroup with the default eight swatches', () => {
    render(<ColorPicker value={BLACK} onChange={() => {}} />);
    expect(screen.getByRole('radiogroup', { name: 'Colour' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(8);
  });

  it('marks the current value as checked', () => {
    render(<ColorPicker value={BLUE} onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: BLUE })).toHaveAttribute(
      'data-state',
      'checked',
    );
  });

  it('matches palette entries case-insensitively', () => {
    render(<ColorPicker value="#2C28EC" onChange={() => {}} />);
    // The palette entry `#2c28ec` is still marked checked despite the
    // uppercase incoming value.
    expect(screen.getByRole('radio', { name: BLUE })).toHaveAttribute(
      'data-state',
      'checked',
    );
  });

  it('honours the custom label as the radiogroup accessible name', () => {
    render(<ColorPicker value={BLACK} onChange={() => {}} label="Stroke colour" />);
    expect(
      screen.getByRole('radiogroup', { name: 'Stroke colour' }),
    ).toBeInTheDocument();
  });

  it('honours aria-labelledby and drops the default label', () => {
    render(
      <>
        <span id="picker-label">Fill</span>
        <ColorPicker
          value={BLACK}
          onChange={() => {}}
          aria-labelledby="picker-label"
        />
      </>,
    );
    expect(screen.getByRole('radiogroup', { name: 'Fill' })).toBeInTheDocument();
  });

  it('accepts a custom palette', () => {
    render(
      <ColorPicker
        value="#ff0000"
        onChange={() => {}}
        palette={['#ff0000', '#00ff00', '#0000ff']}
      />,
    );
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('fires onChange with the selected hex on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value={BLACK} onChange={onChange} />);
    await user.click(screen.getByRole('radio', { name: BLUE }));
    expect(onChange).toHaveBeenCalledWith(BLUE);
  });

  it('preserves palette-entry casing on selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ColorPicker
        value="#000000"
        onChange={onChange}
        palette={['#FF0000', '#00FF00']}
      />,
    );
    await user.click(screen.getByRole('radio', { name: '#FF0000' }));
    expect(onChange).toHaveBeenCalledWith('#FF0000');
  });

  describe('keyboard', () => {
    it('Tab enters the group on the checked swatch', async () => {
      const user = userEvent.setup();
      render(<ColorPicker value={BLUE} onChange={() => {}} />);
      await user.tab();
      expect(screen.getByRole('radio', { name: BLUE })).toHaveFocus();
    });

    it('the group is a single tab stop', async () => {
      const user = userEvent.setup();
      render(
        <>
          <ColorPicker value={BLACK} onChange={() => {}} />
          <button type="button">After</button>
        </>,
      );
      await user.tab();
      expect(screen.getByRole('radio', { name: BLACK })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('selects the next swatch on ArrowRight', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ColorPicker value={BLACK} onChange={onChange} />);
      await user.tab();
      await press(user, 'ArrowRight');
      expect(screen.getByRole('radio', { name: WHITE })).toHaveFocus();
      expect(onChange).toHaveBeenLastCalledWith(WHITE);
    });

    it('selects the previous swatch on ArrowLeft', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ColorPicker value={WHITE} onChange={onChange} />);
      await user.tab();
      await press(user, 'ArrowLeft');
      expect(screen.getByRole('radio', { name: BLACK })).toHaveFocus();
      expect(onChange).toHaveBeenLastCalledWith(BLACK);
    });

    it('wraps at the end (ArrowRight on last swatch → first)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ColorPicker value={BEIGE} onChange={onChange} />);
      await user.tab();
      await press(user, 'ArrowRight');
      expect(screen.getByRole('radio', { name: BLACK })).toHaveFocus();
      expect(onChange).toHaveBeenLastCalledWith(BLACK);
    });

    it('wraps at the start (ArrowLeft on first swatch → last)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ColorPicker value={BLACK} onChange={onChange} />);
      await user.tab();
      await press(user, 'ArrowLeft');
      expect(screen.getByRole('radio', { name: BEIGE })).toHaveFocus();
      expect(onChange).toHaveBeenLastCalledWith(BEIGE);
    });

    it('activates the focused swatch on Space', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ColorPicker value={BLACK} onChange={onChange} />);
      const target = screen.getByRole('radio', { name: GREEN });
      target.focus();
      await user.keyboard(' ');
      expect(onChange).toHaveBeenCalledWith(GREEN);
    });

    // WAI-ARIA radiogroup pattern selects on Space (and arrow keys); Enter is
    // not part of the contract. Radix RadioGroup follows the spec — this test
    // guards the DS's deviation note in STU-979: consumers who need Enter
    // wrap the swatch group inside a form-level submit or a Popover trigger.
    it('does not select on Enter (WAI-ARIA radiogroup contract)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ColorPicker value={BLACK} onChange={onChange} />);
      const target = screen.getByRole('radio', { name: RED });
      target.focus();
      await user.keyboard('{Enter}');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  it('disabled blocks click interaction', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value={BLACK} onChange={onChange} disabled />);
    await user.click(screen.getByRole('radio', { name: AMBER }));
    expect(onChange).not.toHaveBeenCalled();
  });

  describe('allowCustom', () => {
    it('does not render the hex input by default', () => {
      render(<ColorPicker value={BLACK} onChange={() => {}} />);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('renders a hex input when allowCustom is set', () => {
      render(<ColorPicker value={BLACK} onChange={() => {}} allowCustom />);
      expect(
        screen.getByRole('textbox', { name: 'Custom colour hex' }),
      ).toBeInTheDocument();
    });

    it('commits a valid hex on blur', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ColorPicker value={BLACK} onChange={onChange} allowCustom />);
      const input = screen.getByRole('textbox', { name: 'Custom colour hex' });
      await user.clear(input);
      await user.type(input, '#abcdef');
      await user.tab();
      expect(onChange).toHaveBeenCalledWith('#abcdef');
    });

    it('commits a valid hex on Enter', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ColorPicker value={BLACK} onChange={onChange} allowCustom />);
      const input = screen.getByRole('textbox', { name: 'Custom colour hex' });
      await user.clear(input);
      await user.type(input, '#abcdef{Enter}');
      expect(onChange).toHaveBeenCalledWith('#abcdef');
    });

    it('marks invalid hex with aria-invalid on blur and does not call onChange', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ColorPicker value={BLACK} onChange={onChange} allowCustom />);
      const input = screen.getByRole('textbox', { name: 'Custom colour hex' });
      await user.clear(input);
      await user.type(input, 'notahex');
      await user.tab();
      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('applies the hex pattern attribute for native validation', () => {
      render(<ColorPicker value={BLACK} onChange={() => {}} allowCustom />);
      const input = screen.getByRole('textbox', { name: 'Custom colour hex' });
      expect(input).toHaveAttribute('pattern', '^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$');
    });

    it('Tab from a swatch reaches the hex input', async () => {
      const user = userEvent.setup();
      render(<ColorPicker value={BLACK} onChange={() => {}} allowCustom />);
      screen.getByRole('radio', { name: BLACK }).focus();
      await user.tab();
      expect(
        screen.getByRole('textbox', { name: 'Custom colour hex' }),
      ).toHaveFocus();
    });

    it('resyncs the hex input when the controlled value changes', async () => {
      const { rerender } = render(
        <ColorPicker value={BLACK} onChange={() => {}} allowCustom />,
      );
      const input = screen.getByRole('textbox', {
        name: 'Custom colour hex',
      }) as HTMLInputElement;
      expect(input.value).toBe(BLACK);
      rerender(<ColorPicker value={PINK} onChange={() => {}} allowCustom />);
      expect(input.value).toBe(PINK);
    });
  });

});
