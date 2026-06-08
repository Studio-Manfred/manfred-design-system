import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
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
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/Sheet';
import { useThemeToggle, type ThemePreference } from './useThemeToggle';

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
export type AppHeaderBreakpoint = 'sm' | 'md' | 'lg';
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
  /** Click handler — required for SPA / button-driven nav (use with `as="button"`). */
  onClick?: React.MouseEventHandler;
  /** Button type when `as="button"`. Defaults to `'button'`. */
  type?: 'button' | 'submit' | 'reset';
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
  /** Render the avatar as a link to the profile page. */
  avatarHref?: string;
  /** OR render the avatar as a button (SPA profile nav). Wins over avatarHref if both set. */
  onAvatarClick?: () => void;
  /** Active state on the avatar control: ring + aria-current="page". */
  avatarActive?: boolean;
  /** Accessible label for the avatar control, e.g. "Edit your profile". */
  avatarLabel?: string;
}

/**
 * Logo `color` is brand-literal and does NOT rebind under dark mode.
 * AppHeader picks per surface:
 * - default tone: blue on light, white on dark (resolved from useThemeToggle).
 * - brand + dark tones: always white (identity-fixed surfaces).
 */
function logoColorForTone(
  tone: AppHeaderTone,
  resolvedTheme: 'light' | 'dark',
): LogoColor {
  if (tone === 'default') {
    // Light surface → brand blue. Dark surface → white. Logo component
    // is brand-literal; AppHeader picks the variant per resolved theme.
    return resolvedTheme === 'dark' ? 'white' : 'blue';
  }
  // brand + dark tones are identity-fixed (white).
  return 'white';
}

// Tailwind v4 doesn't see through string concatenation, so we map the
// breakpoint key to literal class strings. Hidden-below at the chosen
// breakpoint flips visibility — the desktop clusters use `BREAKPOINT_HIDDEN`,
// the mobile hamburger uses `BREAKPOINT_VISIBLE_BELOW`.
const BREAKPOINT_HIDDEN: Record<AppHeaderBreakpoint, string> = {
  sm: 'hidden sm:flex',
  md: 'hidden md:flex',
  lg: 'hidden lg:flex',
};

const BREAKPOINT_VISIBLE_BELOW: Record<AppHeaderBreakpoint, string> = {
  sm: 'sm:hidden',
  md: 'md:hidden',
  lg: 'lg:hidden',
};

function hasDropdowns(items: AppHeaderNavItem[]): boolean {
  return items.some((item) => Array.isArray(item.items) && item.items.length > 0);
}

function renderFlatNav(items: AppHeaderNavItem[]): React.ReactNode {
  return (
    <NavBar aria-label="Primary nav">
      {items.map((item) => (
        <NavItem
          key={item.label}
          active={item.active}
          as={item.as}
          onClick={item.onClick}
          {...(item.as === 'button'
            ? { type: item.type ?? 'button' }
            : { href: item.href })}
        >
          {item.label}
        </NavItem>
      ))}
    </NavBar>
  );
}

// NOTE: dropdown nav items are link-based only (v1). Button/onClick nav is
// supported for flat navItems; a button-driven dropdown item is out of scope.
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

function AvatarControl({
  u,
  onNavigate,
}: {
  u: AppHeaderUser;
  onNavigate?: () => void;
}): React.ReactElement | null {
  const label = u.avatarLabel ?? u.name ?? u.email ?? 'Account';
  const initialsSource = u.name ?? u.email?.split('@')[0] ?? '';
  if (!u.avatarUrl && !u.name) return null;

  const interactive = u.onAvatarClick != null || u.avatarHref != null;

  const avatar = (
    <Avatar
      alt={label}
      src={u.avatarUrl}
      name={initialsSource}
      size="sm"
      // When wrapped in a labelled button/link, hide the inner role="img"
      // so screen readers don't announce the accessible name twice.
      {...(interactive ? { 'aria-hidden': true } : {})}
    />
  );
  if (!interactive) return avatar;

  const controlCls = cn(
    'inline-flex rounded-full overflow-hidden',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    u.avatarActive ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-border',
    'motion-safe:transition-shadow',
  );
  const activeAttr = u.avatarActive ? { 'aria-current': 'page' as const } : {};

  if (u.onAvatarClick != null) {
    if (u.avatarHref != null) {
      console.warn('[AppHeader] `user.avatarHref` ignored because `user.onAvatarClick` is set.');
    }
    return (
      <button
        type="button"
        onClick={() => {
          u.onAvatarClick?.();
          onNavigate?.();
        }}
        aria-label={label}
        {...activeAttr}
        className={controlCls}
      >
        {avatar}
      </button>
    );
  }

  return (
    <a href={u.avatarHref} aria-label={label} {...activeAttr} className={controlCls}>
      {avatar}
    </a>
  );
}

function renderUser(u: AppHeaderUser): React.ReactNode {
  return (
    <div className="flex items-center gap-3">
      <AvatarControl u={u} />
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

interface ThemeToggleButtonProps {
  resolved: 'light' | 'dark';
  toggle: () => void;
}

function ThemeToggleButton({ resolved, toggle }: ThemeToggleButtonProps): React.ReactElement {
  const nextLabel = resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={nextLabel}
      aria-pressed={resolved === 'dark'}
      className={cn(
        'inline-flex items-center justify-center',
        'h-8 w-8 rounded-full',
        'text-foreground/80 hover:bg-accent hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'motion-safe:transition-colors',
      )}
    >
      <Icon
        name={resolved === 'dark' ? 'sun' : 'moon'}
        size="sm"
        aria-hidden
      />
    </button>
  );
}

interface ThemeCycleButtonProps {
  preference: ThemePreference;
  cycle: () => void;
}

function ThemeCycleButton({ preference, cycle }: ThemeCycleButtonProps): React.ReactElement {
  const iconName = preference === 'light' ? 'sun' : preference === 'dark' ? 'moon' : 'monitor';
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${preference}. Activate to change.`}
      className={cn(
        'inline-flex items-center justify-center',
        'h-8 w-8 rounded-full',
        'text-foreground/80 hover:bg-accent hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'motion-safe:transition-colors',
      )}
    >
      <Icon name={iconName} size="sm" aria-hidden />
    </button>
  );
}

/** Pick the theme control for the `themeToggle` prop value. */
function renderThemeControl(
  mode: boolean | 'toggle' | 'cycle',
  ctx: {
    resolved: 'light' | 'dark';
    toggle: () => void;
    preference: ThemePreference;
    cycle: () => void;
  },
): React.ReactNode {
  if (!mode) return null;
  if (mode === 'cycle') return <ThemeCycleButton preference={ctx.preference} cycle={ctx.cycle} />;
  return <ThemeToggleButton resolved={ctx.resolved} toggle={ctx.toggle} />;
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
   * Render a built-in theme control on the right of the desktop cluster
   * (and in the mobile drawer footer). `true` / `'toggle'` → 2-state
   * light⇄dark button. `'cycle'` → 3-state light→dark→system button
   * (sun/moon/monitor). Uses `useThemeToggle` internally. Default `false`.
   */
  themeToggle?: boolean | 'toggle' | 'cycle';
  /**
   * Tailwind breakpoint at which the desktop nav + right cluster
   * collapse into a hamburger Sheet. Default `'md'` (768px).
   */
  mobileBreakpoint?: AppHeaderBreakpoint;
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
      themeToggle = false,
      mobileBreakpoint = 'md',
      tone = 'default',
      sticky = true,
      ariaLabel = 'Primary',
      children,
      ...rest
    },
    ref,
  ) {
    const { resolved, toggle, preference, cycle } = useThemeToggle();
    const [menuOpen, setMenuOpen] = React.useState(false);

    const renderLogo = (): React.ReactNode => {
      if (logo === null) return null;
      if (logo === 'wordmark' || logo === 'monogram') {
        return (
          <Logo
            variant={logo}
            color={logoColorForTone(tone, resolved)}
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
        <div className="flex items-center gap-8 min-w-0 flex-1">
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
          {navNode ? <div className={cn(BREAKPOINT_HIDDEN[mobileBreakpoint], 'text-sm')}>{navNode}</div> : null}
        </div>
        <div className={cn(BREAKPOINT_HIDDEN[mobileBreakpoint], 'items-center gap-3 ml-6 shrink-0')}>
          {search ? <div>{search}</div> : null}
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          {user ? renderUser(user) : null}
          {themeToggle ? renderThemeControl(themeToggle, { resolved, toggle, preference, cycle }) : null}
        </div>
        <div className={BREAKPOINT_VISIBLE_BELOW[mobileBreakpoint]}>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className={cn(
                  'inline-flex items-center justify-center',
                  'h-10 w-10 rounded-full',
                  'text-foreground hover:bg-accent',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                <Icon name="menu" size="md" aria-hidden />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <div className="flex flex-col h-full mt-4">
                {/* Optional search at top — stretch the slot's content to the
                    full drawer width (the desktop cluster keeps it compact). */}
                {search ? <div className="mb-4 [&>*]:w-full">{search}</div> : null}

                {/* Nav items — full-width, larger touch targets. When only the
                    'nav' ReactNode escape hatch is provided (no structured navItems),
                    render that as-is — consumer owns the layout. */}
                {navItems && navItems.length > 0 ? (
                  <nav aria-label="Primary nav" className="flex flex-col gap-1">
                    {navItems.map((item) => {
                      const Comp = (item.as ?? 'a') as React.ElementType;
                      const handleClick: React.MouseEventHandler = (e) => {
                        item.onClick?.(e);
                        setMenuOpen(false);
                      };
                      return (
                        <Comp
                          key={item.label}
                          {...(item.as === 'button'
                            ? { type: item.type ?? 'button' }
                            : { href: item.href })}
                          onClick={handleClick}
                          {...(item.active ? { 'aria-current': 'page' } : {})}
                          className={cn(
                            'block w-full px-3 py-3 text-base rounded-[var(--radius-md)]',
                            'text-foreground hover:bg-accent',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            item.active && 'bg-accent font-semibold',
                          )}
                        >
                          {item.label}
                        </Comp>
                      );
                    })}
                  </nav>
                ) : (
                  navNode
                )}

                {/* Optional actions stacked */}
                {actions ? <div className="flex flex-col gap-2 mt-4">{actions}</div> : null}

                {/* Footer pinned to bottom of the drawer */}
                <div className="mt-auto">
                  {/* Full-width sign-out */}
                  {user?.onSignOut ? (
                    <Button
                      variant="outline"
                      onClick={user.onSignOut}
                      className="w-full mt-4"
                    >
                      {user.signOutLabel ?? 'Sign out'}
                    </Button>
                  ) : null}

                  {/* Divider — only when there's user info OR a theme toggle below */}
                  {(user || themeToggle) ? (
                    <hr className="my-4 border-border" />
                  ) : null}

                  {/* Bottom row: identity info on the left, theme toggle on the right */}
                  {(user || themeToggle) ? (
                    <div className="flex items-center justify-between gap-3">
                      {user ? (
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <AvatarControl u={user} onNavigate={() => setMenuOpen(false)} />
                          <div className="flex flex-col min-w-0 leading-tight">
                            {user.name ? (
                              <span className="text-sm font-medium truncate">{user.name}</span>
                            ) : null}
                            {user.email ? (
                              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1" />
                      )}
                      {themeToggle ? renderThemeControl(themeToggle, { resolved, toggle, preference, cycle }) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {children}
      </header>
    );
  },
);
AppHeader.displayName = 'AppHeader';
