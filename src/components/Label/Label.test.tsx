import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Label } from './Label';

describe('Label', () => {
  it('renders the label text', () => {
    render(<Label htmlFor="email">Email address</Label>);
    expect(screen.getByText('Email address')).toBeInTheDocument();
  });

  it('forwards htmlFor and clicking focuses the associated input', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Label htmlFor="email">Email address</Label>
        <input id="email" type="email" />
      </div>,
    );
    const label = screen.getByText('Email address');
    expect(label).toHaveAttribute('for', 'email');

    const input = screen.getByLabelText('Email address');
    await user.click(label);
    expect(document.activeElement).toBe(input);
  });

  it('shows an aria-hidden asterisk when required', () => {
    render(<Label required>Name</Label>);
    const asterisk = screen.getByText('*');
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render an asterisk when required is not set', () => {
    render(<Label>Name</Label>);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('forwards className alongside base classes', () => {
    render(
      <Label htmlFor="x" className="custom-extra">
        Hello
      </Label>,
    );
    const label = screen.getByText('Hello');
    expect(label).toHaveClass('custom-extra');
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-semibold');
  });

  it('forwards arbitrary props (e.g. data-*)', () => {
    render(
      <Label htmlFor="x" data-testid="lbl">
        Hi
      </Label>,
    );
    expect(screen.getByTestId('lbl')).toBeInTheDocument();
  });
});
