import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    expect(r.className).toMatch(/var\(--color-feedback-error-fg\)/);
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
});
