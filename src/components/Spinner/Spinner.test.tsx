import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders role=status with default label', () => {
    render(<Spinner />);
    const root = screen.getByRole('status');
    expect(root).toBeInTheDocument();
    expect(root).toHaveTextContent('Loading');
  });

  it('uses custom label', () => {
    render(<Spinner label="Fetching…" />);
    expect(screen.getByRole('status')).toHaveTextContent('Fetching…');
  });

  it.each([
    ['sm', 'w-4'],
    ['md', 'w-6'],
    ['lg', 'w-10'],
  ] as const)('applies %s size', (size, cls) => {
    render(<Spinner size={size} />);
    expect(screen.getByRole('status').className).toContain(cls);
  });
});
