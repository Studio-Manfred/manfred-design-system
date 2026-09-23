import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('renders a text input', () => {
    render(<TextInput placeholder="Type…" />);
    expect(screen.getByPlaceholderText('Type…')).toBeInTheDocument();
  });

  it('types into the input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextInput placeholder="x" onChange={onChange} />);
    await user.type(screen.getByPlaceholderText('x'), 'hi');
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByPlaceholderText('x')).toHaveValue('hi');
  });

  it('sets aria-invalid when status=error', () => {
    render(<TextInput status="error" defaultValue="x" placeholder="p" />);
    expect(screen.getByPlaceholderText('p')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does NOT set aria-invalid for success', () => {
    render(<TextInput status="success" defaultValue="x" placeholder="p" />);
    expect(screen.getByPlaceholderText('p')).not.toHaveAttribute('aria-invalid');
  });

  it('disabled state', () => {
    render(<TextInput disabled placeholder="p" />);
    expect(screen.getByPlaceholderText('p')).toBeDisabled();
  });

  it.each([
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-12'],
  ] as const)('applies %s size', (size, cls) => {
    const { container } = render(<TextInput size={size} placeholder="p" />);
    expect(container.firstElementChild!.className).toContain(cls);
  });

  it('renders leading icon', () => {
    const { container } = render(<TextInput leadingIcon="search" placeholder="p" />);
    expect(container.querySelectorAll('svg').length).toBe(1);
  });

  it('renders trailing icon', () => {
    const { container } = render(<TextInput trailingIcon="x" placeholder="p" />);
    expect(container.querySelectorAll('svg').length).toBe(1);
  });

  it('renders both leading + trailing icons', () => {
    const { container } = render(
      <TextInput leadingIcon="search" trailingIcon="x" placeholder="p" />,
    );
    expect(container.querySelectorAll('svg').length).toBe(2);
  });

  it('forwards ref to the input', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<TextInput ref={ref} placeholder="p" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('fullWidth applies w-full to wrapper', () => {
    const { container } = render(<TextInput fullWidth placeholder="p" />);
    expect(container.firstElementChild!.className).toContain('w-full');
  });

  describe('keyboard and semantics', () => {
    it('Tab focuses the inner input, skipping a disabled one', async () => {
      const user = userEvent.setup();
      render(
        <>
          <TextInput aria-label="Disabled" disabled />
          <TextInput aria-label="Email" leadingIcon="search" />
        </>,
      );
      await user.tab();
      expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus();
    });

    it('error status plus aria-describedby exposes the error message to AT', () => {
      render(
        <>
          <label htmlFor="em">Email</label>
          <TextInput id="em" status="error" aria-describedby="em-error" />
          <p id="em-error">Enter a valid email address</p>
        </>,
      );
      const input = screen.getByRole('textbox', { name: 'Email' });
      expect(input).toBeInvalid();
      expect(input).toHaveAccessibleDescription('Enter a valid email address');
    });

    it('decorative icons are aria-hidden and do not leak into the name', () => {
      const { container } = render(
        <TextInput aria-label="Search" leadingIcon="search" trailingIcon="x" />,
      );
      for (const svg of container.querySelectorAll('svg')) {
        expect(svg.closest('[aria-hidden="true"]')).not.toBeNull();
      }
      expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
    });
  });
});
