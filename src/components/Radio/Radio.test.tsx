import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup, RadioGroupItem } from './Radio';

function Group({ onValueChange }: { onValueChange?: (v: string) => void }) {
  return (
    <RadioGroup defaultValue="a" onValueChange={onValueChange}>
      <RadioGroupItem id="a" value="a" label="A" />
      <RadioGroupItem id="b" value="b" label="B" />
      <RadioGroupItem id="c" value="c" label="C" />
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('renders three radios with labels', () => {
    render(<Group />);
    expect(screen.getByRole('radio', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'B' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'C' })).toBeInTheDocument();
  });

  it('default value is pre-selected', () => {
    render(<Group />);
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('data-state', 'checked');
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('data-state', 'unchecked');
  });

  it('clicking a radio changes selection and fires onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Group onValueChange={onValueChange} />);
    await user.click(screen.getByRole('radio', { name: 'B' }));
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('radio', { name: 'B' })).toHaveAttribute('data-state', 'checked');
  });

  it('marks aria-invalid when error is set on an item', () => {
    render(
      <RadioGroup>
        <RadioGroupItem id="x" value="x" label="X" error />
      </RadioGroup>,
    );
    const r = screen.getByRole('radio', { name: 'X' });
    expect(r).toHaveAttribute('aria-invalid', 'true');
    expect(r.className).toMatch(/var\(--color-feedback-error-fg\)/);
  });

  it('omits aria-invalid when error is not set', () => {
    render(
      <RadioGroup>
        <RadioGroupItem id="x" value="x" label="X" />
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'X' })).not.toHaveAttribute('aria-invalid');
  });

  it('lets a consumer-passed aria-invalid win over the error prop', () => {
    render(
      <RadioGroup>
        <RadioGroupItem id="x" value="x" label="X" error aria-invalid={false} />
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'X' })).toHaveAttribute('aria-invalid', 'false');
  });

  it('renders labelless RadioGroupItem and routes className to it', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="n" className="labelless-class" />
      </RadioGroup>,
    );
    const r = screen.getByRole('radio');
    expect(r.className).toContain('labelless-class');
    expect(screen.queryByRole('label' as never)).not.toBeInTheDocument();
  });

  it('disabled item blocks clicks', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup onValueChange={onValueChange}>
        <RadioGroupItem id="d" value="d" label="D" disabled />
      </RadioGroup>,
    );
    await user.click(screen.getByRole('radio', { name: 'D' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  // Keyboard. The Default play function only clicks; these cover the
  // WAI-ARIA radio group contract (single tab stop, arrows move + select, wrap).
  describe('keyboard', () => {
    // Radix moves focus on a setTimeout and only *selects* the newly focused
    // radio while an arrow key is still held (document keydown/keyup flag).
    // user-event releases keys synchronously, so hold the key across a tick
    // the way a real keypress does.
    async function press(user: ReturnType<typeof userEvent.setup>, key: string) {
      await user.keyboard(`{${key}>}`);
      await act(() => new Promise((r) => setTimeout(r, 0)));
      await user.keyboard(`{/${key}}`);
    }

    function Keyed({
      defaultValue,
      disabledB,
      onValueChange,
    }: {
      defaultValue?: string;
      disabledB?: boolean;
      onValueChange?: (v: string) => void;
    }) {
      return (
        <>
          <RadioGroup aria-label="Letters" defaultValue={defaultValue} onValueChange={onValueChange}>
            <RadioGroupItem id="ka" value="a" label="A" />
            <RadioGroupItem id="kb" value="b" label="B" disabled={disabledB} />
            <RadioGroupItem id="kc" value="c" label="C" />
          </RadioGroup>
          <button type="button">After</button>
        </>
      );
    }

    it('Tab enters the group on the checked radio', async () => {
      const user = userEvent.setup();
      render(<Keyed defaultValue="b" />);
      await user.tab();
      expect(screen.getByRole('radio', { name: 'B' })).toHaveFocus();
    });

    it('the group is a single tab stop', async () => {
      const user = userEvent.setup();
      render(<Keyed defaultValue="a" />);
      await user.tab();
      expect(screen.getByRole('radio', { name: 'A' })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('ArrowDown / ArrowUp move focus and selection', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Keyed defaultValue="a" onValueChange={onValueChange} />);
      await user.tab();
      await press(user, 'ArrowDown');
      const b = screen.getByRole('radio', { name: 'B' });
      expect(b).toHaveFocus();
      expect(b).toBeChecked();
      expect(onValueChange).toHaveBeenLastCalledWith('b');
      await press(user, 'ArrowUp');
      expect(screen.getByRole('radio', { name: 'A' })).toHaveFocus();
      expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
    });

    it('arrow keys wrap from last to first and first to last', async () => {
      const user = userEvent.setup();
      render(<Keyed defaultValue="c" />);
      await user.tab();
      await press(user, 'ArrowDown');
      expect(screen.getByRole('radio', { name: 'A' })).toHaveFocus();
      expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
      await press(user, 'ArrowUp');
      expect(screen.getByRole('radio', { name: 'C' })).toHaveFocus();
      expect(screen.getByRole('radio', { name: 'C' })).toBeChecked();
    });

    it('ArrowRight / ArrowLeft also move selection', async () => {
      const user = userEvent.setup();
      render(<Keyed defaultValue="a" />);
      await user.tab();
      await press(user, 'ArrowRight');
      expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
      await press(user, 'ArrowLeft');
      expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
    });

    it('arrow keys skip a disabled radio', async () => {
      const user = userEvent.setup();
      render(<Keyed defaultValue="a" disabledB />);
      await user.tab();
      await press(user, 'ArrowDown');
      expect(screen.getByRole('radio', { name: 'C' })).toHaveFocus();
      expect(screen.getByRole('radio', { name: 'C' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'B' })).not.toBeChecked();
    });

    it('Space selects the focused radio when the group has no value', async () => {
      const user = userEvent.setup();
      render(<Keyed />);
      await user.tab();
      const a = screen.getByRole('radio', { name: 'A' });
      expect(a).toHaveFocus();
      expect(a).not.toBeChecked();
      await user.keyboard(' ');
      expect(a).toBeChecked();
    });

    it('exposes the group with role radiogroup and its label', () => {
      render(<Keyed defaultValue="a" />);
      expect(screen.getByRole('radiogroup', { name: 'Letters' })).toBeInTheDocument();
    });
  });
});
