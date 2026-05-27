import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const appHeaderVariants = cva(
  cn(
    'w-full flex items-center justify-between',
    'h-14 px-4 sm:px-6 lg:px-8',
  ),
  {
    variants: {
      tone: {
        default: 'bg-background text-foreground border-b border-border',
        brand: cn(
          'bg-bg-brand text-[var(--color-text-on-brand)]',
          // One-off translucent border on brand — STU-498 follow-up promotes
          // this to a `--color-border-on-brand` semantic token when a second
          // brand-tone surface needs the same value.
          'border-b border-[color-mix(in_srgb,white_20%,transparent)]',
        ),
        dark: cn(
          'bg-bg-inverse text-[var(--color-text-inverse)]',
          'border-b border-[var(--color-border-strong)]',
        ),
      },
      sticky: {
        true: 'sticky top-0 z-50',
        false: '',
      },
    },
    defaultVariants: {
      tone: 'default',
      sticky: true,
    },
  },
);

export type AppHeaderTone = NonNullable<VariantProps<typeof appHeaderVariants>['tone']>;

/**
 * Props for the {@link AppHeader} component. See the design spec at
 * `docs/superpowers/specs/2026-05-27-appheader-design.md` for the full
 * surface; this shell defines only layout-level props (tone, sticky,
 * ariaLabel). Subsequent commits add logo/appName, nav slot, right
 * cluster, theme toggle, and mobile drawer.
 */
export interface AppHeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'aria-label'> {
  /**
   * Visual tone:
   * - `default` (default) — `bg-background` + `border-b border-border`.
   *   Flips with the OS / explicit theme via existing token rebinds.
   * - `brand` — brand-blue surface. Identity-fixed (doesn't theme-flip).
   * - `dark` — always-dark surface regardless of theme.
   */
  tone?: AppHeaderTone;
  /**
   * Stick to the top of the viewport. Default `true`. Set to `false`
   * for non-scrolling app shells or inline use.
   */
  sticky?: boolean;
  /**
   * Accessible name for the landmark. Default `'Primary'`. Override
   * when more than one `<header>` lives on the same page (rare).
   */
  ariaLabel?: string;
}

/**
 * Opinionated, configurable application header. Renders a single
 * `<header>` landmark with token-driven tone variants and sticky-top
 * positioning. Composes existing DS pieces (NavBar / NavigationMenu /
 * Logo / Avatar / Button / Sheet / SearchBar / Icon) to cover the six
 * per-app header archetypes captured in the spec.
 *
 * Do not nest inside the unopinionated `PageHeader` slot from
 * `PageShell` — `AppHeader` IS the header landmark. Use `PageHeader`
 * for marketing-site / custom one-off layouts instead.
 *
 * Accessibility:
 * - Single `<header>` landmark per page (`aria-label="Primary"` by default).
 * - Sticky-top sits at `z-50` so dropdown / overlay content below the
 *   header doesn't render over it.
 *
 * @example Default app header
 * ```tsx
 * <AppHeader />
 * ```
 *
 * @example Brand-tone landing
 * ```tsx
 * <AppHeader tone="brand" />
 * ```
 */
export const AppHeader = React.forwardRef<HTMLElement, AppHeaderProps>(
  function AppHeader(
    { className, tone = 'default', sticky = true, ariaLabel = 'Primary', children, ...rest },
    ref,
  ) {
    return (
      <header
        ref={ref}
        aria-label={ariaLabel}
        className={cn(appHeaderVariants({ tone, sticky }), className)}
        {...rest}
      >
        {children}
      </header>
    );
  },
);
AppHeader.displayName = 'AppHeader';
