import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>NEW</Badge>);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it.each(['neutral', 'brand', 'success', 'warning', 'error', 'info'] as const)(
    'applies %s variant',
    (variant) => {
      render(<Badge variant={variant}>X</Badge>);
      expect(screen.getByText('X').className).toMatch(/bg-(secondary|\[var)/);
    },
  );

  it.each(['sm', 'md'] as const)('applies %s size', (size) => {
    const map = { sm: 'text-xs', md: 'text-sm' };
    render(<Badge size={size}>X</Badge>);
    expect(screen.getByText('X').className).toContain(map[size]);
  });

  it.each(['success', 'warning', 'error', 'info'] as const)(
    '%s adds sr-only status prefix for screen readers',
    (variant) => {
      render(<Badge variant={variant}>Label</Badge>);
      expect(screen.getByText(`${variant}:`, { exact: false })).toBeInTheDocument();
    },
  );

  it('neutral & brand do NOT add a status prefix', () => {
    const { container } = render(<Badge variant="brand">Label</Badge>);
    expect(container.querySelector('.sr-only')).not.toBeInTheDocument();
  });

  it('merges external className', () => {
    render(<Badge className="custom-y">X</Badge>);
    expect(screen.getByText('X').className).toContain('custom-y');
  });
});
