import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders role=progressbar with aria-valuenow', () => {
    render(<ProgressBar value={40} label="Upload" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
  });

  it('clamps negative values to 0', () => {
    render(<ProgressBar value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps values over 100 to 100', () => {
    render(<ProgressBar value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows label and value when requested', () => {
    render(<ProgressBar value={25} label="Saved" showValue />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('default aria-label is "Progress"', () => {
    render(<ProgressBar value={0} />);
    expect(screen.getByRole('progressbar', { name: 'Progress' })).toBeInTheDocument();
  });

  it.each([
    ['sm', 'h-1'],
    ['md', 'h-2'],
    ['lg', 'h-3'],
  ] as const)('applies %s size', (size, cls) => {
    render(<ProgressBar value={50} size={size} />);
    expect(screen.getByRole('progressbar').className).toContain(cls);
  });
});
