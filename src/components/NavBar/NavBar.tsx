import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Top-level app navigation. NavBar wraps in `<nav aria-label="Primary">` so
 * AT users get the landmark; NavItem is the styled link with active-state
 * tokens + automatic `aria-current="page"`. The `as` prop lets consumers
 * plug a router Link (React Router, Next.js, TanStack Router) without losing
 * the visual contract.
 */

export interface NavBarProps extends React.HTMLAttributes<HTMLElement> {
  /** Accessible name for the nav landmark. Defaults to "Primary". */
  'aria-label'?: string;
}

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

export type NavItemProps = NavItemElementProps &
  VariantProps<typeof navItemVariants> & {
    /** Apply active styling and `aria-current="page"`. */
    active?: boolean;
  };

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
