import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders an SVG with the named path', () => {
    const { container } = render(<Icon name="check" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.querySelector('path')).toBeInTheDocument();
  });

  it('hides from a11y tree by default', () => {
    const { container } = render(<Icon name="info" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('exposes role=img and aria-label when label is provided', () => {
    const { container } = render(<Icon name="search" label="Search" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', 'Search');
    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it.each([
    ['xs', 'w-3'],
    ['sm', 'w-4'],
    ['md', 'w-5'],
    ['lg', 'w-6'],
    ['xl', 'w-8'],
  ] as const)('applies %s size', (size, cls) => {
    const { container } = render(<Icon name="x" size={size} />);
    expect(container.querySelector('svg')!.className.baseVal).toContain(cls);
  });
});
