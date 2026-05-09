import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Props for the {@link NavBar} component.
 *
 * Extends the native `<nav>` element. Children should be `NavItem`s (or
 * any element using the same visual contract).
 */
export interface NavBarProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Accessible name for the nav landmark. Defaults to `"Primary"`.
   * Set this when more than one nav exists on a page (e.g. `"Docs"` for
   * a sub-section nav) so screen-reader users can distinguish landmarks.
   */
  'aria-label'?: string;
}

/**
 * Flat horizontal navigation. Wraps children in
 * `<nav aria-label="Primary">` so AT users get the landmark.
 *
 * Use NavBar for **flat** top-level navigation with no sub-menus — for
 * navigation that needs dropdown panels, use `NavigationMenu` (built on
 * `@radix-ui/react-navigation-menu`) instead. NavBar is intentionally
 * thin: a styled `<nav>` plus the `NavItem` link with active-state
 * tokens and automatic `aria-current="page"`.
 *
 * Accessibility:
 * - The `<nav>` is exposed as a landmark — set `aria-label` when more
 *   than one nav exists on the page.
 * - Active items get `aria-current="page"` automatically.
 *
 * @example Flat top-level nav
 * ```tsx
 * <NavBar>
 *   <NavItem href="#home" active>Home</NavItem>
 *   <NavItem href="#boards">Boards</NavItem>
 *   <NavItem href="#info">Information</NavItem>
 * </NavBar>
 * ```
 *
 * @example With a router Link via `as`
 * ```tsx
 * <NavBar aria-label="Docs">
 *   <NavItem as={RouterLink} to="/intro">Intro</NavItem>
 *   <NavItem as={RouterLink} to="/components" active>Components</NavItem>
 * </NavBar>
 * ```
 */
export const NavBar = React.forwardRef<HTMLElement, NavBarProps>(function NavBar(
  { className, children, 'aria-label': ariaLabel = 'Primary', ...rest },
  ref,
) {
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cn('flex items-center gap-1', className)}
      {...rest}
    >
      {children}
    </nav>
  );
});
NavBar.displayName = 'NavBar';

const navItemVariants = cva(
  [
    'relative inline-flex items-center px-3 py-2 text-sm font-medium',
    'rounded-[var(--radius-sm)] transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  ].join(' '),
  {
    variants: {
      active: {
        true: [
          'text-foreground',
          // Underline indicator: 2px bar centred under the text.
          'after:absolute after:left-3 after:right-3 after:bottom-0',
          'after:h-0.5 after:bg-foreground after:rounded-full',
        ].join(' '),
        false: 'text-muted-foreground hover:text-foreground',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

type NavItemElementProps =
  | (React.AnchorHTMLAttributes<HTMLAnchorElement> & { as?: 'a' })
  | (React.ComponentPropsWithoutRef<'button'> & { as: 'button' })
  // Allow consumers to plug in a Router Link or any other component that
  // accepts standard anchor-like props. We keep the type permissive on
  // purpose — the runtime element is whatever they pass.
  | (React.ComponentPropsWithRef<React.ElementType> & {
      as: React.ElementType;
    });

/**
 * Props for the {@link NavItem} component.
 *
 * Discriminated by the `as` prop: defaults to `<a>` (uses anchor
 * attributes), set `as="button"` for button semantics, or pass any
 * component (router `Link`, etc.) to render that instead while keeping
 * the visual contract.
 */
export type NavItemProps = NavItemElementProps &
  VariantProps<typeof navItemVariants> & {
    /**
     * Apply active styling and `aria-current="page"`. Set this on the
     * single item that represents the current route.
     */
    active?: boolean;
  };

/**
 * Single nav link inside {@link NavBar}.
 *
 * Renders an `<a>` by default; switch to a `<button>` or any
 * router-Link component via the `as` prop. Visual treatment stays
 * consistent: muted by default, foreground colour + 2px underline
 * indicator when `active`. The active state also flips
 * `aria-current="page"` on the rendered element.
 *
 * Accessibility:
 * - `aria-current="page"` is set automatically when `active` is true.
 * - Focus ring uses the `--ring` token via `focus-visible:ring-ring`.
 *
 * @example Standard anchor (default)
 * ```tsx
 * <NavItem href="/boards" active>Boards</NavItem>
 * ```
 *
 * @example Plugged into a router Link
 * ```tsx
 * <NavItem as={RouterLink} to="/components">Components</NavItem>
 * ```
 */
export const NavItem = React.forwardRef<HTMLElement, NavItemProps>(function NavItem(
  { as, active = false, className, children, ...rest },
  ref,
) {
  const Component: React.ElementType = as ?? 'a';
  // Avoid spreading `as` onto the underlying element.
  const componentProps: Record<string, unknown> = {
    ref,
    className: cn(navItemVariants({ active }), className),
    ...rest,
  };
  if (active) {
    componentProps['aria-current'] = 'page';
  }
  return <Component {...componentProps}>{children}</Component>;
});
NavItem.displayName = 'NavItem';
