import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  PageShell,
  PageHeader,
  PageBody,
  PageFooter,
} from './PageShell';

describe('PageShell', () => {
  it('renders a div with min-h-screen flex column at the root', () => {
    const { container } = render(<PageShell>x</PageShell>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe('DIV');
    expect(root.className).toMatch(/min-h-screen/);
    expect(root.className).toMatch(/flex/);
    expect(root.className).toMatch(/flex-col/);
  });

  it('renders a skip-link as the first child by default, pointing at the main id', () => {
    const { container } = render(
      <PageShell>
        <PageBody>x</PageBody>
      </PageShell>,
    );
    const root = container.firstElementChild as HTMLElement;
    const firstChild = root.firstElementChild as HTMLElement;
    expect(firstChild.tagName).toBe('A');
    expect(firstChild).toHaveAttribute('href', '#page-body');
    expect(firstChild.className).toMatch(/sr-only/);
  });

  it('uses a custom mainId on the skip-link when provided', () => {
    const { container } = render(
      <PageShell mainId="my-content">
        <PageBody id="my-content">x</PageBody>
      </PageShell>,
    );
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '#my-content');
  });

  it('omits the skip-link when includeSkipLink=false', () => {
    const { container } = render(
      <PageShell includeSkipLink={false}>
        <PageBody>x</PageBody>
      </PageShell>,
    );
    expect(container.querySelector('a')).toBeNull();
  });

  it('forwards ref to the root div', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<PageShell ref={ref}>x</PageShell>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('PageHeader', () => {
  it('renders a <header> element', () => {
    render(<PageHeader>top</PageHeader>);
    const header = screen.getByText('top').closest('header');
    expect(header).not.toBeNull();
  });

  it('applies sticky top-0 z-50 by default', () => {
    const { container } = render(<PageHeader>top</PageHeader>);
    const header = container.querySelector('header') as HTMLElement;
    expect(header.className).toMatch(/sticky/);
    expect(header.className).toMatch(/top-0/);
    expect(header.className).toMatch(/z-50/);
  });

  it('removes sticky class when sticky=false', () => {
    const { container } = render(<PageHeader sticky={false}>top</PageHeader>);
    const header = container.querySelector('header') as HTMLElement;
    expect(header.className).not.toMatch(/\bsticky\b/);
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLElement | null };
    render(<PageHeader ref={ref}>x</PageHeader>);
    expect(ref.current?.tagName).toBe('HEADER');
  });
});

describe('PageBody', () => {
  it('renders a <main> element', () => {
    render(<PageBody>body</PageBody>);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('applies the default id "page-body"', () => {
    render(<PageBody>body</PageBody>);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'page-body');
  });

  it('respects a custom id', () => {
    render(<PageBody id="custom">body</PageBody>);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'custom');
  });

  it('applies horizontal padding utilities by default', () => {
    render(<PageBody>body</PageBody>);
    const main = screen.getByRole('main');
    expect(main.className).toMatch(/px-4/);
    expect(main.className).toMatch(/sm:px-6/);
    expect(main.className).toMatch(/lg:px-8/);
  });

  it('removes horizontal padding utilities when padded=false', () => {
    render(<PageBody padded={false}>body</PageBody>);
    const main = screen.getByRole('main');
    expect(main.className).not.toMatch(/\bpx-4\b/);
    expect(main.className).not.toMatch(/sm:px-6/);
    expect(main.className).not.toMatch(/lg:px-8/);
  });

  it('applies flex-1 + overflow-y-auto so it fills the column and scrolls', () => {
    render(<PageBody>body</PageBody>);
    const main = screen.getByRole('main');
    expect(main.className).toMatch(/flex-1/);
    expect(main.className).toMatch(/overflow-y-auto/);
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLElement | null };
    render(<PageBody ref={ref}>body</PageBody>);
    expect(ref.current?.tagName).toBe('MAIN');
  });
});

describe('PageFooter', () => {
  it('renders a <footer> element', () => {
    render(<PageFooter>foot</PageFooter>);
    const footer = screen.getByText('foot').closest('footer');
    expect(footer).not.toBeNull();
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLElement | null };
    render(<PageFooter ref={ref}>x</PageFooter>);
    expect(ref.current?.tagName).toBe('FOOTER');
  });
});

describe('PageShell composed contract', () => {
  it('contains exactly one <main> when composed with header/body/footer', () => {
    render(
      <PageShell>
        <PageHeader>h</PageHeader>
        <PageBody>b</PageBody>
        <PageFooter>f</PageFooter>
      </PageShell>,
    );
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('skip-link href matches the PageBody id (default)', () => {
    const { container } = render(
      <PageShell>
        <PageHeader>h</PageHeader>
        <PageBody>b</PageBody>
        <PageFooter>f</PageFooter>
      </PageShell>,
    );
    const link = container.querySelector('a') as HTMLAnchorElement;
    const main = screen.getByRole('main');
    expect(link.getAttribute('href')).toBe(`#${main.id}`);
  });

  it('skip-link href matches a custom PageBody id', () => {
    const { container } = render(
      <PageShell mainId="hello">
        <PageHeader>h</PageHeader>
        <PageBody id="hello">b</PageBody>
        <PageFooter>f</PageFooter>
      </PageShell>,
    );
    const link = container.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('#hello');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'hello');
  });
});
