import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from './Separator';

describe('Separator', () => {
  it('renders with role="separator" by default', () => {
    render(<Separator data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toHaveAttribute('role', 'separator');
  });

  it('defaults to horizontal orientation (aria-orientation absent or "horizontal")', () => {
    // Radix omits aria-orientation when horizontal (it's the implicit default
    // for role="separator"), so just confirm it isn't "vertical".
    render(<Separator data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep.getAttribute('aria-orientation')).not.toBe('vertical');
  });

  it('sets aria-orientation="vertical" when orientation="vertical"', () => {
    render(<Separator orientation="vertical" data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('hides from a11y tree when decorative', () => {
    render(<Separator decorative data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    // Radix decorative separators get role="none" and no aria-orientation
    expect(sep).not.toHaveAttribute('role', 'separator');
  });

  it('forwards className', () => {
    render(<Separator className="custom-class" data-testid="sep" />);
    expect(screen.getByTestId('sep')).toHaveClass('custom-class');
  });

  it('applies horizontal sizing classes by default', () => {
    render(<Separator data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toHaveClass('h-px');
    expect(sep).toHaveClass('w-full');
  });

  it('applies vertical sizing classes when orientation="vertical"', () => {
    render(<Separator orientation="vertical" data-testid="sep" />);
    const sep = screen.getByTestId('sep');
    expect(sep).toHaveClass('w-px');
    expect(sep).toHaveClass('h-full');
  });
});
