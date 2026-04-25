import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';

describe('Card', () => {
  it('renders as a div by default', () => {
    const { container } = render(<Card>Hello</Card>);
    const el = container.firstElementChild;
    expect(el?.tagName).toBe('DIV');
    expect(el).toHaveTextContent('Hello');
  });

  it('respects the `as` prop and renders the chosen element', () => {
    const { container } = render(<Card as="article">A</Card>);
    expect(container.firstElementChild?.tagName).toBe('ARTICLE');
  });

  it('renders as section when as="section"', () => {
    const { container } = render(<Card as="section">B</Card>);
    expect(container.firstElementChild?.tagName).toBe('SECTION');
  });

  it('passes ARIA attributes through to the rendered element', () => {
    render(
      <Card as="article" aria-labelledby="kpi-title" aria-describedby="kpi-help">
        <CardTitle id="kpi-title">KPI</CardTitle>
      </Card>,
    );
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-labelledby', 'kpi-title');
    expect(article).toHaveAttribute('aria-describedby', 'kpi-help');
  });

  it('applies interactive focus/hover styling when interactive=true', () => {
    const { container } = render(<Card interactive>X</Card>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/cursor-pointer/);
    expect(el.className).toMatch(/focus-visible:ring-2/);
  });

  it('CardTitle defaults to h3 and respects the as prop', () => {
    const { rerender } = render(<CardTitle>Default</CardTitle>);
    expect(screen.getByRole('heading', { level: 3, name: 'Default' })).toBeInTheDocument();

    rerender(<CardTitle as="h2">Top</CardTitle>);
    expect(screen.getByRole('heading', { level: 2, name: 'Top' })).toBeInTheDocument();
  });

  it('composes header / description / content / footer slots', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>desc</CardDescription>
        </CardHeader>
        <CardContent>body</CardContent>
        <CardFooter>foot</CardFooter>
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('desc')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
    expect(screen.getByText('foot')).toBeInTheDocument();
  });

  it('forwards ref to the root element', () => {
    const ref = { current: null as HTMLElement | null };
    render(<Card ref={ref}>R</Card>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
