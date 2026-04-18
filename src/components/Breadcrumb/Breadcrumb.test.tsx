import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Docs', href: '/docs' },
    { label: 'Intro' },
  ];

  it('renders a nav with aria-label="Breadcrumb"', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders links for non-last items', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
  });

  it('marks last item with aria-current=page and not a link', () => {
    render(<Breadcrumb items={items} />);
    const current = screen.getByText('Intro');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current.tagName).toBe('SPAN');
  });

  it('slash separator uses "/" glyph', () => {
    render(<Breadcrumb items={items} separator="slash" />);
    const slashes = screen.getAllByText('/', { selector: 'span' });
    expect(slashes.length).toBeGreaterThanOrEqual(2);
  });

  it('chevron separator renders SVG', () => {
    const { container } = render(<Breadcrumb items={items} separator="chevron" />);
    // 2 separators × 1 svg each
    expect(container.querySelectorAll('li[aria-hidden="true"] svg').length).toBe(2);
  });

  it('non-link intermediate item renders as plain span (no href)', () => {
    const noHref = [{ label: 'A' }, { label: 'B' }];
    render(<Breadcrumb items={noHref} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
