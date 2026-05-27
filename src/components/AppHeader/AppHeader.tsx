import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Logo, type LogoColor } from '@/components/Logo';

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
export type AppHeaderLogo = 'wordmark' | 'monogram' | React.ReactNode;

/**
 * Logo `color` is brand-literal and does NOT rebind under dark mode.
 * AppHeader picks per surface — black on default; white on brand and dark.
 */
function logoColorForTone(tone: AppHeaderTone): LogoColor {
  return tone === 'default' ? 'black' : 'white';
}

/**
 * Props for the {@link AppHeader} component. See the design spec at
 * `docs/superpowers/specs/2026-05-27-appheader-design.md` for the full
 * surface; subsequent commits add the nav slot, right cluster, theme
 * toggle, and mobile drawer.
 */
export interface AppHeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'aria-label'> {
  /**
   * Brand mark. `'wordmark'` (default) / `'monogram'` use the DS
   * `Logo` component with tone-appropriate color. A ReactNode is
   * rendered bare (no auto-link). `null` suppresses the logo entirely
   * (use with `appName` for plain-text app titles).
   */
  logo?: AppHeaderLogo | null;
  /** Href for the logo anchor. Defaults to `'/'`. */
  logoHref?: string;
  /** Sub-label rendered after the logo, e.g. "Intranet". */
  appName?: string;
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
 * - Built-in logo link is labelled `"Manfred home"` for AT.
 *
 * @example Default app header
 * ```tsx
 * <AppHeader />
 * ```
 *
 * @example With appName + brand tone
 * ```tsx
 * <AppHeader tone="brand" appName="Intranet" />
 * ```
 */
export const AppHeader = React.forwardRef<HTMLElement, AppHeaderProps>(
  function AppHeader(
    {
      className,
      logo = 'wordmark',
      logoHref = '/',
      appName,
      tone = 'default',
      sticky = true,
      ariaLabel = 'Primary',
      children,
      ...rest
    },
    ref,
  ) {
    const renderLogo = (): React.ReactNode => {
      if (logo === null) return null;
      if (logo === 'wordmark' || logo === 'monogram') {
        return (
          <Logo
            variant={logo}
            color={logoColorForTone(tone)}
            height={logo === 'monogram' ? 28 : 24}
            aria-label="Manfred home"
          />
        );
      }
      return logo;
    };

    const logoNode = renderLogo();
    const hasLogoLink = logoNode !== null && (logo === 'wordmark' || logo === 'monogram');

    return (
      <header
        ref={ref}
        aria-label={ariaLabel}
        className={cn(appHeaderVariants({ tone, sticky }), className)}
        {...rest}
      >
        <div className="flex items-center gap-3 min-w-0">
          {logoNode &&
            (hasLogoLink ? (
              <a
                href={logoHref}
                className="inline-flex items-center rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {logoNode}
              </a>
            ) : (
              logoNode
            ))}
          {appName ? (
            <span className="font-semibold text-base truncate">{appName}</span>
          ) : null}
        </div>
        {children}
      </header>
    );
  },
);
AppHeader.displayName = 'AppHeader';
