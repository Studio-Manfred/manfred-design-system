# `AppHeader` — unified, configurable application header

**Date:** 2026-05-27
**Status:** Spec — awaiting user review
**Branch:** TBD (`jens-wedin/appheader-component` likely)
**Linear:** TBD — to be filed once spec is approved

## Problem

Every Manfred app reimplements the header surface in a slightly different shape (six archetypes captured in the brief). The current DS gives consumers the building blocks — `NavBar`, `NavigationMenu`, `Avatar`, `Button`, `SearchBar`, and a thin unopinionated `<PageHeader>` slot inside `PageShell` — but no opinionated header component. Result: drift in spacing, logo positioning, mobile collapse behaviour, theme-toggle placement, and auth-area composition.

## Goals

* Ship one configurable component (`AppHeader`) that covers the six archetypes seen across apps with no per-app boilerplate.
* Keep the existing `PageHeader` slot intact as an escape hatch for non-app pages (marketing site, custom layouts).
* Route every visual decision through existing tokens — no new colour or spacing tokens.
* WCAG AA in light, dark, and brand tones; runtime axe scan zero-violations on every story.

## Non-goals

* Left vertical navigation (CRM-style `SideNav`) — separate ticket, bigger surface (collapsibility, mobile drawer interaction, active-state model).
* Second-row sub-nav as a standalone component — separate ticket, likely a recipe + tier-A story first, escalate to standalone only if drift demands it.
* Building a generic user / account menu primitive — this spec uses `Avatar` + `Button` for the typed `user` slot; a standalone `UserMenu` / `AccountDropdown` is a future ticket if/when needed.
* Replacing `NavBar`, `NavigationMenu`, or `PageHeader`. AppHeader composes them.

## Where it lives

New component directory: `src/components/AppHeader/` with `AppHeader.tsx`, `AppHeader.stories.tsx`, `AppHeader.test.tsx`, `index.ts`. Exported from the top-level barrel (`src/index.ts`).

The `useThemeToggle` hook ships from the same module:

```ts
export { AppHeader, useThemeToggle } from './components/AppHeader';
export type { AppHeaderProps, AppHeaderNavItem, AppHeaderUser, AppHeaderTone } from './components/AppHeader';
```

`PageHeader` (the slot sub-part of `PageShell`) stays exactly as it is — no breaking change in the barrel.

## Composition contract

`AppHeader` IS the `<header>` landmark. Use one or the other inside `PageShell`:

```tsx
// Opinionated (recommended for apps)
<PageShell>
  <AppHeader … />
  <PageBody>…</PageBody>
  <PageFooter>…</PageFooter>
</PageShell>

// Manual composition (marketing site, custom one-offs)
<PageShell>
  <PageHeader>
    {/* consumer composes NavBar / Logo / etc. by hand */}
  </PageHeader>
  <PageBody>…</PageBody>
</PageShell>
```

Do not nest `<PageHeader><AppHeader /></PageHeader>` — that produces two `<header>` landmarks. JSDoc + the component MDX page call this out.

## Props API

```ts
type AppHeaderTone = 'default' | 'brand' | 'dark';
type AppHeaderLogo = 'wordmark' | 'monogram' | React.ReactNode;
type AppHeaderBreakpoint = 'sm' | 'md' | 'lg';

interface AppHeaderNavItem {
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

interface AppHeaderUser {
  /** Display name, e.g. "Jens Wedin". Used as the avatar/menu trigger label. */
  name?: string;
  /** Email, e.g. "jens@studiomanfred.com". Rendered next to the sign-out button when provided. */
  email?: string;
  /** Avatar image URL. Falls back to initials from `name` (or email-local-part) if absent. */
  avatarUrl?: string;
  /** Sign-out handler. Required to render the sign-out button. */
  onSignOut?: () => void;
  /** Button label. Defaults to "Sign out". */
  signOutLabel?: string;
}

interface AppHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'aria-label'> {
  // -- Identity --

  /**
   * Brand mark. `'wordmark'` (default) renders the Manfred wordmark Logo;
   * `'monogram'` renders the monogram (smaller, square); a ReactNode lets a
   * consumer pass any custom mark. Pass `null` to suppress entirely
   * (archetype 6 — plain-text app title only).
   */
  logo?: AppHeaderLogo | null;

  /** Href for the logo anchor. Defaults to `'/'`. */
  logoHref?: string;

  /**
   * Sub-label rendered after the logo, e.g. "Intranet", "Admin", "Analytics".
   * Renders as `<Typography>` with `variant="bodyStrong"`.
   */
  appName?: string;

  // -- Top navigation --

  /**
   * Structured nav data. Picks `NavBar` if every item is flat; picks
   * `NavigationMenu` if any item has `items`. Renders nothing if both
   * `nav` and `navItems` are omitted.
   */
  navItems?: AppHeaderNavItem[];

  /**
   * Escape-hatch slot. When provided, this ReactNode is rendered as the
   * nav and `navItems` is ignored. Use for fully custom nav surfaces
   * (e.g. router-aware `<NavBar>` already composed by the consumer).
   */
  nav?: React.ReactNode;

  // -- Right-side content --

  /**
   * Search slot. Typically `<SearchBar size="sm" />`. Hidden on mobile
   * (renders inside the drawer instead). Pass `null` to omit entirely.
   */
  search?: React.ReactNode;

  /**
   * Arbitrary right-aligned content rendered after `search` and before
   * `user`. Use for CTAs (e.g. `<Button variant="inverse">Get in touch</Button>`)
   * or custom menus that replace the typed `user` prop.
   */
  actions?: React.ReactNode;

  /**
   * Typed convenience for the common pattern (email/name + avatar + sign-out
   * button). When provided, AppHeader renders the standard auth area. To
   * render a fully custom user menu instead, omit `user` and pass your own
   * dropdown via `actions`.
   */
  user?: AppHeaderUser;

  /**
   * Render a built-in light/dark theme toggle (Icon button) on the
   * right edge. Uses `useThemeToggle` internally. Default `false`.
   */
  themeToggle?: boolean;

  // -- Layout / visual --

  /**
   * Visual tone:
   * - `'default'` (default) — `bg-background`, `border-b border-border`.
   *   Adapts to light/dark via the existing token rebinds.
   * - `'brand'` — `bg-bg-brand`. Logo flips to monogram-on-brand;
   *   text uses `--color-text-on-brand`; nav active state uses
   *   `--color-text-link-on-brand`. Identity-fixed in both themes.
   * - `'dark'` — `bg-bg-inverse`. Always-dark surface regardless of theme.
   */
  tone?: AppHeaderTone;

  /**
   * Stick to the top of the viewport. Default `true`. Set to `false`
   * for non-scrolling app shells or inline use.
   */
  sticky?: boolean;

  /**
   * Tailwind-style breakpoint at which nav collapses into a hamburger
   * Sheet. Default `'md'` (768px). Affects only the nav slot — the logo
   * and theme toggle stay visible in the top bar at all sizes.
   */
  mobileBreakpoint?: AppHeaderBreakpoint;

  /**
   * Landmark `aria-label` on the `<header>`. Default `'Primary'`.
   * Set when more than one `<header>` exists on a page (rare).
   */
  ariaLabel?: string;
}
```

### Slot precedence (when more than one is provided)

| Slot | Wins over |
|---|---|
| `nav` | `navItems` (escape hatch beats helper) |
| `actions` containing a user menu | `user` (consumers wanting a custom user dropdown drop the typed prop) |

The component does NOT enforce mutual exclusion at the type level — passing both is permitted (the escape hatch slot renders, the helper prop is ignored). JSDoc documents the precedence.

## Default layout

### Desktop (≥ `mobileBreakpoint`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [logo][appName]  [nav]                       [search] [actions] [user] [☾]   │
└──────────────────────────────────────────────────────────────────────────────┘
                  ↑                            ↑
                  start cluster (flex-start)   end cluster (flex-end)
```

Internally: a flex row, `justify-between`, with two clusters. Padding `px-4 sm:px-6 lg:px-8`, height `h-14` (56px) by default (matches existing PageHeader height).

### Mobile (< `mobileBreakpoint`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [logo][appName]                                                          [☰] │
└──────────────────────────────────────────────────────────────────────────────┘
```

Hamburger opens a right-aligned `<Sheet>` containing, stacked vertically:

1. Search (if provided)
2. Nav items (rendered as a vertical `<NavBar>` regardless of whether the desktop nav used dropdowns — dropdowns expand inline)
3. Actions (any provided ReactNode)
4. User block (avatar, name, email, sign-out)
5. Theme toggle (if `themeToggle={true}`)

Sheet auto-closes on nav-item activation. Theme toggle stays in the drawer to keep the top bar minimal.

## Tone behaviour

```ts
const appHeaderVariants = cva('w-full flex items-center justify-between', {
  variants: {
    tone: {
      default: 'bg-background text-foreground border-b border-border',
      brand:   'bg-bg-brand text-[var(--color-text-on-brand)] border-b border-[color-mix(in_srgb,white_20%,transparent)]',
      dark:    'bg-bg-inverse text-[var(--color-text-inverse)] border-b border-[var(--color-border-strong)]',
    },
    sticky: {
      true:  'sticky top-0 z-50',
      false: '',
    },
  },
  defaultVariants: { tone: 'default', sticky: true },
});
```

The brand-tone border uses a translucent white via `color-mix`. If `color-mix` token discipline matters (memory's "phantom token" guard doesn't apply since this is a value, not a token), consider adding a `--color-border-on-brand` semantic token in a follow-up; out of scope for v1.

Logo rendering by tone:
* `default` — wordmark variant (current default).
* `brand` — wordmark-on-brand variant if `logo='wordmark'`; monogram-on-brand if `logo='monogram'`.
* `dark` — wordmark light-on-dark.

The DS `Logo` component already supports these — `AppHeader` just picks the right variant.

## Theme toggle + `useThemeToggle`

Hook signature:

```ts
type ThemePreference = 'light' | 'dark' | 'system';

interface UseThemeToggleResult {
  /** The user's stored preference. */
  preference: ThemePreference;
  /** The currently rendered theme (resolves 'system' to 'light' or 'dark'). */
  resolved: 'light' | 'dark';
  /** Set the preference and persist it. */
  setPreference: (next: ThemePreference) => void;
  /** Convenience: toggle between light and dark, preserving an existing 'system' user as 'light'-then-dark. */
  toggle: () => void;
}

export function useThemeToggle(): UseThemeToggleResult;
```

Contract:
* Stores the preference under `localStorage` key `'manfred-theme'`.
* Applies the class to `<html>` per the existing DS convention (`.dark` / `.light` per `tokens.css`).
* `'system'` removes the class so OS preference wins (matches the existing dark-mode story).
* SSR-safe: returns `'system'` / `'light'` defaults until `useEffect` reads localStorage post-mount.
* On mount, re-applies the stored preference (prevents flash for client-rendered apps; SSR consumers add a small script — documented separately).

`AppHeader`'s built-in toggle is a single Icon button: sun ↔ moon swap, `aria-label` swaps in lockstep (`"Switch to dark mode"` ↔ `"Switch to light mode"`), `aria-pressed` reflects the resolved theme.

## Accessibility

* Single `<header>` landmark per page. `aria-label="Primary"` by default.
* Nav: routes through `<NavBar>` or `<NavigationMenu>` per `navItems` shape — both already a11y-clean.
* Active link: `aria-current="page"` (`NavBar` auto-applies from `active={true}`; `NavigationMenu` via the `data-active` convention).
* Mobile drawer: focus-trap inside Sheet, focus returns to hamburger on close, `aria-expanded` on trigger.
* Theme toggle: `aria-pressed` + `aria-label` swap.
* User dropdown: trigger labelled `${user.name ?? user.email}`; menu items keyboard-reachable; Esc closes; focus returns to trigger.
* All motion gated behind `motion-safe:` (existing convention).
* Runtime axe scan passes for every story in light, dark, and brand tones.

## Examples — six archetypes

Each maps to one screenshot from the brief.

```tsx
// 1. Intranet — logo + nav + search + theme toggle + avatar + sign-out
<AppHeader
  navItems={[
    { label: 'Home', href: '/' },
    { label: 'Boards', href: '/boards', active: true },
    { label: 'Information', href: '/info' },
    { label: 'Blog', href: '/blog' },
    { label: 'Dashboard', href: '/dashboard' },
  ]}
  search={<SearchBar size="sm" placeholder="Search" shortcut="⌘K" />}
  themeToggle
  user={{ avatarUrl: '/me.jpg', onSignOut }}
/>

// 2. Minimal dashboard
<AppHeader
  navItems={[{ label: 'Dashboard', href: '/', active: true }]}
  themeToggle
/>

// 3. Email + sign-out
<AppHeader
  navItems={[
    { label: 'Dashboard', href: '/' },
    { label: 'Admin', href: '/admin', active: true },
  ]}
  themeToggle
  user={{ email: 'jens@studiomanfred.com', onSignOut }}
/>

// 4. CRM (header only; SideNav is a separate ticket)
<AppHeader user={{ email: 'jens@studiomanfred.com', onSignOut }} themeToggle />
{/* … <SideNav /> … */}

// 5. Brand-tone landing — CTA only
<AppHeader
  tone="brand"
  logo="wordmark"
  actions={<Button variant="inverse">Get in touch</Button>}
/>

// 6. Plain-text app title only — no logo
<AppHeader
  logo={null}
  appName="Manfred Analytics"
  user={{ onSignOut }}
/>
```

## Storybook

* Stories under `Components/AppHeader`:
  * `Default` — sandbox / Playground with Controls.
  * `WithFlatNav` — archetype 1 / 2 / 3.
  * `WithDropdownNav` — uses `navItems` with nested `items`, exercises NavigationMenu.
  * `WithNavSlot` — escape-hatch `nav={…}` overrides `navItems`.
  * `BrandTone` — archetype 5.
  * `DarkTone` — always-dark surface.
  * `MobileDrawer` — viewport sized below `mobileBreakpoint`, hamburger open by default.
  * `WithThemeToggle` — exercises the built-in toggle; play function asserts the `aria-pressed` swap.
  * `WithUserMenu` — typed `user` prop with name+email+avatar+sign-out.
  * `ComposedFullExample` — full PageShell + AppHeader + body content, mirrors screenshot 1.
* Tier: **B** (interactive — user click on theme toggle, hamburger, user menu). Add to `scripts/play-tiers.json`.
* `play` functions assert landmark, nav-item activation (incl. `aria-current="page"`), drawer open/close + focus return, theme-toggle aria-swap, user-menu open + sign-out callback fires.

## Unit tests

* `AppHeader.test.tsx` covers prop wiring (renders nav, renders user block, renders theme toggle, omits sections when missing, picks `NavBar` vs `NavigationMenu` per `navItems` shape, slot precedence).
* `useThemeToggle.test.ts` (or co-located) covers the hook with a jsdom localStorage spy: initial `'system'` default, `setPreference` persists + applies class, `toggle` flips, SSR-safe initial state.

## Docs

* New `src/components/AppHeader/AppHeader.mdx` walking through the six archetypes (mirrors STU-443's Links subsection style — code + live `<Canvas of=…>`).
* README "Components" list gets `AppHeader` inserted alphabetically.
* `Theming` README subsection gains a one-paragraph note pointing at `useThemeToggle` for non-AppHeader theme-switch surfaces.

## Acceptance criteria

* [ ] `AppHeader` exported from the barrel; `useThemeToggle` exported alongside.
* [ ] Six-archetype gallery renders correctly in Storybook (light + dark + brand).
* [ ] `npm run test`, `npm run test:storybook`, `npm run lint:play-tiers`, runtime a11y scan (light + dark) all green; zero new violations.
* [ ] `npm run build` clean; sourcemap intact.
* [ ] CHANGELOG entry under `[Unreleased]` + Added.
* [ ] README updated with `AppHeader` in the Components list and `useThemeToggle` mention in Theming.

## Implementation order

1. Land `useThemeToggle` hook + tests first (smallest island; no UI dependencies).
2. Land `AppHeader` shell — `<header>` element + tone variants + cva.
3. Add layout slots: logo + appName, nav (with `navItems` → NavBar/NavigationMenu picker), search, actions, user, theme toggle.
4. Add mobile collapse via `<Sheet>` drawer.
5. Wire stories with the six archetypes + play functions.
6. Add to `scripts/play-tiers.json` as tier B.
7. Update barrel exports, README, docs MDX.
8. CHANGELOG entry under `[Unreleased]`.

## Risks / open questions

* **Color-mix border on brand tone:** The `border-[color-mix(…)]` rule introduces a non-token value in the variants. Either accept the one-off (it's not a colour token, it's a derived translucent), or add `--color-border-on-brand` as a semantic token (~3 lines in `tokens.css`). I lean accept-the-one-off for v1; revisit if a second brand-tone surface ever needs the same border.
* **Logo + tone interaction:** Requires the `Logo` component to expose tone-aware variants (wordmark-on-brand, monogram-on-brand). Need to verify the current Logo prop surface before implementation — possible micro-spec required if it doesn't already support this. Will check during plan-writing.
* **Sheet for mobile drawer:** The DS already exports `Sheet`. Verify the dependency surface (Radix dialog) plays nicely with the AppHeader's `<header>` landmark — Sheet renders in a portal, so no nested-landmark issue.
* **SSR / theme flash:** `useThemeToggle` post-mount reads localStorage and applies the class. For SSR consumers (Next.js App Router with v0.23.0's `"use client"` banner), a tiny inline `<script>` snippet documented in the MDX page sets the class before React hydrates. Codify the snippet in docs; don't ship a Script component in v1.
* **Tier-B story coverage:** Multiple play functions across many stories. Validate during implementation that runtime cost is acceptable; downgrade non-critical stories to tier-C if needed.

## Follow-up tickets to file after spec approval

* **SubNavBar / SecondaryNav** — recipe + tier-A story using existing `NavBar`. Escalate to standalone component only if drift demands.
* **SideNav** — CRM-style left vertical nav. Bigger surface, own discovery.
* **`--color-border-on-brand` semantic token** — if a second brand-tone surface ever needs the same translucent-white border, codify.
* **`UserMenu` / `AccountDropdown` primitive** — only if a second app surface needs the same opinionated dropdown shape.

## Out of band

* Will file a Linear ticket under "Studio Manfred Design System" project with this spec linked once you sign off.
