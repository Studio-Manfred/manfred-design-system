import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/Icon';

/**
 * NavigationMenu — token-styled wrapper around
 * `@radix-ui/react-navigation-menu`. Used for top-level navigation with
 * sub-menu dropdowns (e.g. the intranet's main top bar).
 *
 * Sub-parts: `NavigationMenu` (Root + Viewport composition),
 * `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`,
 * `NavigationMenuContent`, `NavigationMenuLink`,
 * `NavigationMenuViewport`, `NavigationMenuIndicator`.
 *
 * The root composes `<Root>` + `<Viewport>` so consumers can write a
 * flat structure and the dropdown viewport renders automatically below
 * the list.
 *
 * Animations (chevron rotation, content slide, viewport zoom, indicator
 * fade) are gated behind the `motion-safe:` Tailwind variant so users
 * with `prefers-reduced-motion` still get full open/close behaviour,
 * just without the transitions.
 *
 * Active-link styling is driven by the `data-active` attribute on
 * `NavigationMenuLink` — pair with the `navigationMenuTriggerStyle`
 * helper (or your own classes) to highlight the current page.
 */

/**
 * Visual style for navigation triggers and link buttons. Exported so
 * consumers can apply the same look to plain `NavigationMenuLink`s that
 * aren't sub-menu triggers — keeps the top bar visually consistent.
 */
export const navigationMenuTriggerStyle = cva(
  cn(
    'inline-flex h-10 w-max items-center justify-center rounded-md',
    'bg-background px-4 py-2 text-sm font-medium',
    'motion-safe:transition-colors',
    'hover:bg-accent hover:text-accent-foreground',
    'focus:bg-accent focus:text-accent-foreground focus:outline-none',
    'focus-visible:shadow-[var(--shadow-focus)]',
    'disabled:pointer-events-none disabled:opacity-50',
    // Active-link styling driven by tokens. `data-[active]` is set by
    // Radix's `<NavigationMenuLink active>` and by manual data-active on
    // any element using this style.
    'data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
  ),
);

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface NavigationMenuProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {}

export const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  NavigationMenuProps
>(function NavigationMenu({ className, children, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Root
      ref={ref}
      className={cn(
        'relative z-10 flex max-w-max flex-1 items-center justify-center',
        className,
      )}
      {...props}
    >
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  );
});
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export interface NavigationMenuListProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List> {}

export const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  NavigationMenuListProps
>(function NavigationMenuList({ className, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.List
      ref={ref}
      className={cn(
        'group flex flex-1 list-none items-center justify-center space-x-1',
        className,
      )}
      {...props}
    />
  );
});
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

// ---------------------------------------------------------------------------
// Item — direct passthrough
// ---------------------------------------------------------------------------

export const NavigationMenuItem = NavigationMenuPrimitive.Item;
export type NavigationMenuItemProps = React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Item
>;

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export interface NavigationMenuTriggerProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger> {}

export const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  NavigationMenuTriggerProps
>(function NavigationMenuTrigger({ className, children, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Trigger
      ref={ref}
      className={cn(
        navigationMenuTriggerStyle(),
        'group gap-1',
        // Chevron rotation on open. Wrapped in motion-safe: so reduced-motion
        // users still get the state change, just without the rotation.
        '[&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <Icon
        name="chevron-down"
        size="sm"
        aria-hidden
        className="relative top-px shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-200"
      />
    </NavigationMenuPrimitive.Trigger>
  );
});
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface NavigationMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content> {}

export const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  NavigationMenuContentProps
>(function NavigationMenuContent({ className, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Content
      ref={ref}
      className={cn(
        'left-0 top-0 w-full md:absolute md:w-auto',
        // Slide animations driven by Radix's data-motion attribute.
        // All motion-safe: gated.
        'motion-safe:data-[motion=from-start]:animate-in motion-safe:data-[motion=from-end]:animate-in',
        'motion-safe:data-[motion=to-start]:animate-out motion-safe:data-[motion=to-end]:animate-out',
        'motion-safe:data-[motion=from-start]:slide-in-from-left-52',
        'motion-safe:data-[motion=from-end]:slide-in-from-right-52',
        'motion-safe:data-[motion=to-start]:slide-out-to-left-52',
        'motion-safe:data-[motion=to-end]:slide-out-to-right-52',
        className,
      )}
      {...props}
    />
  );
});
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

// ---------------------------------------------------------------------------
// Link — direct passthrough
// ---------------------------------------------------------------------------

export const NavigationMenuLink = NavigationMenuPrimitive.Link;
export type NavigationMenuLinkProps = React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Link
>;

// ---------------------------------------------------------------------------
// Viewport
// ---------------------------------------------------------------------------

export interface NavigationMenuViewportProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport> {}

export const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  NavigationMenuViewportProps
>(function NavigationMenuViewport({ className, ...props }, ref) {
  return (
    <div className="absolute left-0 top-full flex justify-center">
      <NavigationMenuPrimitive.Viewport
        ref={ref}
        className={cn(
          'origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg',
          'md:w-[var(--radix-navigation-menu-viewport-width)]',
          // Open/close zoom animations, motion-safe: gated.
          'motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out',
          'motion-safe:data-[state=closed]:zoom-out-95 motion-safe:data-[state=open]:zoom-in-90',
          className,
        )}
        {...props}
      />
    </div>
  );
});
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

// ---------------------------------------------------------------------------
// Indicator
// ---------------------------------------------------------------------------

export interface NavigationMenuIndicatorProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator> {}

export const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  NavigationMenuIndicatorProps
>(function NavigationMenuIndicator({ className, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Indicator
      ref={ref}
      className={cn(
        'top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden',
        // Fade animations on visibility change, motion-safe: gated.
        'motion-safe:data-[state=visible]:animate-in motion-safe:data-[state=hidden]:animate-out',
        'motion-safe:data-[state=hidden]:fade-out motion-safe:data-[state=visible]:fade-in',
        className,
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
});
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;
