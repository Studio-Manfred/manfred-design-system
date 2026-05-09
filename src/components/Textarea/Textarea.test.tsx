import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea placeholder="Type…" />);
    const el = screen.getByPlaceholderText('Type…');
    expect(el).toBeInTheDocument();
    expect(el.tagName).toBe('TEXTAREA');
  });

  it('exposes the textbox role', () => {
    render(<Textarea aria-label="Bio" />);
    expect(screen.getByRole('textbox', { name: 'Bio' })).toBeInTheDocument();
  });

  it('forwards placeholder and value', () => {
    render(<Textarea placeholder="p" value="hello" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('p')).toHaveValue('hello');
  });

  it('types into the textarea (controlled via onChange)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea placeholder="x" onChange={onChange} />);
    await user.type(screen.getByPlaceholderText('x'), 'hi');
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByPlaceholderText('x')).toHaveValue('hi');
  });

  it('sets aria-invalid when status=error', () => {
    render(<Textarea status="error" defaultValue="x" placeholder="p" />);
    expect(screen.getByPlaceholderText('p')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does NOT set aria-invalid for success', () => {
    render(<Textarea status="success" defaultValue="x" placeholder="p" />);
    expect(screen.getByPlaceholderText('p')).not.toHaveAttribute('aria-invalid');
  });

  it('does NOT set aria-invalid for default', () => {
    render(<Textarea defaultValue="x" placeholder="p" />);
    expect(screen.getByPlaceholderText('p')).not.toHaveAttribute('aria-invalid');
  });

  it('forwards disabled to the textarea', () => {
    render(<Textarea disabled placeholder="p" />);
    expect(screen.getByPlaceholderText('p')).toBeDisabled();
  });

  it.each([
    ['sm', 'min-h-16'],
    ['md', 'min-h-20'],
    ['lg', 'min-h-24'],
  ] as const)('applies %s size to the wrapper', (size, cls) => {
    const { container } = render(<Textarea size={size} placeholder="p" />);
    expect(container.firstElementChild!.className).toContain(cls);
  });

  it('fullWidth applies w-full to the wrapper', () => {
    const { container } = render(<Textarea fullWidth placeholder="p" />);
    expect(container.firstElementChild!.className).toContain('w-full');
  });

  it('forwards ref to the textarea', () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea ref={ref} placeholder="p" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('forwards rows attribute (default 3)', () => {
    render(<Textarea placeholder="p" />);
    expect(screen.getByPlaceholderText('p')).toHaveAttribute('rows', '3');
  });

  it('respects custom rows', () => {
    render(<Textarea placeholder="p" rows={8} />);
    expect(screen.getByPlaceholderText('p')).toHaveAttribute('rows', '8');
  });
});
