import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
  navigationMenuTriggerStyle,
} from './NavigationMenu';

function BasicMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="p-4 w-[300px]">
              <li>
                <NavigationMenuLink href="/p/one">Product one</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/p/two">Product two</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="p-4 w-[300px]">
              <li>
                <NavigationMenuLink href="/r/one">Resource one</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/about"
            className={navigationMenuTriggerStyle()}
          >
            About
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

describe('NavigationMenu', () => {
  it('renders with role navigation', () => {
    render(<BasicMenu />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders triggers as buttons with aria-expanded=false initially', () => {
    render(<BasicMenu />);
    const trigger = screen.getByRole('button', { name: /products/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the corresponding content panel when a trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    const trigger = screen.getByRole('button', { name: /products/i });
    await user.click(trigger);
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
    expect(
      screen.getByRole('link', { name: 'Product one' }),
    ).toBeInTheDocument();
  });

  it('closes the open panel when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    const trigger = screen.getByRole('button', { name: /products/i });
    await user.click(trigger);
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('keyboard: arrow keys move focus between triggers', async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    const products = screen.getByRole('button', { name: /products/i });
    const resources = screen.getByRole('button', { name: /resources/i });
    products.focus();
    expect(products).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    // Radix moves roving focus to the next trigger.
    await waitFor(() => {
      expect(resources).toHaveFocus();
    });
  });

  it('chevron rotates on open (data-state attribute is set)', async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    const trigger = screen.getByRole('button', { name: /products/i });
    expect(trigger).toHaveAttribute('data-state', 'closed');
    // The rotation class is wired up via [&[data-state=open]>svg]:rotate-180 on
    // the trigger, so verifying the class+state combination is what matters.
    expect(trigger.className).toMatch(/\[&\[data-state=open\]>svg\]:rotate-180/);
    await user.click(trigger);
    await waitFor(() => {
      expect(trigger).toHaveAttribute('data-state', 'open');
    });
  });

  it('chevron rotation transition is wrapped in motion-safe:', () => {
    render(<BasicMenu />);
    const trigger = screen.getByRole('button', { name: /products/i });
    const chevron = trigger.querySelector('svg');
    expect(chevron).not.toBeNull();
    expect(chevron!.getAttribute('class') ?? '').toMatch(
      /motion-safe:transition-transform/,
    );
  });

  it('navigationMenuTriggerStyle string includes motion-safe: animation classes', () => {
    const classes = navigationMenuTriggerStyle();
    expect(classes).toMatch(/motion-safe:transition-colors/);
  });

  it('active link styling is driven by data-active and uses tokens', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/active"
              data-active
              className={navigationMenuTriggerStyle()}
            >
              Current page
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const link = screen.getByRole('link', { name: 'Current page' });
    expect(link).toHaveAttribute('data-active');
    // Token-driven active styling lives in the cva string.
    expect(link.className).toMatch(/data-\[active\]:bg-accent\/50/);
  });

  it('forwards className on each sub-part', () => {
    render(
      <NavigationMenu className="root-cls" data-testid="root">
        <NavigationMenuList className="list-cls" data-testid="list">
          <NavigationMenuItem>
            <NavigationMenuTrigger className="trigger-cls">
              T
            </NavigationMenuTrigger>
            <NavigationMenuContent className="content-cls">
              C
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuIndicator className="indicator-cls" data-testid="indicator" />
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByTestId('root')).toHaveClass('root-cls');
    expect(screen.getByTestId('list')).toHaveClass('list-cls');
    expect(screen.getByRole('button', { name: 'T' })).toHaveClass('trigger-cls');
  });

  it('forwards refs on the styled sub-parts', () => {
    const rootRef = React.createRef<HTMLElement>();
    const listRef = React.createRef<HTMLUListElement>();
    const triggerRef = React.createRef<HTMLButtonElement>();
    render(
      <NavigationMenu ref={rootRef}>
        <NavigationMenuList ref={listRef}>
          <NavigationMenuItem>
            <NavigationMenuTrigger ref={triggerRef}>T</NavigationMenuTrigger>
            <NavigationMenuContent>C</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(rootRef.current).toBeInstanceOf(HTMLElement);
    expect(listRef.current).toBeInstanceOf(HTMLElement);
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
  });
});
