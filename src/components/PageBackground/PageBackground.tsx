import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * PageBackground — wrapper that paints a token-driven surface across the
 * page (or any subtree). Use this at the top of a route to set the page
 * tone; compose with PageBody / Container for inner layout.
 *
 * v1 ships the wrapper-div approach only: it renders a single element with
 * `min-h-screen` and a token-mapped background utility. It does NOT mutate
 * `document.body`.
 *
 * TODO: a `scoped: false` opt-in that mutates `document.body.style` via a
 *   `useEffect` (with cleanup) is deferred until a real consumer needs it.
 *   That branch breaks SSR, so we keep it out of the public API for now.
 */

const pageBackgroundVariants = cva(
  // Always fill at least the viewport so the variant background is visible
  // even when children are short. Consumers can override via className.
  'min-h-screen',
  {
    variants: {
      variant: {
        // shadcn contract — flips automatically under .dark via var() indirection.
        default: 'bg-background text-foreground',
        // Warm cream surface (beige-light in light, neutral-800 in dark).
        warm: 'bg-[var(--color-bg-warm)] text-foreground',
        // Muted warm surface (beige in light, neutral-700 in dark).
        'warm-muted': 'bg-[var(--color-bg-warm-muted)] text-foreground',
        // Brand-accent surface (pink in light, neutral-700 in dark).
        accent: 'bg-accent text-accent-foreground',
        // Inverse pairing — dark surface with light text in light mode,
        // light surface with dark text in dark mode.
        inverse: 'bg-foreground text-background',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type PageBackgroundVariant = NonNullable<
  VariantProps<typeof pageBackgroundVariants>['variant']
>;

/**
 * Closed enum of allowed root elements. `main` is permitted, but
 * PageBackground does NOT replace `PageBody` (STU-46) — they compose:
 * `<PageBackground as="main">` is fine for a single-landmark page, but
 * for richer page shells use a wrapping `<div>` and put `<main>` inside.
 */
export type PageBackgroundElement = 'div' | 'section' | 'main';

export interface PageBackgroundProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'>,
    VariantProps<typeof pageBackgroundVariants> {
  /** Element to render. Defaults to `div`. */
  as?: PageBackgroundElement;
  children?: React.ReactNode;
}

export const PageBackground = React.forwardRef<HTMLElement, PageBackgroundProps>(
  function PageBackground(
    { as = 'div', variant = 'default', className, children, ...rest },
    ref,
  ) {
    return React.createElement(
      as,
      {
        ref,
        className: cn(pageBackgroundVariants({ variant }), className),
        ...rest,
      },
      children,
    );
  },
);
PageBackground.displayName = 'PageBackground';

export { pageBackgroundVariants };
