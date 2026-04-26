import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders as a div by default with grid + default gap', () => {
    const { container } = render(<Grid>x</Grid>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('DIV');
    expect(el.className).toMatch(/(^|\s)grid(\s|$)/);
    expect(el.className).toMatch(/grid-cols-1/);
    expect(el.className).toMatch(/gap-4/);
  });

  it('maps a numeric cols prop to grid-cols-{n}', () => {
    const { container } = render(<Grid cols={3}>x</Grid>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/grid-cols-3/);
  });

  it('joins responsive cols into breakpoint-prefixed classes', () => {
    const { container } = render(
      <Grid cols={{ base: 1, md: 3 }}>x</Grid>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('grid-cols-1');
    expect(el.className).toContain('md:grid-cols-3');
  });

  it('supports the full responsive object', () => {
    const { container } = render(
      <Grid cols={{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }}>x</Grid>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('grid-cols-1');
    expect(el.className).toContain('sm:grid-cols-2');
    expect(el.className).toContain('md:grid-cols-3');
    expect(el.className).toContain('lg:grid-cols-4');
    expect(el.className).toContain('xl:grid-cols-6');
  });

  it('applies the gap variant from the token scale', () => {
    const gaps = [1, 2, 3, 4, 6, 8, 12] as const;
    for (const g of gaps) {
      const { container, unmount } = render(<Grid gap={g}>x</Grid>);
      const el = container.firstElementChild as HTMLElement;
      expect(el.className).toContain(`gap-${g}`);
      unmount();
    }
  });

  it('passes align through to align-items', () => {
    const { container } = render(<Grid align="center">x</Grid>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('items-center');
  });

  it('passes justify through to justify-items', () => {
    const { container } = render(<Grid justify="end">x</Grid>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('justify-items-end');
  });

  it('renders the chosen element via the `as` prop', () => {
    render(
      <Grid as="ul" data-testid="grid-list">
        <li>a</li>
        <li>b</li>
      </Grid>,
    );
    const el = screen.getByTestId('grid-list');
    expect(el.tagName).toBe('UL');
    expect(el.hasAttribute('as')).toBe(false);
  });

  it('renders as section when as="section"', () => {
    const { container } = render(<Grid as="section">x</Grid>);
    expect(container.firstElementChild?.tagName).toBe('SECTION');
  });

  it('forwards ref to the rendered element', () => {
    const ref = { current: null as HTMLElement | null };
    render(<Grid ref={ref}>x</Grid>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('passes through HTML attributes (id, data-testid, aria-*)', () => {
    render(
      <Grid id="kpis" data-testid="grid-root" aria-label="KPI tiles">
        x
      </Grid>,
    );
    const el = screen.getByTestId('grid-root');
    expect(el).toHaveAttribute('id', 'kpis');
    expect(el).toHaveAttribute('aria-label', 'KPI tiles');
  });

  it('merges custom className with variant classes', () => {
    const { container } = render(<Grid className="bg-card">x</Grid>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/bg-card/);
    expect(el.className).toMatch(/(^|\s)grid(\s|$)/);
  });
});
