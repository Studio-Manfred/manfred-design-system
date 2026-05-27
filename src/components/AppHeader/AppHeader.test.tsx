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

describe('AppHeader — left cluster', () => {
  it('renders the wordmark logo by default, wrapped in a link to "/"', () => {
    render(<AppHeader />);
    const link = screen.getByRole('link', { name: 'Manfred home' });
    expect(link).toHaveAttribute('href', '/');
    expect(link.querySelector('[role="img"]')).toBeTruthy();
  });

  it('honours a custom logoHref', () => {
    render(<AppHeader logoHref="/dashboard" />);
    expect(screen.getByRole('link', { name: 'Manfred home' })).toHaveAttribute('href', '/dashboard');
  });

  it('renders the monogram when logo="monogram"', () => {
    render(<AppHeader logo="monogram" />);
    // Logo's monogram variant defaults aria-label to 'M' unless overridden;
    // AppHeader overrides to 'Manfred home' for both variants for link consistency.
    expect(screen.getByRole('link', { name: 'Manfred home' })).toBeInTheDocument();
  });

  it('renders a custom ReactNode logo when provided', () => {
    render(<AppHeader logo={<span data-testid="custom-logo">CL</span>} />);
    expect(screen.getByTestId('custom-logo')).toBeInTheDocument();
    // Custom logos render bare — no auto-link.
    expect(screen.queryByRole('link', { name: /home/i })).not.toBeInTheDocument();
  });

  it('renders no logo (and no logo link) when logo={null}', () => {
    render(<AppHeader logo={null} />);
    expect(screen.queryByRole('link', { name: /home/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders appName next to the logo when provided', () => {
    render(<AppHeader appName="Intranet" />);
    expect(screen.getByText('Intranet')).toBeInTheDocument();
  });
});
