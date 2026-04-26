import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PageBackground } from './PageBackground';

describe('PageBackground', () => {
  it('renders as a div by default with the default variant background', () => {
    const { container } = render(<PageBackground>content</PageBackground>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('DIV');
    expect(el.className).toMatch(/bg-background/);
    expect(el).toHaveTextContent('content');
  });

  it('always applies min-h-screen', () => {
    const { container } = render(<PageBackground>x</PageBackground>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/min-h-screen/);
  });

  it('applies the warm variant background utility', () => {
    const { container } = render(
      <PageBackground variant="warm">x</PageBackground>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/bg-\[var\(--color-bg-warm\)\]/);
  });

  it('applies the warm-muted variant background utility', () => {
    const { container } = render(
      <PageBackground variant="warm-muted">x</PageBackground>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/bg-\[var\(--color-bg-warm-muted\)\]/);
  });

  it('applies the accent variant background utility', () => {
    const { container } = render(
      <PageBackground variant="accent">x</PageBackground>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/bg-accent/);
  });

  it('applies the inverse variant background+foreground pairing', () => {
    const { container } = render(
      <PageBackground variant="inverse">x</PageBackground>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/bg-foreground/);
    expect(el.className).toMatch(/text-background/);
  });

  it('renders as <section> when as="section" without leaking the as prop', () => {
    const { container } = render(
      <PageBackground as="section">x</PageBackground>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('SECTION');
    expect(el.hasAttribute('as')).toBe(false);
  });

  it('renders as <main> when as="main"', () => {
    const { container } = render(
      <PageBackground as="main">x</PageBackground>,
    );
    expect(container.firstElementChild?.tagName).toBe('MAIN');
  });

  it('forwards ref to the rendered element', () => {
    const ref = { current: null as HTMLElement | null };
    render(<PageBackground ref={ref}>r</PageBackground>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('forwards ref when as="section"', () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <PageBackground as="section" ref={ref}>
        r
      </PageBackground>,
    );
    expect(ref.current?.tagName).toBe('SECTION');
  });

  it('merges a custom className with the variant utilities', () => {
    const { container } = render(
      <PageBackground variant="warm" className="custom-class p-12">
        x
      </PageBackground>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/custom-class/);
    expect(el.className).toMatch(/p-12/);
    expect(el.className).toMatch(/bg-\[var\(--color-bg-warm\)\]/);
    expect(el.className).toMatch(/min-h-screen/);
  });

  it('passes ARIA attributes through to the rendered element', () => {
    const { container } = render(
      <PageBackground aria-label="Page surface">x</PageBackground>,
    );
    expect(container.firstElementChild).toHaveAttribute(
      'aria-label',
      'Page surface',
    );
  });
});
