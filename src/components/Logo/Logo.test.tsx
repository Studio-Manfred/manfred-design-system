import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

describe('Logo', () => {
  it('renders wordmark variant by default with default aria-label "Manfred"', () => {
    render(<Logo />);
    const wrap = screen.getByRole('img', { name: 'Manfred' });
    expect(wrap.querySelector('svg')).toBeInTheDocument();
  });

  it('renders monogram variant with aria-label "M"', () => {
    render(<Logo variant="monogram" />);
    expect(screen.getByRole('img', { name: 'M' })).toBeInTheDocument();
  });

  it('honours custom aria-label', () => {
    render(<Logo aria-label="Manfred brand" />);
    expect(screen.getByRole('img', { name: 'Manfred brand' })).toBeInTheDocument();
  });

  it('applies height as inline style in px', () => {
    render(<Logo height={64} />);
    expect(screen.getByRole('img')).toHaveStyle({ height: '64px' });
  });

  it.each([
    ['blue', '#2c28ec'],
    ['black', '#1e1e24'],
    ['white', '#ffffff'],
  ] as const)('renders %s fill', (color, expected) => {
    const { container } = render(<Logo color={color} />);
    const fill = container.querySelector('path')?.getAttribute('fill');
    expect(fill?.toLowerCase()).toBe(expected);
  });
});
