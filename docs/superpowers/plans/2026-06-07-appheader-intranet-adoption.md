# AppHeader Intranet Adoption — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three capabilities to the DS `AppHeader` — `onClick`/button-driven nav (with mobile-drawer auto-close), a 3-state theme cycle (light/dark/system), and a clickable profile avatar — so `manfred-intranet` can drop its hand-built header (the source of its mobile horizontal scroll) and adopt `<AppHeader>`.

**Architecture:** Extend AppHeader's *typed* props (not the `nav`/`actions` escape hatches) so the styled mobile drawer keeps working. Three building blocks come first (a `monitor` icon glyph, a `cycle()` on the existing `useThemeToggle` hook), then the three AppHeader behaviours layer on top of the v0.24.0 component. The Sheet drawer becomes controlled so SPA nav (which doesn't navigate away) closes it. Phase 2 ships a DS release and applies the adoption in the separate `manfred-intranet` repo.

**Tech Stack:** React 19 + TypeScript, Vite library build, Vitest (jsdom `unit` project + Chromium `storybook` project), Storybook 10, Tailwind v4 token classes, Radix (Sheet/NavigationMenu), Heroicons-outline path data.

**Spec:** `docs/superpowers/specs/2026-06-07-appheader-intranet-adoption-design.md`

**Branch:** `feat/appheader-intranet-adoption` (already created off `main`; the spec commit is the first commit on it).

**Execution notes for the controller:**
- Tasks 3, 4, 5 all modify `src/components/AppHeader/AppHeader.tsx` — run them **sequentially on this single branch** (no parallel dispatch; concurrent commits on a shared file/branch race). Tasks 1 and 2 touch separate files and could in principle run first in any order, but keep it sequential for simplicity.
- After every implementer DONE: `git show <sha> --stat` to confirm scope before dispatching the reviewer.
- Run the single-file unit command shown in each task (fast); the full a11y + storybook gates run once in Task 6.

---

## Phase 1 — DS enhancements (executable now)

### Task 1: Add the `monitor` icon glyph

The 3-state theme cycle needs a "system/auto" icon. `IconName` is a **hand-maintained union** — it must be updated in lockstep with `iconPaths` (see the comment at `src/components/Icon/Icon.tsx:6-11`).

**Files:**
- Modify: `src/components/Icon/iconPaths.ts` (add `monitor` path)
- Modify: `src/components/Icon/Icon.tsx:12-40` (add `'monitor'` to the `IconName` union)
- Test: `src/components/Icon/Icon.test.tsx:38-49` (extend the `it.each` glyph list)

- [ ] **Step 1: Add `'monitor'` to the icon smoke-test list (failing test)**

In `src/components/Icon/Icon.test.tsx`, extend the existing `it.each` list (currently `'sun', 'moon', 'menu', 'log-out'`):

```ts
  it.each([
    'sun',
    'moon',
    'menu',
    'log-out',
    'monitor',
  ] as const)('renders %s icon with valid path', (name) => {
    const { container } = render(<Icon name={name} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.querySelector('path')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the test, verify it fails on the type**

Run: `npx vitest run --project unit src/components/Icon/Icon.test.tsx`
Expected: FAIL — TypeScript errors that `'monitor'` is not assignable to `IconName` (the union doesn't include it yet), or a runtime render with no `<path>` because `iconPaths['monitor']` is `undefined`.

- [ ] **Step 3: Add the `monitor` path to `iconPaths.ts`**

In `src/components/Icon/iconPaths.ts`, add this entry inside the `iconPaths` object (place it after the `moon` entry, near the other UI glyphs):

```ts
  // Computer-desktop (Heroicons outline) — the "system / auto" theme state.
  monitor:
    'M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25',
```

- [ ] **Step 4: Add `'monitor'` to the `IconName` union**

In `src/components/Icon/Icon.tsx`, append to the union (after `'settings'` at line 40, replacing the terminating `;`):

```ts
  | 'settings'
  | 'monitor';
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `npx vitest run --project unit src/components/Icon/Icon.test.tsx`
Expected: PASS (all glyph cases including `monitor`).

- [ ] **Step 6: Commit**

```bash
git add src/components/Icon/iconPaths.ts src/components/Icon/Icon.tsx src/components/Icon/Icon.test.tsx
git commit -m "feat(icon): add monitor glyph for theme system/auto state"
```

---

### Task 2: Add `cycle()` to `useThemeToggle`

The hook already tracks `'system'` + `resolved` (`src/components/AppHeader/useThemeToggle.ts`). Add a `cycle` that advances light → dark → system → light, keyed off the stored `preference` (not `resolved`) so all three states are reachable in order.

**Files:**
- Modify: `src/components/AppHeader/useThemeToggle.ts`
- Test: `src/components/AppHeader/useThemeToggle.test.ts`

- [ ] **Step 1: Write the failing test**

In `src/components/AppHeader/useThemeToggle.test.ts`, add this test inside the existing `describe('useThemeToggle', …)` block (after the last `it`):

```ts
  it('cycle() advances light → dark → system → light', () => {
    const { result } = renderHook(() => useThemeToggle());

    // Start from an explicit 'light' baseline (default stored pref is 'system').
    act(() => result.current.setPreference('light'));
    expect(result.current.preference).toBe('light');

    act(() => result.current.cycle());
    expect(result.current.preference).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => result.current.cycle());
    expect(result.current.preference).toBe('system');
    // 'system' removes both explicit classes so the OS query wins.
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('light')).toBe(false);

    act(() => result.current.cycle());
    expect(result.current.preference).toBe('light');
    expect(window.localStorage.getItem('manfred-theme')).toBe('light');
  });
```

- [ ] **Step 2: Run the test, verify it fails**

Run: `npx vitest run --project unit src/components/AppHeader/useThemeToggle.test.ts`
Expected: FAIL — `result.current.cycle` is `undefined` (not a function), or a TS error that `cycle` is not on `UseThemeToggleResult`.

- [ ] **Step 3: Add `cycle` to the result interface**

In `src/components/AppHeader/useThemeToggle.ts`, add to `UseThemeToggleResult` (after the `toggle` field at line 15):

```ts
  /** Toggle between 'light' and 'dark'. A 'system' user becomes the opposite of the resolved theme. */
  toggle: () => void;
  /** Cycle the preference: light → dark → system → light. */
  cycle: () => void;
}
```

- [ ] **Step 4: Implement `cycle` and return it**

In `src/components/AppHeader/useThemeToggle.ts`, add the callback just after the existing `toggle` definition (after line 95), and add `cycle` to the returned object:

```ts
  const toggle = useCallback(() => {
    setPreference(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved, setPreference]);

  const cycle = useCallback(() => {
    const next: ThemePreference =
      preference === 'light' ? 'dark' : preference === 'dark' ? 'system' : 'light';
    setPreference(next);
  }, [preference, setPreference]);

  return { preference, resolved, setPreference, toggle, cycle };
}
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `npx vitest run --project unit src/components/AppHeader/useThemeToggle.test.ts`
Expected: PASS (the new cycle test plus all 7 pre-existing tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/AppHeader/useThemeToggle.ts src/components/AppHeader/useThemeToggle.test.ts
git commit -m "feat(app-header): add cycle() to useThemeToggle (light→dark→system)"
```

---

### Task 3: Button/`onClick` nav + controlled drawer (the blocker)

Let `AppHeaderNavItem` carry an `onClick` and a `type`, thread them through the desktop `NavBar` and the mobile drawer, and make the Sheet **controlled** so SPA nav (no navigation) closes the drawer on activation.

**Files:**
- Modify: `src/components/AppHeader/AppHeader.tsx`
- Test: `src/components/AppHeader/AppHeader.test.tsx`

- [ ] **Step 1: Write the failing tests**

In `src/components/AppHeader/AppHeader.test.tsx`, add `waitFor` to the testing-library import on line 2:

```ts
import { render, screen, waitFor } from '@testing-library/react';
```

Then add this new describe block at the end of the file:

```ts
describe('AppHeader — button/onClick nav (SPA)', () => {
  it('fires onClick when a button navItem is activated (desktop)', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<AppHeader navItems={[{ label: 'Home', as: 'button', onClick, active: true }]} />);
    // Drawer is closed, so only the desktop nav button is in the DOM.
    await user.click(screen.getByRole('button', { name: 'Home' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('closes the drawer after a SPA nav item is clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<AppHeader navItems={[{ label: 'Home', as: 'button', onClick }]} />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // The drawer renders a full-width copy of the nav button.
    const drawerHome = screen
      .getAllByRole('button', { name: 'Home' })
      .find((el) => el.className.includes('w-full'));
    expect(drawerHome).toBeTruthy();

    await user.click(drawerHome!);
    expect(onClick).toHaveBeenCalled();
    // Controlled Sheet closes → dialog removed from the DOM.
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run the tests, verify they fail**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`
Expected: FAIL — the first test fails because `onClick` is never wired to the NavItem; the second fails because the uncontrolled Sheet never closes (dialog stays in the DOM).

- [ ] **Step 3: Extend the `AppHeaderNavItem` interface**

In `src/components/AppHeader/AppHeader.tsx`, add two fields to `AppHeaderNavItem` (after the `as` field, ~line 74):

```ts
  /** Render-prop for router integration (e.g. `as={Link}` for Next/Remix/React-Router). */
  as?: React.ElementType;
  /** Click handler — required for SPA / button-driven nav (use with `as="button"`). */
  onClick?: React.MouseEventHandler;
  /** Button type when `as="button"`. Defaults to `'button'`. */
  type?: 'button' | 'submit' | 'reset';
}
```

- [ ] **Step 4: Thread `onClick`/`type` through the desktop flat nav**

In `src/components/AppHeader/AppHeader.tsx`, replace the `NavItem` in `renderFlatNav` (~lines 133-141):

```tsx
      {items.map((item) => (
        <NavItem
          key={item.label}
          href={item.href}
          active={item.active}
          as={item.as}
          onClick={item.onClick}
          {...(item.as === 'button' ? { type: item.type ?? 'button' } : {})}
        >
          {item.label}
        </NavItem>
      ))}
```

- [ ] **Step 5: Make the Sheet controlled**

In the `AppHeader` component body, add state right after the `useThemeToggle()` call (~line 375):

```tsx
    const { resolved, toggle } = useThemeToggle();
    const [menuOpen, setMenuOpen] = React.useState(false);
```

Then change the drawer's `<Sheet>` open tag (~line 436) from `<Sheet>` to:

```tsx
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
```

- [ ] **Step 6: Thread `onClick`/`type` + close-on-click through the drawer nav**

In `src/components/AppHeader/AppHeader.tsx`, replace the drawer nav `.map` body (~lines 465-482) so each item fires its handler then closes the drawer:

```tsx
                    {navItems.map((item) => {
                      const Comp = (item.as ?? 'a') as React.ElementType;
                      const handleClick: React.MouseEventHandler = (e) => {
                        item.onClick?.(e);
                        setMenuOpen(false);
                      };
                      return (
                        <Comp
                          key={item.label}
                          href={item.href}
                          {...(item.as === 'button' ? { type: item.type ?? 'button' } : {})}
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
```

- [ ] **Step 7: Run the tests, verify they pass**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`
Expected: PASS (new SPA-nav block + all pre-existing AppHeader tests).

- [ ] **Step 8: Commit**

```bash
git add src/components/AppHeader/AppHeader.tsx src/components/AppHeader/AppHeader.test.tsx
git commit -m "feat(app-header): support onClick/button navItems with drawer auto-close"
```

---

### Task 4: 3-state theme cycle on AppHeader

Widen `themeToggle` to `boolean | 'toggle' | 'cycle'`. `true`/`'toggle'` keep today's 2-state button; `'cycle'` renders a new button that shows the current preference icon (sun/moon/monitor) and calls `cycle()`.

**Files:**
- Modify: `src/components/AppHeader/AppHeader.tsx`
- Test: `src/components/AppHeader/AppHeader.test.tsx`

- [ ] **Step 1: Write the failing tests**

In `src/components/AppHeader/AppHeader.test.tsx`, add this describe block at the end:

```ts
describe('AppHeader — theme cycle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  it('themeToggle="cycle" renders a cycle button and advances the preference', async () => {
    const user = userEvent.setup();
    render(<AppHeader themeToggle="cycle" />);
    // Default stored preference is 'system' → monitor icon, label "Theme: system".
    const btn = screen.getByRole('button', { name: /theme: system/i });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    // system → light
    expect(screen.getByRole('button', { name: /theme: light/i })).toBeInTheDocument();
  });

  it('themeToggle={true} still renders the 2-state toggle (back-compat)', () => {
    render(<AppHeader themeToggle />);
    expect(
      screen.getByRole('button', { name: /switch to (light|dark) mode/i }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests, verify they fail**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`
Expected: FAIL — `themeToggle="cycle"` is a TS error (prop is `boolean`), and no "Theme: system" button exists.

- [ ] **Step 3: Import the `ThemePreference` type**

In `src/components/AppHeader/AppHeader.tsx`, change the hook import (line 25):

```tsx
import { useThemeToggle, type ThemePreference } from './useThemeToggle';
```

- [ ] **Step 4: Add the `ThemeCycleButton` component**

In `src/components/AppHeader/AppHeader.tsx`, add this right after the existing `ThemeToggleButton` function (after ~line 245):

```tsx
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
```

- [ ] **Step 5: Widen the `themeToggle` prop type**

In `src/components/AppHeader/AppHeader.tsx`, update the prop's JSDoc + type (~lines 295-300):

```tsx
  /**
   * Render a built-in theme control on the right of the desktop cluster
   * (and in the mobile drawer footer). `true` / `'toggle'` → 2-state
   * light⇄dark button. `'cycle'` → 3-state light→dark→system button
   * (sun/moon/monitor). Uses `useThemeToggle` internally. Default `false`.
   */
  themeToggle?: boolean | 'toggle' | 'cycle';
```

- [ ] **Step 6: Pull `preference` + `cycle` from the hook and render the control**

In the component body, widen the destructure (the line edited in Task 3 Step 5):

```tsx
    const { resolved, toggle, preference, cycle } = useThemeToggle();
    const [menuOpen, setMenuOpen] = React.useState(false);
```

Replace the desktop-cluster theme toggle (~line 433):

```tsx
          {themeToggle ? renderThemeControl(themeToggle, { resolved, toggle, preference, cycle }) : null}
```

Replace the drawer-footer theme toggle (~line 534):

```tsx
                      {themeToggle ? renderThemeControl(themeToggle, { resolved, toggle, preference, cycle }) : null}
```

- [ ] **Step 7: Run the tests, verify they pass**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`
Expected: PASS (theme-cycle block + the pre-existing "theme toggle" block still green for `themeToggle={true}`).

- [ ] **Step 8: Commit**

```bash
git add src/components/AppHeader/AppHeader.tsx src/components/AppHeader/AppHeader.test.tsx
git commit -m "feat(app-header): add 3-state theme cycle (themeToggle='cycle')"
```

---

### Task 5: Clickable profile avatar

Add an optional profile link/button to the typed `user` slot, rendered in both the desktop right cluster and the drawer footer (where it also closes the drawer).

**Files:**
- Modify: `src/components/AppHeader/AppHeader.tsx`
- Test: `src/components/AppHeader/AppHeader.test.tsx`

- [ ] **Step 1: Write the failing tests**

In `src/components/AppHeader/AppHeader.test.tsx`, add this describe block at the end:

```ts
describe('AppHeader — clickable profile avatar', () => {
  it('renders the avatar as a button when onAvatarClick is set, firing on click', async () => {
    const onAvatarClick = vi.fn();
    const user = userEvent.setup();
    render(
      <AppHeader
        user={{ name: 'Jens Wedin', onAvatarClick, avatarLabel: 'Edit your profile', onSignOut: () => {} }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Edit your profile' }));
    expect(onAvatarClick).toHaveBeenCalledOnce();
  });

  it('renders the avatar as a link when avatarHref is set', () => {
    render(
      <AppHeader
        user={{ name: 'Jens Wedin', avatarHref: '/profile', avatarLabel: 'Profile', onSignOut: () => {} }}
      />,
    );
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile');
  });

  it('marks the avatar control aria-current="page" when avatarActive', () => {
    render(
      <AppHeader
        user={{ name: 'Jens', onAvatarClick: () => {}, avatarActive: true, avatarLabel: 'Profile', onSignOut: () => {} }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
  });

  it('keeps the avatar display-only when no avatar action is set', () => {
    render(<AppHeader user={{ name: 'Jens Wedin', onSignOut: () => {} }} />);
    expect(screen.queryByRole('button', { name: 'Jens Wedin' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Jens Wedin' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests, verify they fail**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`
Expected: FAIL — `onAvatarClick`/`avatarHref`/`avatarActive`/`avatarLabel` are TS errors on `AppHeaderUser`, and the avatar renders display-only (no button/link).

- [ ] **Step 3: Extend the `AppHeaderUser` interface**

In `src/components/AppHeader/AppHeader.tsx`, add to `AppHeaderUser` (after `signOutLabel`, ~line 87):

```ts
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
```

- [ ] **Step 4: Add the shared `AvatarControl` component**

In `src/components/AppHeader/AppHeader.tsx`, add this **before** `renderUser` (~line 190). It renders the avatar bare when no action is set, or wrapped in a button/link when interactive. `onNavigate` lets the drawer close itself on click:

```tsx
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

  const avatar = <Avatar alt={label} src={u.avatarUrl} name={initialsSource} size="sm" />;

  const interactive = u.onAvatarClick != null || u.avatarHref != null;
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
```

- [ ] **Step 5: Use `AvatarControl` in the desktop `renderUser`**

In `src/components/AppHeader/AppHeader.tsx`, replace the body of `renderUser` (~lines 190-215). The avatar block becomes `<AvatarControl>`; the email span + sign-out button are unchanged:

```tsx
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
```

- [ ] **Step 6: Use `AvatarControl` in the drawer footer (closes the drawer on click)**

In `src/components/AppHeader/AppHeader.tsx`, in the drawer footer identity block, replace the inline `(user.avatarUrl || user.name) ? <Avatar … /> : null` (~lines 514-521) with:

```tsx
                          <AvatarControl u={user} onNavigate={() => setMenuOpen(false)} />
```

- [ ] **Step 7: Run the tests, verify they pass**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`
Expected: PASS — including the pre-existing "renders the avatar when user.avatarUrl is provided" test (display-only path is preserved).

- [ ] **Step 8: Commit**

```bash
git add src/components/AppHeader/AppHeader.tsx src/components/AppHeader/AppHeader.test.tsx
git commit -m "feat(app-header): clickable profile avatar in user slot + drawer"
```

---

### Task 6: Stories, play functions, and full gates

Add stories that exercise the three new capabilities, then run the play-tier lint, full unit suite, and the runtime a11y scan (light + dark). AppHeader is **Tier B** — each new story needs a `play` function.

**Files:**
- Modify: `src/components/AppHeader/AppHeader.stories.tsx`

- [ ] **Step 1: Add the three stories**

In `src/components/AppHeader/AppHeader.stories.tsx`, add a `SPA_NAV` const after the existing `NAV_WITH_DROPDOWN` (~line 49):

```tsx
const SPA_NAV = [
  { label: 'Home', as: 'button' as const, active: true, onClick: () => {} },
  { label: 'Boards', as: 'button' as const, onClick: () => {} },
  { label: 'Information', as: 'button' as const, onClick: () => {} },
];
```

Then append these three stories at the end of the file:

```tsx
export const SpaNav: Story = {
  name: 'SPA button nav (onClick)',
  args: {
    appName: 'Intranet',
    navItems: SPA_NAV,
    themeToggle: 'cycle',
    user: { name: 'Jens Wedin', onSignOut: () => {} },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The active item carries aria-current even though it is a <button>.
    const active = canvas.getByRole('button', { name: 'Home' });
    expect(active).toHaveAttribute('aria-current', 'page');
  },
};

export const ThemeCycle: Story = {
  name: 'Theme cycle (light/dark/system)',
  args: {
    appName: 'Intranet',
    themeToggle: 'cycle',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: /theme:/i });
    const before = btn.getAttribute('aria-label');
    await userEvent.click(btn);
    const after = canvas.getByRole('button', { name: /theme:/i });
    expect(after.getAttribute('aria-label')).not.toBe(before);
  },
};

export const ProfileAvatar: Story = {
  name: 'Clickable profile avatar',
  args: {
    appName: 'Intranet',
    navItems: NAV,
    user: {
      name: 'Jens Wedin',
      avatarLabel: 'Edit your profile',
      onAvatarClick: () => {},
      onSignOut: () => {},
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button', { name: 'Edit your profile' })).toBeInTheDocument();
  },
};
```

- [ ] **Step 2: Run the play-tier lint**

Run: `npm run lint:play-tiers`
Expected: PASS — AppHeader stays Tier B; every new story has a `play`.

- [ ] **Step 3: Run the full unit suite**

Run: `npm run test`
Expected: PASS — all unit tests across the repo (jsdom `unit` project).

- [ ] **Step 4: Run the storybook play functions**

Run: `npm run test:storybook`
Expected: PASS — every story's `play` (incl. the three new ones) executes in headless Chromium.

- [ ] **Step 5: Run the runtime a11y scan (light + dark)**

```bash
npm run storybook &
# wait until http://localhost:6006 is serving, then:
node scripts/a11y-runtime-scan.mjs
node scripts/a11y-runtime-scan.mjs --dark
```
Expected: no axe violations attributable to the new AppHeader stories (full JSON at `/tmp/a11y-runtime.json`). Kill the background Storybook afterwards.

- [ ] **Step 6: Commit**

```bash
git add src/components/AppHeader/AppHeader.stories.tsx
git commit -m "test(app-header): stories for SPA nav, theme cycle, profile avatar"
```

---

### Task 7: Component docs (MDX)

Document the new capabilities on the AppHeader docs page. No barrel changes are needed — `cycle` lives inside the already-exported `UseThemeToggleResult`, and `monitor`/the new nav+user fields live inside already-exported types (`IconName`, `AppHeaderNavItem`, `AppHeaderUser`).

**Files:**
- Modify: `src/components/AppHeader/AppHeader.mdx`

- [ ] **Step 1: Read the current MDX to find the props/usage section**

Run: open `src/components/AppHeader/AppHeader.mdx` and locate the section that documents `navItems`, `themeToggle`, and `user` (or the closest "props"/"usage" heading).

- [ ] **Step 2: Add a short "SPA & intranet patterns" subsection**

Append this prose under the relevant section (adjust the surrounding heading level to match the file):

```mdx
### SPA / button-driven nav

For client-routed apps, give each `navItems` entry `as: 'button'` + an `onClick`
instead of an `href`. The active item still gets `aria-current="page"`, and in the
mobile drawer the Sheet auto-closes when a button item is activated (an `href`
item closes naturally by navigating away).

```tsx
<AppHeader
  navItems={pages.map((p) => ({
    label: p.label,
    as: 'button',
    active: current === p.id,
    onClick: () => setCurrent(p.id),
  }))}
  themeToggle="cycle"
  user={{ name, avatarLabel: 'Edit your profile', onAvatarClick: goToProfile, onSignOut }}
/>
```

### Theme control

`themeToggle` accepts `true` / `'toggle'` (2-state light⇄dark) or `'cycle'`
(3-state light→dark→system, with sun/moon/monitor icons). Both are backed by the
`useThemeToggle` hook and persist to `localStorage('manfred-theme')`.

### Clickable profile avatar

Pass `user.onAvatarClick` (SPA) or `user.avatarHref` (link) to make the avatar
navigate to a profile page; `user.avatarActive` adds the active ring and
`aria-current="page"`; `user.avatarLabel` sets its accessible name. Omit all of
these for a display-only avatar.
```

- [ ] **Step 3: Verify the MDX renders (typecheck/build of stories)**

Run: `npm run build-storybook`
Expected: PASS — Storybook builds with no MDX/compile errors. (A faster smoke check: `npm run storybook` and open the AppHeader docs page.)

- [ ] **Step 4: Commit**

```bash
git add src/components/AppHeader/AppHeader.mdx
git commit -m "docs(app-header): document SPA nav, theme cycle, clickable avatar"
```

---

### Final review (after Task 7)

Dispatch a final code reviewer over the whole branch diff (`git diff main...HEAD`), checking: the spec's three enhancements are all present; no phantom token classes (prefer named utilities — `ring-primary`, `bg-accent` are real); back-compat preserved (`themeToggle={true}`, display-only avatar, href nav all unchanged); a11y (avatar control has an accessible name; cycle button label is descriptive). Then proceed to Phase 2.

---

## Phase 2 — DS release + intranet adoption (gated on Phase 1 merge)

> **Gate:** Do NOT start Phase 2 until Phase 1 is merged to `main` AND a new DS version is published. The intranet pins a published version; it cannot consume unreleased work. Release actions (tag, push, GitHub Release) require explicit user confirmation per repo convention.

### Task 8: Cut the DS release

**Files:** `package.json`, `CHANGELOG.md`

- [ ] **Step 1:** Decide the version bump — this is additive + back-compatible → **minor** (e.g. `0.28.0` → `0.29.0`).
- [ ] **Step 2:** Add a `CHANGELOG.md` entry under a new `## [0.29.0] - <date>` heading:
  ```
  ### Added
  - **AppHeader**: `navItems` now support `onClick` + `as="button"` for SPA / button-driven nav; the mobile drawer auto-closes on activation.
  - **AppHeader**: `themeToggle="cycle"` — 3-state light→dark→system control (new `monitor` icon).
  - **AppHeader**: clickable profile avatar via `user.onAvatarClick` / `user.avatarHref` (+ `avatarActive`, `avatarLabel`).
  - **useThemeToggle**: `cycle()` advancing light→dark→system.
  - **Icon**: `monitor` glyph.
  ```
- [ ] **Step 3:** Bump `version` in `package.json`.
- [ ] **Step 4:** Split the release commit by concern if needed (feat/docs already committed in Phase 1; this commit is `chore(release)`), then `npm run build` and confirm `postbuild` passes (`verify-use-client-directive.mjs`).
- [ ] **Step 5:** Open PR, merge to `main` (confirm with user), then tag + push + create the GitHub Release to trigger `publish.yml` (confirm with user; use `env -u GITHUB_TOKEN gh release create …`). Follow the `reference_publishing` memory.
- [ ] **Step 6:** File/update a Linear ticket (Studio Manfred → Studio Manfred Design System) tracking this work and link the release.

### Task 9: Apply the adoption in `manfred-intranet`

**Repo:** `/Users/jens.wedin/Sandbox/Code/manfred-intranet` — **Files:** `package.json`, `src/Layout.jsx`

- [ ] **Step 1:** Bump `@studio-manfred/manfred-design-system` to the newly published version and `npm install`.
- [ ] **Step 2:** Import `AppHeader` from the DS barrel in `src/Layout.jsx`.
- [ ] **Step 3:** Replace the entire `<PageHeader>…</PageHeader>` block with the `<AppHeader>` from the spec's "Intranet adoption recipe":

```jsx
<AppHeader
  logo="wordmark"
  // no `appName` — intranet shows the logo only
  navItems={navItems.map((item) => ({
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

- [ ] **Step 4:** Delete the now-dead intranet theme machinery: the `theme` / `systemPrefersDark` state, the two theme `useEffect`s, `effectiveTheme`, `cycleTheme`, `ThemeIcon`, `themeLabel`, the `Tooltip` wrappers on the theme/avatar buttons, and the `Moon, Sun, Laptop` lucide import. AppHeader + `useThemeToggle` own this now.
- [ ] **Step 5:** Delete the manual skip-link `<a href="#page-body">…</a>` — `PageShell` auto-renders one (verified in `PageShell.tsx`); keeping both is a duplicate landmark.
- [ ] **Step 6:** Keep `<PageBody>`/`<Container>` as-is. `AppHeader` is a direct child of `PageShell`, replacing `PageHeader`.
- [ ] **Step 7:** Run the intranet's own tests/build (`Layout.test.tsx` exists), then load the app on a narrow viewport (≤375px) and confirm: no horizontal scroll; logo + hamburger only; drawer opens with full-width nav; nav click navigates + closes the drawer; the cycle button toggles light/dark/system; the avatar opens the profile with an active ring.
- [ ] **Step 8:** Commit in the intranet repo (conventional commit) and push per that repo's flow (confirm with user).

---

## Self-review against the spec

- **Enhancement A (onClick/button nav + drawer close):** Task 3. ✓
- **Enhancement B (3-state cycle):** Task 1 (icon) + Task 2 (hook) + Task 4 (button). ✓
- **Enhancement C (clickable avatar):** Task 5. ✓
- **Testing (hook cycle, nav onClick, drawer close, cycle render, avatar states):** Tasks 2/3/4/5; stories + a11y gates in Task 6. ✓
- **Intranet adoption recipe + sequencing:** Tasks 8-9. ✓
- **Type consistency:** `themeToggle: boolean | 'toggle' | 'cycle'` (Task 4) matches its use in stories/recipe (`'cycle'`); `AppHeaderNavItem.onClick/type` (Task 3) match the recipe's `as:'button', onClick`; `AppHeaderUser.onAvatarClick/avatarHref/avatarActive/avatarLabel` (Task 5) match the recipe; `cycle` added to `UseThemeToggleResult` (Task 2) is what `renderThemeControl` consumes (Task 4); `monitor` added to `IconName` (Task 1) is what `ThemeCycleButton` renders (Task 4). ✓
- **Accepted visual deltas (logo height, avatar variant, tooltip→aria-label):** honored — no `logoHeight`/`avatarVariant`/tooltip props added (YAGNI). ✓
