import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppHeader } from './AppHeader';

describe('AppHeader (shell)', () => {
  it('renders a single <header> landmark with default aria-label', () => {
    render(<AppHeader />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header.tagName).toBe('HEADER');
    expect(header).toHaveAttribute('aria-label', 'Primary');
  });

  it('renders with sticky classes by default', () => {
    render(<AppHeader />);
    const header = screen.getByRole('banner');
    expect(header.className).toContain('sticky');
    expect(header.className).toContain('top-0');
  });

  it('drops sticky classes when sticky=false', () => {
    render(<AppHeader sticky={false} />);
    const header = screen.getByRole('banner');
    expect(header.className).not.toContain('sticky');
  });

  it.each(['default', 'brand', 'dark'] as const)('applies tone="%s"', (tone) => {
    render(<AppHeader tone={tone} />);
    const header = screen.getByRole('banner');
    if (tone === 'default') expect(header.className).toContain('bg-background');
    if (tone === 'brand') expect(header.className).toContain('bg-bg-brand');
    if (tone === 'dark') expect(header.className).toContain('bg-bg-inverse');
  });

  it('accepts a custom ariaLabel', () => {
    render(<AppHeader ariaLabel="Admin" />);
    expect(screen.getByRole('banner', { name: 'Admin' })).toBeInTheDocument();
  });

  it('forwards ref to the <header> element', () => {
    const ref = { current: null as HTMLElement | null };
    render(<AppHeader ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('HEADER');
  });
});
