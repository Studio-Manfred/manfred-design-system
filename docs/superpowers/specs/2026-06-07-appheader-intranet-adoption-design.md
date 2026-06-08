# AppHeader enhancements for intranet adoption — Design Spec

**Date:** 2026-06-07
**Status:** Approved (brainstorm) — ready for implementation plan
**Component:** `src/components/AppHeader/` (+ `Icon`, consumed by `manfred-intranet`)

## Problem

The `manfred-intranet` app hand-rolls its header in `src/Layout.jsx` as a single
`flex justify-between` row — logo + 5 nav items on the left; theme button + search +
avatar + "Log out" on the right — with **no responsive collapse**. On a phone every
element stays inline and overruns the viewport, producing a horizontal scroll.

The DS already ships `AppHeader`, which collapses to a logo + hamburger drawer below
the `md` breakpoint. Adopting it is the fix for the scroll. But three things in the
intranet header cannot be expressed through `AppHeader`'s typed surface today, which is
why the app still hand-rolls its header:

| # | Intranet header does… | AppHeader today | Gap |
|---|---|---|---|
| 1 | Button-driven SPA nav: `<NavItem as="button" onClick={() => setCurrentPage(id)} active>`. No `href`. | `navItems` support `href` only — no `onClick`, no `type`. | **Blocker.** Can't express SPA nav as `navItems`, so it loses the styled mobile drawer. |
| 2 | 3-state theme cycle: light → dark → auto(system), Sun/Moon/Laptop icons. | Built-in toggle is 2-state (light ⇄ dark). | Adopting as-is drops the auto/system option. |
| 3 | Clickable avatar → navigates to profile, with active ring. | `user` avatar is display-only. | Avatar-as-profile-link isn't expressible via the typed `user` prop. |

## Goal

Add the three capabilities to `AppHeader` so the intranet can drop its hand-built
header and adopt `<AppHeader>`. Ship the DS changes as a new minor release, then swap
`Layout.jsx` in the `manfred-intranet` repo.

## Non-goals

- Redesigning AppHeader's visual layout or the mobile drawer (already shipped in v0.24.0).
- Adding a `logoHeight` prop, an `avatarVariant` prop, or an avatar tooltip. These are
  accepted minor visual deltas (see "Accepted visual deltas" below); revisit only if a
  second consumer needs them (YAGNI).
- Changing `NavBar`/`NavItem` — they already support `as="button"` + `onClick`.

## Decisions (from brainstorm)

- Preserve the 3-state theme cycle (build it into AppHeader). **Approved.**
- Preserve the clickable profile avatar (build it into AppHeader). **Approved.**
- Accept the theme storage-key migration (`'theme'` → `'manfred-theme'`), a one-time
  preference reset for existing intranet users. **Approved.**
- Scope: DS changes here **plus** the intranet `Layout.jsx` swap after the DS publishes.
  **Approved.**

## Enhancement A — button/onClick nav (the blocker)

Extend `AppHeaderNavItem`:

```ts
export interface AppHeaderNavItem {
  label: string;
  href?: string;
  active?: boolean;
  items?: AppHeaderNavItem[];
  as?: React.ElementType;
  /** Click handler — required for SPA/button-driven nav (use with `as="button"`). */
  onClick?: React.MouseEventHandler;
  /** Button type when `as="button"`. Defaults to `'button'`. */
  type?: 'button' | 'submit' | 'reset';
}
```

- `renderFlatNav` passes `onClick`, and `type` (when `as === 'button'`) through to
  `NavItem`. `NavItem` already supports `as="button"` with button attributes via its
  discriminated union (`src/components/NavBar/NavBar.tsx`), so no NavBar change is needed.
- `renderDropdownNav` is unaffected (dropdown items remain link-based for v1; a
  button-driven dropdown item is out of scope — the intranet has flat nav only).
- **Mobile drawer must close on SPA-nav activation.** With `href` links, clicking
  navigates and the Sheet unmounts with the page. With `onClick` SPA nav, nothing
  navigates, so the drawer would stay open. Therefore the Sheet becomes **controlled**
  inside AppHeader:
  - Add `const [menuOpen, setMenuOpen] = React.useState(false)` and wire
    `<Sheet open={menuOpen} onOpenChange={setMenuOpen}>`.
  - Each drawer nav item's handler calls the item's `onClick` (if any) **then**
    `setMenuOpen(false)`. Items that are plain `href` links keep navigating; closing
    state first is harmless because the navigation unmounts the tree anyway.

## Enhancement B — 3-state theme cycle

**`useThemeToggle` hook** (`src/components/AppHeader/useThemeToggle.ts`): add `cycle`.

```ts
export interface UseThemeToggleResult {
  preference: ThemePreference;
  resolved: 'light' | 'dark';
  setPreference: (next: ThemePreference) => void;
  toggle: () => void;
  /** Cycle the preference: light → dark → system → light. */
  cycle: () => void; // NEW
}
```

```ts
const cycle = useCallback(() => {
  const next: ThemePreference =
    preference === 'light' ? 'dark' : preference === 'dark' ? 'system' : 'light';
  setPreference(next);
}, [preference, setPreference]);
```

Order matches the intranet (light → dark → auto → light). `cycle` keys off the stored
`preference` (not `resolved`), so the three states are reachable in order.

**Icon glyph** (`src/components/Icon/iconPaths.ts`): add `monitor` (Heroicons Outline
`computer-desktop`, viewBox 0 0 24 24, strokeWidth 1.5):

```
'M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25'
```

**AppHeader `themeToggle` prop** widens from `boolean` to
`boolean | 'toggle' | 'cycle'`:

- `false` (default) — no toggle.
- `true` / `'toggle'` — existing 2-state button (light ⇄ dark). Back-compatible.
- `'cycle'` — new 3-state cycle button.

The cycle button shows the **current preference** icon (`sun` = light, `moon` = dark,
`monitor` = system) and uses `aria-label="Theme: {preference}. Activate to change."`
(no `aria-pressed`, because it is not a binary toggle). It calls `cycle()` on click.
The existing 2-state `ThemeToggleButton` is unchanged. Both render in the desktop right
cluster and the drawer footer, selected by the prop.

## Enhancement C — clickable profile avatar

Extend `AppHeaderUser`:

```ts
export interface AppHeaderUser {
  name?: string;
  email?: string;
  avatarUrl?: string;
  onSignOut?: () => void;
  signOutLabel?: string;
  /** Render the avatar as a link to the profile page. */
  avatarHref?: string;            // NEW
  /** OR render the avatar as a button (SPA profile nav). */
  onAvatarClick?: () => void;     // NEW
  /** Active state: ring + aria-current="page" on the avatar control. */
  avatarActive?: boolean;         // NEW
  /** Accessible label for the avatar control, e.g. "Edit your profile". */
  avatarLabel?: string;           // NEW
}
```

Behaviour:

- When `avatarHref` or `onAvatarClick` is set, the avatar (desktop right cluster **and**
  drawer footer) is wrapped in a link (`<a href>`) or `<button onClick>` respectively,
  with `aria-label={avatarLabel ?? name ?? 'Account'}`, `focus-visible` ring, and — when
  `avatarActive` — a `ring-2 ring-primary` and `aria-current="page"`.
- In the drawer, an `onAvatarClick` handler also closes the Sheet (calls `onAvatarClick`
  then `setMenuOpen(false)`), same pattern as nav items.
- When neither is set, the avatar is display-only (unchanged behaviour).
- `avatarHref` and `onAvatarClick` are mutually exclusive; if both are passed,
  `onAvatarClick` wins (button semantics) and a dev-time `console.warn` is emitted.

## Accepted visual deltas (intranet vs. AppHeader defaults)

These are intentional simplifications, not gaps to close:

- **Logo height:** intranet uses `height={32}`; AppHeader's `wordmark` is `24`. Accept
  AppHeader's default.
- **Avatar variant:** intranet uses `<Avatar variant="brand">`; AppHeader's `user` slot
  uses the default Avatar. Accept the default.
- **Tooltip:** intranet wraps the avatar/theme button in a DS `Tooltip`. AppHeader uses
  `aria-label` instead of a visible tooltip. Accept the aria-label.

## Testing

- **`useThemeToggle.test.ts`:** add `cycle()` cases — light→dark, dark→system,
  system→light; persists each to `localStorage`; applies/removes the `<html>` class.
- **`AppHeader.test.tsx`:**
  - nav `onClick` fires when a `navItems` button is activated;
  - drawer closes after a SPA nav click (controlled Sheet);
  - `themeToggle="cycle"` renders the preference icon and cycles on click;
  - avatar renders as a `<button>` (with `onAvatarClick`) / `<a>` (with `avatarHref`),
    carries `aria-current="page"` when `avatarActive`, and is display-only otherwise.
- **Stories + play functions** (`AppHeader.stories.tsx`): add `SpaNav` (button nav;
  play asserts the drawer closes after a click), `ThemeCycle`, and `ProfileAvatar`.
- **Gates:** `lint:play-tiers` (AppHeader stays **Tier B**), unit project, and the
  runtime a11y scan in **light + dark** (`scripts/a11y-runtime-scan.mjs`). No new axe
  violations.

## Intranet adoption recipe (acceptance test)

After the DS publishes, in `manfred-intranet`:

1. Bump `@studio-manfred/manfred-design-system` to the new version.
2. In `src/Layout.jsx`, replace the entire `<PageHeader>…</PageHeader>` block with:

```jsx
<AppHeader
  logo="wordmark"
  // no `appName` — intranet shows the logo only, no app-name label
  navItems={navItems.map(item => ({
    label: item.label,
    as: 'button',
    active: currentPage === item.id,
    onClick: () => setCurrentPage(item.id),
  }))}
  search={<Search onNavigate={onNavigate} />}
  user={{
    name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email,
    email: profile?.email,
    avatarUrl: profile?.avatar_url,
    avatarLabel: 'Edit your profile',
    avatarActive: currentPage === 'profile',
    onAvatarClick: () => setCurrentPage('profile'),
    onSignOut: handleLogout,
    signOutLabel: 'Log out',
  }}
  themeToggle="cycle"
/>
```

3. Delete the intranet's own theme state (`theme`/`systemPrefersDark` state, the two
   theme effects, `cycleTheme`, `ThemeIcon`, the lucide `Moon/Sun/Laptop` import) — the
   `themeToggle="cycle"` button + `useThemeToggle` own it now.
4. Delete the **manual** skip-link `<a href="#page-body">` — `PageShell` auto-renders one
   (verified in `PageShell.tsx`); the manual one is a duplicate.
5. `AppHeader` is a direct child of `PageShell`, replacing `PageHeader`. It is the
   `<header>` landmark and is sticky-top by default. Keep `<PageBody>`/`<Container>` as-is.

**Acceptance:** the intranet renders identically on desktop, collapses to logo +
hamburger below `md` with no horizontal scroll, the cycle button toggles
light/dark/system, and the avatar navigates to the profile page with an active ring.

## Sequencing

1. Implement Enhancements A–C in the DS (this branch).
2. Cut a new minor release of the DS (follow `reference_publishing` flow).
3. In `manfred-intranet`: bump the DS dep, apply the recipe, verify on a narrow viewport.
