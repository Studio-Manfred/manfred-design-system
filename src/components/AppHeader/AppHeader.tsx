import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Logo, type LogoColor } from '@/components/Logo';
import { NavBar, NavItem } from '@/components/NavBar';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/NavigationMenu';

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

export interface AppHeaderNavItem {
  /** Visible label. */
  label: string;
  /** Link target. Omit if the item is a parent of `items` (renders as a dropdown trigger). */
  href?: string;
  /** Mark the current item; sets aria-current="page" on the rendered link. */
  active?: boolean;
  /** When present, the parent renders as a NavigationMenu dropdown trigger and `items` becomes the panel content. */
  items?: AppHeaderNavItem[];
  /** Render-prop for router integration (e.g. `as={Link}` for Next/Remix/React-Router). */
  as?: React.ElementType;
}

export interface AppHeaderUser {
  /** Display name, e.g. "Jens Wedin". Used as the Avatar's accessible alt. */
  name?: string;
  /** Email, e.g. "jens@studiomanfred.com". Rendered next to the sign-out button when provided and no name is set. */
  email?: string;
  /** Avatar image URL. Falls back to initials derived from `name` (or email-local-part) when absent. */
  avatarUrl?: string;
  /** Sign-out handler. Required to render the sign-out button. */
  onSignOut?: () => void;
  /** Button label. Defaults to "Sign out". */
  signOutLabel?: string;
}

/**
 * Logo `color` is brand-literal and does NOT rebind under dark mode.
 * AppHeader picks per surface — black on default; white on brand and dark.
 */
function logoColorForTone(tone: AppHeaderTone): LogoColor {
  return tone === 'default' ? 'black' : 'white';
}

function hasDropdowns(items: AppHeaderNavItem[]): boolean {
  return items.some((item) => Array.isArray(item.items) && item.items.length > 0);
}

function renderFlatNav(items: AppHeaderNavItem[]): React.ReactNode {
  return (
    <NavBar aria-label="Primary nav">
      {items.map((item) => (
        <NavItem
          key={item.label}
          href={item.href}
          active={item.active}
          as={item.as}
        >
          {item.label}
        </NavItem>
      ))}
    </NavBar>
  );
}

function renderDropdownNav(items: AppHeaderNavItem[]): React.ReactNode {
  return (
    <NavigationMenu aria-label="Primary nav">
      <NavigationMenuList>
        {items.map((item) => {
          if (item.items && item.items.length > 0) {
            return (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-1 p-2 min-w-[200px]">
                    {item.items.map((sub) => (
                      <li key={sub.label}>
                        <NavigationMenuLink
                          href={sub.href}
                          {...(sub.active ? { 'data-active': '' } : {})}
                          className={navigationMenuTriggerStyle()}
                        >
                          {sub.label}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          }
          return (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink
                href={item.href}
                {...(item.active ? { 'data-active': '' } : {})}
                className={navigationMenuTriggerStyle()}
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function renderUser(u: AppHeaderUser): React.ReactNode {
  const label = u.name ?? u.email ?? 'Account';
  const initialsSource = u.name ?? u.email?.split('@')[0] ?? '';
  return (
    <div className="flex items-center gap-3">
      {(u.avatarUrl || u.name) ? (
        <Avatar
          alt={label}
          src={u.avatarUrl}
          name={initialsSource}
          size="sm"
        />
      ) : null}
      {u.email && !u.name ? (
        <span className="text-sm text-muted-foreground hidden lg:inline">
          {u.email}
        </span>
      ) : null}
      {u.onSignOut ? (
        <Button variant="outline" size="sm" onClick={u.onSignOut}>
          {u.signOutLabel ?? 'Sign out'}
        </Button>
      ) : null}
    </div>
  );
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
   * Structured nav data. Picks `NavBar` when every item is flat; picks
   * `NavigationMenu` when any item has nested `items`. Renders nothing
   * when both `nav` and `navItems` are omitted.
   */
  navItems?: AppHeaderNavItem[];
  /**
   * Escape-hatch slot. When provided, this ReactNode is rendered as
   * the nav and `navItems` is ignored. Use for fully custom nav
   * surfaces (router-aware, etc.).
   */
  nav?: React.ReactNode;
  /**
   * Search slot. Typically `<SearchBar size="sm" />`. Hidden on mobile
   * (mobile drawer in Task 8 picks it up). Pass `null` to omit entirely.
   */
  search?: React.ReactNode;
  /**
   * Arbitrary right-aligned content rendered after `search` and before
   * `user`. Use for CTAs (e.g. `<Button variant="inverse">Get in touch</Button>`)
   * or custom menus that replace the typed `user` prop.
   */
  actions?: React.ReactNode;
  /**
   * Typed convenience for the common pattern (email/name + avatar +
   * sign-out button). To render a fully custom user menu instead, omit
   * `user` and pass your own dropdown via `actions`.
   */
  user?: AppHeaderUser;
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
      navItems,
      nav,
      search,
      actions,
      user,
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

    const navNode: React.ReactNode | null = nav
      ? nav
      : navItems && navItems.length > 0
      ? hasDropdowns(navItems)
        ? renderDropdownNav(navItems)
        : renderFlatNav(navItems)
      : null;

    return (
      <header
        ref={ref}
        aria-label={ariaLabel}
        className={cn(appHeaderVariants({ tone, sticky }), className)}
        {...rest}
      >
        <div className="flex items-center gap-6 min-w-0 flex-1">
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
          {navNode ? <div className="hidden md:flex">{navNode}</div> : null}
        </div>
        <div className="hidden md:flex items-center gap-3">
          {search ? <div>{search}</div> : null}
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          {user ? renderUser(user) : null}
        </div>
        {children}
      </header>
    );
  },
);
AppHeader.displayName = 'AppHeader';
