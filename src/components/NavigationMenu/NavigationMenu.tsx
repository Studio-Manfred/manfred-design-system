import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/Icon';

/**
 * Shared visual style for navigation triggers and link buttons. cva
 * helper exported so consumers can apply the same look to plain
 * `NavigationMenuLink`s that are not sub-menu triggers — keeps the
 * top bar visually consistent across mixed link/dropdown items.
 *
 * Active / open state is driven by `data-active` and `data-state=open`
 * (set by Radix on triggers, manual `data-active` on links).
 *
 * @example Apply the trigger look to a plain link
 * ```tsx
 * <NavigationMenuLink href="#docs" className={navigationMenuTriggerStyle()}>
 *   Docs
 * </NavigationMenuLink>
 * ```
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

/**
 * Props for the {@link NavigationMenu} root.
 *
 * Inherits every prop from `@radix-ui/react-navigation-menu`'s `Root`
 * (e.g. `defaultValue`, `value`, `onValueChange`, `delayDuration`,
 * `skipDelayDuration`, `dir`, `orientation`).
 */
export interface NavigationMenuProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {}

/**
 * Top-level navigation with sub-menu dropdowns. Token-styled wrapper
 * around `@radix-ui/react-navigation-menu` Root + Viewport.
 *
 * Use NavigationMenu when nav items need dropdown panels — for **flat**
 * top-level navigation with no sub-menus, prefer `NavBar` instead. The
 * root composes `<Root>` + `<Viewport>` so consumers can write a flat
 * structure and the dropdown viewport renders automatically below the
 * list.
 *
 * Sub-parts: {@link NavigationMenu}, {@link NavigationMenuList},
 * {@link NavigationMenuItem}, {@link NavigationMenuTrigger},
 * {@link NavigationMenuContent}, {@link NavigationMenuLink},
 * {@link NavigationMenuViewport}, {@link NavigationMenuIndicator},
 * plus the {@link navigationMenuTriggerStyle} cva helper.
 *
 * Accessibility:
 * - All open/close, slide, fade, and chevron-rotation animations are
 *   gated behind the `motion-safe:` Tailwind variant — users with
 *   `prefers-reduced-motion: reduce` get the full state changes
 *   without the transitions.
 * - Active-link styling is driven by `data-active` on
 *   `NavigationMenuLink` (or any element using
 *   `navigationMenuTriggerStyle`) — pair with `aria-current="page"`
 *   for the route's link.
 * - Radix handles full keyboard support: Tab between triggers, Enter /
 *   Space / Down to open, Esc to close, arrow keys inside content.
 *
 * @example Simple flat list of links
 * ```tsx
 * <NavigationMenu>
 *   <NavigationMenuList>
 *     <NavigationMenuItem>
 *       <NavigationMenuLink href="#home" data-active className={navigationMenuTriggerStyle()}>
 *         Home
 *       </NavigationMenuLink>
 *     </NavigationMenuItem>
 *   </NavigationMenuList>
 * </NavigationMenu>
 * ```
 *
 * @example Trigger that opens a content panel
 * ```tsx
 * <NavigationMenuItem>
 *   <NavigationMenuTrigger>Products</NavigationMenuTrigger>
 *   <NavigationMenuContent>
 *     <ul className="grid w-[420px] gap-2 p-4 md:grid-cols-2">{links}</ul>
 *   </NavigationMenuContent>
 * </NavigationMenuItem>
 * ```
 *
 * @example With the indicator arrow
 * ```tsx
 * <NavigationMenu>
 *   <NavigationMenuList>
 *     <NavigationMenuItem>…</NavigationMenuItem>
 *     <NavigationMenuItem>…</NavigationMenuItem>
 *     <NavigationMenuIndicator />
 *   </NavigationMenuList>
 * </NavigationMenu>
 * ```
 */
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

/**
 * Props for {@link NavigationMenuList}. Inherits from the Radix
 * `List` primitive.
 */
export interface NavigationMenuListProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List> {}

/**
 * Horizontal `<ul>` wrapper for the menu items. Required direct child
 * of {@link NavigationMenu}; required parent of every
 * {@link NavigationMenuItem}.
 *
 * Provides the flex layout, item spacing, and list-reset; pass
 * `className` to extend.
 */
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

/**
 * Single `<li>` slot inside {@link NavigationMenuList}. Direct
 * passthrough to Radix's `Item` — wrap a {@link NavigationMenuLink}
 * (plain link) or a {@link NavigationMenuTrigger} +
 * {@link NavigationMenuContent} pair (dropdown) inside.
 */
export const NavigationMenuItem = NavigationMenuPrimitive.Item;
export type NavigationMenuItemProps = React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Item
>;

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

/**
 * Props for {@link NavigationMenuTrigger}. Inherits from the Radix
 * `Trigger` primitive.
 */
export interface NavigationMenuTriggerProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger> {}

/**
 * The button that opens a sub-menu. Wraps Radix's `Trigger`, applies
 * {@link navigationMenuTriggerStyle}, and appends a chevron icon that
 * rotates 180° when the menu is open.
 *
 * The chevron rotation transition is gated by `motion-safe:` so
 * reduced-motion users still see the state change, just without the
 * rotation animation. The chevron is `aria-hidden`; Radix manages
 * `aria-expanded` on the trigger itself.
 */
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

/**
 * Props for {@link NavigationMenuContent}. Inherits from the Radix
 * `Content` primitive.
 */
export interface NavigationMenuContentProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content> {}

/**
 * The panel that opens when its sibling {@link NavigationMenuTrigger}
 * is activated. Renders into the parent {@link NavigationMenuViewport}.
 *
 * Holds whatever layout the sub-menu needs — a list, a grid of links,
 * a hero card + link list, etc. Slide-in / slide-out animations are
 * driven by Radix's `data-motion` attribute and gated behind
 * `motion-safe:` so reduced-motion users get the open/close state
 * without the slide.
 */
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

/**
 * The link element inside the menu. Direct passthrough to Radix's
 * `Link`. Use it both for plain top-level links (apply
 * {@link navigationMenuTriggerStyle} and `data-active` on the current
 * route) and for items inside a {@link NavigationMenuContent} panel
 * (style as needed).
 */
export const NavigationMenuLink = NavigationMenuPrimitive.Link;
export type NavigationMenuLinkProps = React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Link
>;

// ---------------------------------------------------------------------------
// Viewport
// ---------------------------------------------------------------------------

/**
 * Props for {@link NavigationMenuViewport}. Inherits from the Radix
 * `Viewport` primitive.
 */
export interface NavigationMenuViewportProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport> {}

/**
 * The single shared region that hosts the currently open
 * {@link NavigationMenuContent}. Rendered automatically by
 * {@link NavigationMenu} — consumers don't normally place this
 * themselves. Exported so advanced compositions can decouple Root
 * and Viewport when the layout requires it.
 *
 * Open/close zoom animations are gated behind `motion-safe:` and read
 * the `--radix-navigation-menu-viewport-{width,height}` CSS variables
 * Radix exposes so the viewport sizes itself to the active panel.
 */
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

/**
 * Props for {@link NavigationMenuIndicator}. Inherits from the Radix
 * `Indicator` primitive.
 */
export interface NavigationMenuIndicatorProps
  extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator> {}

/**
 * Optional small arrow that tracks the active trigger. Place inside
 * {@link NavigationMenuList} alongside the items.
 *
 * Visibility is driven by Radix via `data-state=visible|hidden`, with
 * fade animations gated behind `motion-safe:` for reduced-motion
 * users. Purely decorative — no ARIA role, no announcement.
 */
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
