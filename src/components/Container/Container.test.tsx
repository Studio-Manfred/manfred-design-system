import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';

describe('Container', () => {
  it('renders as a div by default with the lg max-width and default padding', () => {
    const { container } = render(<Container>Hello</Container>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveTextContent('Hello');
    expect(el.className).toMatch(/mx-auto/);
    expect(el.className).toMatch(/max-w-\[var\(--size-container-lg\)\]/);
    expect(el.className).toMatch(/px-4/);
    expect(el.className).toMatch(/sm:px-6/);
    expect(el.className).toMatch(/lg:px-8/);
  });

  it('respects the size prop and maps to --size-container-* tokens', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    for (const size of sizes) {
      const { container, unmount } = render(<Container size={size}>x</Container>);
      const el = container.firstElementChild as HTMLElement;
      expect(el.className).toContain(`max-w-[var(--size-container-${size})]`);
      unmount();
    }
  });

  it('drops the max-width cap entirely when size="full"', () => {
    const { container } = render(<Container size="full">edge to edge</Container>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).not.toMatch(/max-w-\[var\(--size-container-/);
  });

  it('removes horizontal padding when padded=false', () => {
    const { container } = render(<Container padded={false}>x</Container>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).not.toMatch(/px-4/);
    expect(el.className).not.toMatch(/sm:px-6/);
    expect(el.className).not.toMatch(/lg:px-8/);
  });

  it('renders the chosen element via the `as` prop and keeps landmark semantics', () => {
    render(<Container as="main">main content</Container>);
    expect(screen.getByRole('main')).toHaveTextContent('main content');
  });

  it('does not leak the `as` prop as an HTML attribute', () => {
    const { container } = render(<Container as="section">x</Container>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('SECTION');
    expect(el.hasAttribute('as')).toBe(false);
  });

  it('forwards ref to the rendered element', () => {
    const ref = { current: null as HTMLElement | null };
    render(<Container ref={ref}>x</Container>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('passes through HTML attributes (id, data-testid, aria-*)', () => {
    render(
      <Container id="page" data-testid="container-root" aria-label="Page wrapper">
        x
      </Container>,
    );
    const el = screen.getByTestId('container-root');
    expect(el).toHaveAttribute('id', 'page');
    expect(el).toHaveAttribute('aria-label', 'Page wrapper');
  });

  it('merges custom className with variant classes', () => {
    const { container } = render(<Container className="bg-card">x</Container>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/bg-card/);
    expect(el.className).toMatch(/mx-auto/);
  });
});
