import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavBar, NavItem } from './NavBar';

describe('NavBar', () => {
  it('renders a nav landmark with the default aria-label "Primary"', () => {
    render(
      <NavBar>
        <NavItem href="/">Home</NavItem>
      </NavBar>,
    );
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });

  it('respects a custom aria-label', () => {
    render(
      <NavBar aria-label="Account">
        <NavItem href="/">Home</NavItem>
      </NavBar>,
    );
    expect(screen.getByRole('navigation', { name: 'Account' })).toBeInTheDocument();
  });

  it('forwards ref to the nav element', () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <NavBar ref={ref}>
        <NavItem href="/">A</NavItem>
      </NavBar>,
    );
    expect(ref.current?.tagName).toBe('NAV');
  });
});

describe('NavItem', () => {
  it('renders as <a> by default', () => {
    render(<NavItem href="/home">Home</NavItem>);
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/home');
  });

  it('applies aria-current="page" when active', () => {
    render(
      <NavItem href="/home" active>
        Home
      </NavItem>,
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('does NOT apply aria-current when not active', () => {
    render(<NavItem href="/home">Home</NavItem>);
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('renders via the `as` prop with a router-link-like component', () => {
    // Realistic router-link mock: spreads arbitrary props onto the underlying
    // <a> so things like aria-current and onClick reach the DOM. This is the
    // contract React Router / Next Link / TanStack Router all satisfy.
    type RouterLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      to: string;
    };
    const RouterLink = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(
      function RouterLink({ to, children, ...rest }, ref) {
        return (
          <a ref={ref} href={to} data-router-link="true" {...rest}>
            {children}
          </a>
        );
      },
    );
    render(
      <NavItem as={RouterLink} to="/boards" active>
        Boards
      </NavItem>,
    );
    const link = screen.getByRole('link', { name: 'Boards' });
    expect(link).toHaveAttribute('data-router-link', 'true');
    expect(link).toHaveAttribute('href', '/boards');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('does not leak the `as` prop onto the rendered element', () => {
    const { container } = render(
      <NavItem as="button" type="button">
        Click
      </NavItem>,
    );
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn).not.toHaveAttribute('as');
  });

  it('applies active visual classes (underline indicator)', () => {
    render(
      <NavItem href="/x" active>
        X
      </NavItem>,
    );
    const link = screen.getByRole('link', { name: 'X' });
    expect(link.className).toMatch(/after:bg-foreground/);
  });
});
