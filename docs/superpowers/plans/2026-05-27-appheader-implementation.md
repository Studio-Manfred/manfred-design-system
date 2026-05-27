# AppHeader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Dispatch one fresh subagent per task; review between tasks; parallel-dispatch where called out.

**Goal:** Ship a new opinionated, configurable `AppHeader` component that composes existing DS pieces (`NavBar`, `NavigationMenu`, `Logo`, `Avatar`, `Button`, `Sheet`, `SearchBar`, `Icon`, `Typography`) into one configured header, plus a co-shipped `useThemeToggle` hook. Covers the six per-app header archetypes captured in the spec without per-app boilerplate; leaves the existing `PageHeader` slot untouched as an escape hatch.

**Architecture:** Single `<header>` landmark rendered with `cva` tone variants (`default | brand | dark`) + `sticky` toggle. Left cluster (logo + appName), nav slot (picks `NavBar` vs `NavigationMenu` from a structured `navItems` prop, with a `nav` ReactNode escape hatch), right cluster (search + actions + user + theme toggle). Below the `mobileBreakpoint`, nav + search + actions + user + theme toggle collapse into a right-side `<Sheet>` triggered by a hamburger button. The `useThemeToggle` hook reads/writes `localStorage('manfred-theme')` and toggles `<html class>` between `light` / `dark` / `system`. Tier B in `scripts/play-tiers.json` because the component has user interaction (theme toggle, hamburger, user menu).

**Tech Stack:** React 18+, TypeScript 5, Vite, Vitest (unit) + Vitest browser via `@vitest/browser-playwright` (Storybook play tests), `@storybook/react-vite`, Tailwind v4, `class-variance-authority`, Radix UI primitives (via existing DS components).

**Spec:** [`docs/superpowers/specs/2026-05-27-appheader-design.md`](../specs/2026-05-27-appheader-design.md)

**Linear:** [STU-495](https://linear.app/studio-manfred/issue/STU-495) (epic, High)

**Branch:** `jens-wedin/appheader-component` (already created; spec committed in `f4b86d4`)

---

## File structure

### Create

| Path | Responsibility |
|---|---|
| `src/components/AppHeader/AppHeader.tsx` | Root component + cva tone variants + layout. Internally renders left cluster, nav slot, right cluster, mobile drawer trigger. Owns the responsive collapse. |
| `src/components/AppHeader/useThemeToggle.ts` | Hook for the theme preference state. SSR-safe; persists to `localStorage('manfred-theme')`; applies the `light` / `dark` / system class on `<html>`. |
| `src/components/AppHeader/AppHeader.test.tsx` | Unit tests — prop wiring, slot precedence, navItems picker, user block, theme toggle aria-swap. |
| `src/components/AppHeader/useThemeToggle.test.ts` | Hook tests — initial state, localStorage round-trip, SSR-safe defaults, class application. |
| `src/components/AppHeader/AppHeader.stories.tsx` | Stories for the six archetypes + tier-B play assertions. |
| `src/components/AppHeader/AppHeader.mdx` | Component docs page (props table + live `<Canvas of=…>` for each archetype). |
| `src/components/AppHeader/index.ts` | Module-level exports (component, hook, types). |

### Modify

| Path | Change |
|---|---|
| `src/components/Icon/Icon.tsx` | Extend `IconName` enum with `sun`, `moon`, `menu`, `log-out` plus their SVG paths in the icon map. |
| `src/components/Icon/Icon.test.tsx` | Add the four new names to the existing `it.each` rendering test. |
| `src/index.ts` | Re-export `AppHeader`, `useThemeToggle`, types (`AppHeaderProps`, `AppHeaderNavItem`, `AppHeaderUser`, `AppHeaderTone`, `AppHeaderBreakpoint`, `AppHeaderLogo`, `ThemePreference`). |
| `scripts/play-tiers.json` | Add `AppHeader` to tier `B`. |
| `README.md` | Insert `AppHeader` into the Components list alphabetically; add a one-paragraph note in the Theming subsection pointing at `useThemeToggle`. |
| `CHANGELOG.md` | New entry under `[Unreleased]` → Added. |

---

## Subagent dispatch strategy

Per the user's preference: each task below is a fresh subagent dispatch using `superpowers:subagent-driven-development`. The parent (you) reviews between tasks and decides next moves. Most tasks are sequential, but two phases support parallel dispatch:

- **Parallel pair 1** — after **Task 1 (Icon extension)** lands: dispatch **Task 2 (useThemeToggle)** and **Task 3 (AppHeader shell)** in parallel. Tasks operate on disjoint files; both must land green before Task 4.
- **Parallel pair 2** — after **Task 8 (mobile drawer)** lands: dispatch **Task 9 (stories)** and **Task 10 (barrel + tier-B + MDX)** in parallel. Tasks operate on disjoint files.

Sequential phases:
- Task 1 alone (Icon prep).
- Tasks 4 → 5 → 6 → 7 → 8 sequential (each adds to `AppHeader.tsx`; mid-state must be green at each commit).
- Task 11 (README + CHANGELOG) after Task 10.
- Task 12 (final verification) after Task 11.

Memory pattern this matches: `procedure_pilot_then_parallel_batches.md` — pilot one specimen, get sign-off, fan out. Tasks 2 / 3 / 9 / 10 are the fan-out pairs.

---

## Task 1: Extend `Icon` with `sun` / `moon` / `menu` / `log-out`

**Files:**
- Modify: `src/components/Icon/Icon.tsx`
- Modify: `src/components/Icon/Icon.test.tsx`

**Why this is first:** `AppHeader` needs all four icons (theme toggle = sun/moon, mobile hamburger = menu, sign-out button = log-out). The Icon component currently exposes a closed enum and has no slot for arbitrary icons — extending the enum is the lowest-blast-radius fix. Subsequent AppHeader work can rely on the names existing.

- [ ] **Step 1: Read the current Icon component to confirm structure**

Run: `Read src/components/Icon/Icon.tsx`

Confirm: the file exports `IconName` (union type) and renders an SVG via a `paths` lookup keyed by name. Note the existing pattern for how each icon's SVG path is declared.

- [ ] **Step 2: Add the four new names to `IconName`**

Edit `src/components/Icon/Icon.tsx` and extend the union:

```ts
export type IconName =
  | 'check'
  | 'x'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'search'
  | 'info'
  | 'warning'
  | 'alert-circle'
  | 'check-circle'
  | 'x-circle'
  | 'eye'
  | 'eye-off'
  | 'plus'
  | 'minus'
  | 'arrow-left'
  | 'arrow-right'
  | 'bell'
  | 'external-link'
  | 'loader'
  | 'calendar'
  | 'sun'
  | 'moon'
  | 'menu'
  | 'log-out';
```

- [ ] **Step 3: Add the SVG path entries for the four new icons**

Find the icon-paths map in `src/components/Icon/Icon.tsx` (the object literal keyed by `IconName`). Add these four entries (using Lucide-icon-compatible 24×24 paths so the visual language matches the existing icons):

```tsx
'sun': (
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </>
),
'moon': (
  <>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </>
),
'menu': (
  <>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </>
),
'log-out': (
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </>
),
```

*If the existing icon-paths map uses a different style (e.g. inline `path` strings rather than JSX fragments), match the existing style. Read the file's existing entries before adapting.*

- [ ] **Step 4: Extend the existing rendering test to cover the new names**

Open `src/components/Icon/Icon.test.tsx`. Find the parameterised test that renders each icon name (likely an `it.each(...)` over the union). Add the four names to the list:

```ts
it.each([
  // …existing names…
  'sun',
  'moon',
  'menu',
  'log-out',
] as const)('renders %s without throwing', (name) => {
  const { container } = render(<Icon name={name} aria-label={name} />);
  expect(container.querySelector('svg')).toBeTruthy();
});
```

If the existing test doesn't have a parameterised case, add one as shown. The shape (presence of an SVG in the DOM) is enough — visual correctness is the runtime axe + Chromatic scan's job.

- [ ] **Step 5: Run the Icon tests; expect green**

Run: `npx vitest run --project unit src/components/Icon/Icon.test.tsx`

Expected output: `Tests N+4 passed` where `N` is the prior count.

- [ ] **Step 6: Commit**

```bash
git add src/components/Icon/Icon.tsx src/components/Icon/Icon.test.tsx
git commit -m "feat(icon): add sun, moon, menu, log-out icons

Extends the Icon name enum with the four icons AppHeader needs:
- sun / moon for the theme toggle
- menu for the mobile hamburger trigger
- log-out for the user-menu sign-out button

Uses Lucide-style 24×24 paths so the visual language matches existing
icons. Test coverage via the existing it.each rendering check.

Refs STU-495.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: `useThemeToggle` hook + tests

**Files:**
- Create: `src/components/AppHeader/useThemeToggle.ts`
- Create: `src/components/AppHeader/useThemeToggle.test.ts`

**Dispatch:** Can run in parallel with Task 3 (disjoint files; barrel exports come later in Task 10).

- [ ] **Step 1: Create the component directory and the hook file**

Run: `mkdir -p src/components/AppHeader`

Create `src/components/AppHeader/useThemeToggle.ts`:

```ts
import { useEffect, useState, useCallback } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'manfred-theme';

export interface UseThemeToggleResult {
  /** The user's stored preference. */
  preference: ThemePreference;
  /** The currently rendered theme (resolves 'system' against the OS query). */
  resolved: 'light' | 'dark';
  /** Set the preference and persist it. */
  setPreference: (next: ThemePreference) => void;
  /** Toggle between 'light' and 'dark'. A 'system' user becomes the opposite of the resolved theme. */
  toggle: () => void;
}

/**
 * Read OS preference for SSR-friendly initial state.
 * Returns 'light' when `window`/`matchMedia` is unavailable.
 */
function readOsPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Read the stored preference from localStorage, returning 'system' if unset.
 * Returns 'system' when `window`/`localStorage` is unavailable.
 */
function readStoredPreference(): ThemePreference {
  if (typeof window === 'undefined' || !window.localStorage) return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

/**
 * Apply the preference to `<html>` per the existing DS convention:
 * - 'light' → `<html class="light">`
 * - 'dark'  → `<html class="dark">`
 * - 'system' → remove both classes so the OS query wins.
 */
function applyToDocument(pref: ThemePreference): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (pref === 'light') root.classList.add('light');
  else if (pref === 'dark') root.classList.add('dark');
}

/**
 * Theme preference hook. Reads `localStorage('manfred-theme')`, applies the
 * class on `<html>`, and resolves 'system' to the current OS preference.
 *
 * SSR-safe: returns 'system' until the first effect runs post-mount.
 */
export function useThemeToggle(): UseThemeToggleResult {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [osPref, setOsPref] = useState<'light' | 'dark'>('light');

  // Read stored preference + OS preference post-mount (SSR-safe).
  useEffect(() => {
    setPreferenceState(readStoredPreference());
    setOsPref(readOsPreference());

    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setOsPref(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Re-apply class whenever the preference changes.
  useEffect(() => {
    applyToDocument(preference);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    setPreferenceState(next);
  }, []);

  const resolved: 'light' | 'dark' = preference === 'system' ? osPref : preference;

  const toggle = useCallback(() => {
    setPreference(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved, setPreference]);

  return { preference, resolved, setPreference, toggle };
}
```

- [ ] **Step 2: Create the hook tests**

Create `src/components/AppHeader/useThemeToggle.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThemeToggle } from './useThemeToggle';

const STORAGE_KEY = 'manfred-theme';

describe('useThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with preference="system" when nothing is stored', () => {
    const { result } = renderHook(() => useThemeToggle());
    expect(result.current.preference).toBe('system');
  });

  it('resolves "system" to the OS preference', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q === '(prefers-color-scheme: dark)' ? true : false,
      media: q,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as MediaQueryList);

    const { result } = renderHook(() => useThemeToggle());
    expect(result.current.resolved).toBe('dark');
  });

  it('reads stored preference on mount', () => {
    window.localStorage.setItem(STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useThemeToggle());
    expect(result.current.preference).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('persists setPreference to localStorage and applies the class', () => {
    const { result } = renderHook(() => useThemeToggle());

    act(() => result.current.setPreference('light'));

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('setPreference("system") removes both classes', () => {
    document.documentElement.classList.add('dark');
    const { result } = renderHook(() => useThemeToggle());

    act(() => result.current.setPreference('system'));

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('toggle flips between light and dark based on resolved theme', () => {
    const { result } = renderHook(() => useThemeToggle());

    act(() => result.current.setPreference('light'));
    expect(result.current.resolved).toBe('light');

    act(() => result.current.toggle());
    expect(result.current.preference).toBe('dark');
    expect(result.current.resolved).toBe('dark');

    act(() => result.current.toggle());
    expect(result.current.preference).toBe('light');
    expect(result.current.resolved).toBe('light');
  });
});
```

- [ ] **Step 3: Run the hook tests; expect green**

Run: `npx vitest run --project unit src/components/AppHeader/useThemeToggle.test.ts`

Expected output: `Tests 6 passed`.

- [ ] **Step 4: Commit**

```bash
git add src/components/AppHeader/useThemeToggle.ts src/components/AppHeader/useThemeToggle.test.ts
git commit -m "feat(appheader): useThemeToggle hook

Reads localStorage('manfred-theme'), applies the light/dark class on
<html> per the DS convention, and resolves 'system' to the OS
prefers-color-scheme query. SSR-safe (returns 'system' until the
first effect runs post-mount). Listens for OS query changes so the
resolved value stays accurate when the user is on 'system'.

Will back AppHeader's built-in theme-toggle button; also exported
standalone for consumers wanting a custom theme-switch surface.

Refs STU-495.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: `AppHeader` shell — cva tone variants, sticky toggle, empty `<header>`

**Files:**
- Create: `src/components/AppHeader/AppHeader.tsx`
- Create: `src/components/AppHeader/AppHeader.test.tsx`

**Dispatch:** Can run in parallel with Task 2.

- [ ] **Step 1: Write the failing landmark test**

Create `src/components/AppHeader/AppHeader.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppHeader } from './AppHeader';

describe('AppHeader (shell)', () => {
  it('renders a single <header> landmark with default aria-label', () => {
    render(<AppHeader />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header.tagName).toBe('HEADER');
    expect(header).toHaveAttribute('aria-label', 'Primary');
  });

  it('renders with sticky classes by default', () => {
    render(<AppHeader />);
    const header = screen.getByRole('banner');
    expect(header.className).toContain('sticky');
    expect(header.className).toContain('top-0');
  });

  it('drops sticky classes when sticky=false', () => {
    render(<AppHeader sticky={false} />);
    const header = screen.getByRole('banner');
    expect(header.className).not.toContain('sticky');
  });

  it.each(['default', 'brand', 'dark'] as const)('applies tone="%s"', (tone) => {
    render(<AppHeader tone={tone} />);
    const header = screen.getByRole('banner');
    if (tone === 'default') expect(header.className).toContain('bg-background');
    if (tone === 'brand') expect(header.className).toContain('bg-bg-brand');
    if (tone === 'dark') expect(header.className).toContain('bg-bg-inverse');
  });

  it('accepts a custom ariaLabel', () => {
    render(<AppHeader ariaLabel="Admin" />);
    expect(screen.getByRole('banner', { name: 'Admin' })).toBeInTheDocument();
  });

  it('forwards ref to the <header> element', () => {
    const ref = { current: null as HTMLElement | null };
    render(<AppHeader ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('HEADER');
  });
});
```

- [ ] **Step 2: Run the tests; expect failures (component doesn't exist yet)**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`

Expected: import failure — `AppHeader` not defined.

- [ ] **Step 3: Write the AppHeader shell**

Create `src/components/AppHeader/AppHeader.tsx`:

```tsx
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
 * Props for the {@link AppHeader} component. See the design spec for full
 * details: `docs/superpowers/specs/2026-05-27-appheader-design.md`.
 *
 * The full prop surface lands across multiple commits as slots are added;
 * this shell defines only the layout-level props.
 */
export interface AppHeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'aria-label'> {
  tone?: AppHeaderTone;
  sticky?: boolean;
  ariaLabel?: string;
}

/**
 * Opinionated, configurable application header. Renders a `<header>`
 * landmark with token-driven tone variants and a sticky-by-default
 * positioning behaviour. Composes existing DS pieces (NavBar /
 * NavigationMenu / Avatar / Button / Sheet / SearchBar / Logo / Icon)
 * to cover the six per-app archetypes captured in the spec.
 *
 * Don't nest inside `<PageHeader>` — `AppHeader` IS the header
 * landmark. Use `PageHeader` (the unopinionated slot in `PageShell`)
 * for marketing site / custom one-off pages instead.
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
```

- [ ] **Step 4: Run the tests; expect green**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`

Expected output: `Tests 8 passed` (6 tests, two of which are `it.each` over 3 tones → 8 leaves).

- [ ] **Step 5: Commit**

```bash
git add src/components/AppHeader/AppHeader.tsx src/components/AppHeader/AppHeader.test.tsx
git commit -m "feat(appheader): scaffold shell with tone + sticky variants

Renders a single <header> landmark with cva-driven tone variants
('default' / 'brand' / 'dark') and a sticky-by-default top-0 z-50.
Token-driven surfaces: bg-background / bg-bg-brand / bg-bg-inverse
with matching foreground tokens.

Brand-tone bottom border is a one-off color-mix translucent white;
flagged for STU-498 promotion to --color-border-on-brand once a
second brand-tone surface needs the value.

Subsequent commits add the left cluster (logo + appName), nav slot,
right cluster (search + actions + user), built-in theme toggle, and
mobile drawer.

Refs STU-495.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Left cluster — `logo` + `appName`

**Files:**
- Modify: `src/components/AppHeader/AppHeader.tsx`
- Modify: `src/components/AppHeader/AppHeader.test.tsx`

- [ ] **Step 1: Add the failing tests for the left cluster**

Append to `src/components/AppHeader/AppHeader.test.tsx`:

```tsx
describe('AppHeader — left cluster', () => {
  it('renders the wordmark logo by default, wrapped in a link to "/"', () => {
    render(<AppHeader />);
    const link = screen.getByRole('link', { name: 'Manfred home' });
    expect(link).toHaveAttribute('href', '/');
    // The Logo renders an inline img-role span as its child.
    expect(link.querySelector('[role="img"]')).toBeTruthy();
  });

  it('honours a custom logoHref', () => {
    render(<AppHeader logoHref="/dashboard" />);
    expect(screen.getByRole('link', { name: 'Manfred home' })).toHaveAttribute('href', '/dashboard');
  });

  it('renders the monogram when logo="monogram"', () => {
    render(<AppHeader logo="monogram" />);
    // Monogram Logo carries aria-label "M" by default.
    expect(screen.getByRole('img', { name: 'M' })).toBeInTheDocument();
  });

  it('renders a custom ReactNode logo when provided', () => {
    render(<AppHeader logo={<span data-testid="custom-logo">CL</span>} />);
    expect(screen.getByTestId('custom-logo')).toBeInTheDocument();
  });

  it('renders no logo (and no logo link) when logo={null}', () => {
    render(<AppHeader logo={null} />);
    expect(screen.queryByRole('link', { name: /home/i })).not.toBeInTheDocument();
  });

  it('renders appName next to the logo when provided', () => {
    render(<AppHeader appName="Intranet" />);
    expect(screen.getByText('Intranet')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests; expect failures**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`

Expected: 6 new failing tests (the existing 8 still pass).

- [ ] **Step 3: Implement the left cluster**

Update `src/components/AppHeader/AppHeader.tsx`:

```tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Logo, type LogoColor } from '@/components/Logo';

export type AppHeaderLogo = 'wordmark' | 'monogram' | React.ReactNode;
export type AppHeaderTone = NonNullable<VariantProps<typeof appHeaderVariants>['tone']>;

// (appHeaderVariants block stays as before — unchanged.)
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

/**
 * Pick the right `Logo` color per tone — Logo colours are brand-literal
 * (not theme-reactive) so AppHeader chooses per surface.
 */
function logoColorForTone(tone: AppHeaderTone): LogoColor {
  return tone === 'default' ? 'black' : 'white';
}

export interface AppHeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'aria-label'> {
  logo?: AppHeaderLogo | null;
  logoHref?: string;
  appName?: string;
  tone?: AppHeaderTone;
  sticky?: boolean;
  ariaLabel?: string;
}

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
    const renderLogo = () => {
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
      // Custom ReactNode.
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
```

- [ ] **Step 4: Run the tests; expect green**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`

Expected: all 14 leaves pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/AppHeader/AppHeader.tsx src/components/AppHeader/AppHeader.test.tsx
git commit -m "feat(appheader): logo + appName left cluster

Adds the leftmost cluster: a Logo (wordmark default, monogram or
custom ReactNode by prop) wrapped in an <a> linking to logoHref ('/'
by default), plus an optional appName sub-label rendered alongside.

Logo color is picked per tone (black on default / white on brand and
dark) since the Logo component is brand-literal and not
theme-reactive. Custom ReactNode logos render bare (no auto-link;
consumer composes their own anchor if needed). Setting logo={null}
suppresses the entire left-cluster anchor.

Refs STU-495.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Nav slot — `navItems` picker + `nav` escape hatch

**Files:**
- Modify: `src/components/AppHeader/AppHeader.tsx`
- Modify: `src/components/AppHeader/AppHeader.test.tsx`

- [ ] **Step 1: Add the failing nav-slot tests**

Append to `src/components/AppHeader/AppHeader.test.tsx`:

```tsx
describe('AppHeader — nav slot', () => {
  it('renders a flat NavBar when navItems is provided without sub-items', () => {
    render(
      <AppHeader
        navItems={[
          { label: 'Home', href: '/' },
          { label: 'Boards', href: '/boards', active: true },
        ]}
      />,
    );
    // NavBar renders nav[aria-label="Primary"] — but AppHeader's own header
    // already carries aria-label="Primary"; the inner NavBar gets a fallback
    // label of "Primary nav" to disambiguate.
    expect(screen.getByRole('navigation', { name: 'Primary nav' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    const active = screen.getByRole('link', { name: 'Boards' });
    expect(active).toHaveAttribute('aria-current', 'page');
  });

  it('renders a NavigationMenu when any navItem has nested items', () => {
    render(
      <AppHeader
        navItems={[
          {
            label: 'Products',
            items: [
              { label: 'Alpha', href: '/p/alpha' },
              { label: 'Beta', href: '/p/beta' },
            ],
          },
          { label: 'About', href: '/about' },
        ]}
      />,
    );
    // NavigationMenu renders a button (dropdown trigger) for "Products".
    expect(screen.getByRole('button', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
  });

  it('uses the nav slot when provided, ignoring navItems', () => {
    render(
      <AppHeader
        navItems={[{ label: 'Ignored', href: '/x' }]}
        nav={<nav aria-label="Custom"><a href="/custom">Custom</a></nav>}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Custom' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ignored' })).not.toBeInTheDocument();
  });

  it('renders nothing when neither nav nor navItems is provided', () => {
    render(<AppHeader />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests; expect failures**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`

Expected: 4 new failing tests.

- [ ] **Step 3: Add the nav slot to `AppHeader.tsx`**

Add the new types + nav rendering to `AppHeader.tsx`. Insert the type definitions near the other exported types, and the rendering between the left cluster and `{children}` in the JSX.

Type additions (place after the existing `AppHeaderLogo` / `AppHeaderTone` lines):

```tsx
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

export interface AppHeaderNavItem {
  label: string;
  href?: string;
  active?: boolean;
  items?: AppHeaderNavItem[];
  as?: React.ElementType;
}
```

Add to `AppHeaderProps` interface (insert after `appName`):

```tsx
  navItems?: AppHeaderNavItem[];
  nav?: React.ReactNode;
```

Add a renderer helper after `logoColorForTone`:

```tsx
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
```

Inside the component body, derive the nav node:

```tsx
const navNode: React.ReactNode | null = nav
  ? nav
  : navItems && navItems.length > 0
  ? hasDropdowns(navItems)
    ? renderDropdownNav(navItems)
    : renderFlatNav(navItems)
  : null;
```

In the returned JSX, render the nav node between the left cluster's closing `</div>` and `{children}`:

```tsx
return (
  <header /* ... */>
    <div className="flex items-center gap-6 min-w-0 flex-1">
      {/* existing left cluster: logo + appName, wrapped in its own flex container */}
      <div className="flex items-center gap-3 min-w-0">
        {/* …logo + appName as before… */}
      </div>
      {navNode ? <div className="hidden md:flex">{navNode}</div> : null}
    </div>
    {children}
  </header>
);
```

(The `hidden md:flex` Tailwind utility hides the desktop nav at viewport widths below the default `md` breakpoint — mobile collapse to the drawer lands in Task 8.)

Make sure to destructure `navItems` and `nav` in the component params alongside the existing ones.

- [ ] **Step 4: Run the tests; expect green**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`

Expected: all leaves pass (existing 14 + 4 new = 18).

- [ ] **Step 5: Commit**

```bash
git add src/components/AppHeader/AppHeader.tsx src/components/AppHeader/AppHeader.test.tsx
git commit -m "feat(appheader): nav slot with navItems picker + ReactNode escape hatch

Adds the top-level nav slot:
- 'navItems' prop accepts a structured list of items. AppHeader picks
  NavBar when every item is flat, or NavigationMenu when any item has
  nested 'items'. NavBar gets aria-label='Primary nav' so it doesn't
  clash with the <header>'s own 'Primary' landmark label.
- 'nav' ReactNode escape hatch wins over navItems when both are
  provided — useful for router-aware composed navs.

Active state propagates: NavBar via 'active' prop (auto aria-current),
NavigationMenu via 'data-active' on links. Both already match the DS
contract.

Nav is hidden below the 'md' breakpoint via 'hidden md:flex' on the
wrapper; the mobile drawer lands in a later commit.

Refs STU-495.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Right cluster — `search` + `actions` + typed `user`

**Files:**
- Modify: `src/components/AppHeader/AppHeader.tsx`
- Modify: `src/components/AppHeader/AppHeader.test.tsx`

- [ ] **Step 1: Add the failing right-cluster tests**

Append to `src/components/AppHeader/AppHeader.test.tsx`:

```tsx
describe('AppHeader — right cluster', () => {
  it('renders the search slot when provided', () => {
    render(<AppHeader search={<div data-testid="search">SEARCH</div>} />);
    expect(screen.getByTestId('search')).toBeInTheDocument();
  });

  it('renders the actions slot when provided', () => {
    render(<AppHeader actions={<button data-testid="cta">Contact</button>} />);
    expect(screen.getByTestId('cta')).toBeInTheDocument();
  });

  it('renders the typed user block: email + sign-out button', () => {
    const onSignOut = vi.fn();
    render(
      <AppHeader user={{ email: 'jens@studiomanfred.com', onSignOut }} />,
    );
    expect(screen.getByText('jens@studiomanfred.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('fires user.onSignOut when the sign-out button is clicked', async () => {
    const onSignOut = vi.fn();
    const user = userEvent.setup();
    render(
      <AppHeader user={{ email: 'jens@studiomanfred.com', onSignOut }} />,
    );
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('renders the avatar when user.avatarUrl is provided', () => {
    render(
      <AppHeader user={{ name: 'Jens Wedin', avatarUrl: '/me.jpg', onSignOut: () => {} }} />,
    );
    // Avatar renders role="img" with aria-label=alt.
    expect(screen.getByRole('img', { name: 'Jens Wedin' })).toBeInTheDocument();
  });

  it('honours a custom signOutLabel', () => {
    render(
      <AppHeader user={{ email: 'jens@studiomanfred.com', onSignOut: () => {}, signOutLabel: 'Log out' }} />,
    );
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });
});
```

(Add `import userEvent from '@testing-library/user-event';` and `import { vi } from 'vitest';` at the top of the test file if not already there.)

- [ ] **Step 2: Run the tests; expect failures**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`

Expected: 6 new failing tests.

- [ ] **Step 3: Implement the right cluster**

Update `src/components/AppHeader/AppHeader.tsx`:

Imports:

```tsx
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
```

Type addition (after `AppHeaderNavItem`):

```tsx
export interface AppHeaderUser {
  name?: string;
  email?: string;
  avatarUrl?: string;
  onSignOut?: () => void;
  signOutLabel?: string;
}
```

Add to `AppHeaderProps`:

```tsx
  search?: React.ReactNode;
  actions?: React.ReactNode;
  user?: AppHeaderUser;
```

Destructure them in the component body. Then add a renderer for the user block, before the `return`:

```tsx
const renderUser = (u: AppHeaderUser): React.ReactNode => {
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
        <Button
          variant="outline"
          size="sm"
          onClick={u.onSignOut}
        >
          {u.signOutLabel ?? 'Sign out'}
        </Button>
      ) : null}
    </div>
  );
};
```

In the JSX, add the right cluster as a sibling of the left cluster (replacing `{children}` since the slots replace freeform children for the configured case — but keep `{children}` available as a fallthrough below the slots for cases the spec doesn't cover):

```tsx
return (
  <header /* ... */>
    <div className="flex items-center gap-6 min-w-0 flex-1">
      {/* …left cluster + nav (unchanged)… */}
    </div>
    <div className="flex items-center gap-3 hidden md:flex">
      {search ? <div>{search}</div> : null}
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      {user ? renderUser(user) : null}
    </div>
    {children}
  </header>
);
```

- [ ] **Step 4: Run the tests; expect green**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`

Expected: 24 leaves pass (18 prior + 6 new).

- [ ] **Step 5: Commit**

```bash
git add src/components/AppHeader/AppHeader.tsx src/components/AppHeader/AppHeader.test.tsx
git commit -m "feat(appheader): right cluster (search + actions + user)

Adds the right-aligned cluster:
- 'search' slot: arbitrary ReactNode (typically <SearchBar size='sm' />).
- 'actions' slot: arbitrary ReactNode for CTAs / custom menus.
- 'user' typed prop: renders Avatar (initials fall back from name or
  email-local-part) + email (when no name) + Sign-out Button. Custom
  signOutLabel overridable. Setting onSignOut hooks the click handler.

Cluster hidden below the 'md' breakpoint via 'hidden md:flex' — the
mobile drawer (next commit) houses these on small viewports.

Refs STU-495.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Built-in theme toggle button

**Files:**
- Modify: `src/components/AppHeader/AppHeader.tsx`
- Modify: `src/components/AppHeader/AppHeader.test.tsx`

**Depends on Task 2 (`useThemeToggle` hook).**

- [ ] **Step 1: Add the failing theme-toggle tests**

Append to `src/components/AppHeader/AppHeader.test.tsx`:

```tsx
describe('AppHeader — theme toggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  it('does not render the theme toggle by default', () => {
    render(<AppHeader />);
    expect(screen.queryByRole('button', { name: /switch to (light|dark) mode/i })).not.toBeInTheDocument();
  });

  it('renders a theme toggle button when themeToggle={true}', () => {
    render(<AppHeader themeToggle />);
    // Initial resolved is light (system → light in jsdom), so the toggle
    // offers to switch to dark.
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('flips aria-label after clicking the theme toggle', async () => {
    const user = userEvent.setup();
    render(<AppHeader themeToggle />);
    const btn = screen.getByRole('button', { name: /switch to dark mode/i });
    await user.click(btn);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests; expect failures**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`

Expected: 3 new failing tests.

- [ ] **Step 3: Implement the built-in toggle**

Update `src/components/AppHeader/AppHeader.tsx`:

Import the hook:

```tsx
import { useThemeToggle } from './useThemeToggle';
```

Add to `AppHeaderProps`:

```tsx
  themeToggle?: boolean;
```

Destructure `themeToggle = false` in the component params, then add an internal sub-component for the button (place at the top of the file, after the helper functions):

```tsx
function ThemeToggleButton(): React.ReactElement {
  const { resolved, toggle } = useThemeToggle();
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
```

In the JSX, append the toggle to the right cluster (inside the `hidden md:flex` wrapper):

```tsx
<div className="flex items-center gap-3 hidden md:flex">
  {search ? <div>{search}</div> : null}
  {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
  {user ? renderUser(user) : null}
  {themeToggle ? <ThemeToggleButton /> : null}
</div>
```

- [ ] **Step 4: Run the tests; expect green**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`

Expected: 27 leaves pass (24 prior + 3 new).

- [ ] **Step 5: Commit**

```bash
git add src/components/AppHeader/AppHeader.tsx src/components/AppHeader/AppHeader.test.tsx
git commit -m "feat(appheader): built-in theme toggle button

Adds the 'themeToggle' boolean prop. When true, renders an Icon
button (sun ↔ moon) on the right edge of the desktop cluster.
Backed by useThemeToggle: persists to localStorage('manfred-theme'),
flips the <html> class, aria-label swaps in lockstep with the
resolved theme ('Switch to light mode' / 'Switch to dark mode'),
and aria-pressed reflects the current resolved theme.

Hidden below the 'md' breakpoint along with the rest of the right
cluster — mobile drawer (next commit) houses the toggle on small
viewports.

Refs STU-495.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Mobile drawer via `Sheet`

**Files:**
- Modify: `src/components/AppHeader/AppHeader.tsx`
- Modify: `src/components/AppHeader/AppHeader.test.tsx`

- [ ] **Step 1: Add the failing mobile-drawer tests**

Append to `src/components/AppHeader/AppHeader.test.tsx`:

```tsx
describe('AppHeader — mobile drawer', () => {
  it('renders a hamburger trigger labelled "Open menu"', () => {
    render(<AppHeader navItems={[{ label: 'Home', href: '/' }]} />);
    // The trigger is hidden visually at desktop sizes (md:hidden) but the
    // DOM element exists for testing-library to find.
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it('opens the drawer with nav items when the hamburger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AppHeader
        navItems={[
          { label: 'Home', href: '/' },
          { label: 'Boards', href: '/boards', active: true },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    // Sheet renders content in a portal; testing-library scans the whole
    // document by default.
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    // Both nav items appear inside the drawer.
    expect(screen.getAllByRole('link', { name: 'Home' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: 'Boards' }).length).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run the tests; expect failures**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`

Expected: 2 new failing tests.

- [ ] **Step 3: Implement the mobile drawer**

Update `src/components/AppHeader/AppHeader.tsx`:

Imports:

```tsx
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/Sheet';
```

Add to `AppHeaderProps`:

```tsx
  mobileBreakpoint?: 'sm' | 'md' | 'lg';
```

Destructure `mobileBreakpoint = 'md'` in the component params. Build a breakpoint-to-class map (Tailwind needs literal class strings — no string concatenation):

```tsx
const BREAKPOINT_HIDDEN: Record<NonNullable<AppHeaderProps['mobileBreakpoint']>, string> = {
  sm: 'hidden sm:flex',
  md: 'hidden md:flex',
  lg: 'hidden lg:flex',
};

const BREAKPOINT_VISIBLE_BELOW: Record<NonNullable<AppHeaderProps['mobileBreakpoint']>, string> = {
  sm: 'sm:hidden',
  md: 'md:hidden',
  lg: 'lg:hidden',
};
```

Replace the existing `hidden md:flex` literals on the desktop nav wrapper and the right-cluster wrapper with `BREAKPOINT_HIDDEN[mobileBreakpoint]`.

Add the mobile drawer JSX as a sibling of the desktop clusters:

```tsx
return (
  <header /* ... */>
    {/* …existing left cluster + nav + desktop right cluster… */}
    <div className={BREAKPOINT_VISIBLE_BELOW[mobileBreakpoint]}>
      <Sheet>
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
        <SheetContent side="right" className="w-72 sm:w-80">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-4">
            {search ? <div>{search}</div> : null}
            {navNode ? (
              // Force the flat vertical layout in the drawer regardless of
              // whether desktop used NavBar or NavigationMenu — vertical
              // stacks always use a flat NavBar.
              navItems && navItems.length > 0 ? renderFlatNav(navItems) : navNode
            ) : null}
            {actions ? <div className="flex flex-col gap-2">{actions}</div> : null}
            {user ? renderUser(user) : null}
            {themeToggle ? <ThemeToggleButton /> : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
    {children}
  </header>
);
```

Note: `renderFlatNav` is reused inside the drawer for the vertical stack. That means inside the drawer, even dropdown-nav items collapse to their top-level labels — dropdown content lives on desktop only. (If the spec needs nested drawer behaviour, that's a follow-up.)

- [ ] **Step 4: Run the tests; expect green**

Run: `npx vitest run --project unit src/components/AppHeader/AppHeader.test.tsx`

Expected: 29 leaves pass (27 prior + 2 new).

- [ ] **Step 5: Commit**

```bash
git add src/components/AppHeader/AppHeader.tsx src/components/AppHeader/AppHeader.test.tsx
git commit -m "feat(appheader): mobile drawer via Sheet

Below the mobileBreakpoint (default 'md'), the desktop nav + right
cluster hide and a hamburger button takes their place. Clicking the
hamburger opens a right-aligned Sheet with search + nav + actions +
user + theme-toggle stacked vertically.

Breakpoint scoped to literal Tailwind class strings via a lookup
table — Tailwind v4 can't see through string concatenation, so
breakpoint switching is done at the class-name level, not at runtime.

Drawer always uses the flat NavBar (vertical list) regardless of
whether desktop renders NavigationMenu dropdowns — nested drawer
behaviour is intentionally out of scope for v1.

Sheet handles focus trap, focus return to trigger on close, and Esc
to dismiss; aria-expanded reflects state.

Refs STU-495.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Stories — six archetypes + tier-B play assertions

**Files:**
- Create: `src/components/AppHeader/AppHeader.stories.tsx`

**Dispatch:** Can run in parallel with Task 10 (disjoint files).

- [ ] **Step 1: Create the stories file**

Create `src/components/AppHeader/AppHeader.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import { AppHeader } from './AppHeader';
import { SearchBar } from '../SearchBar';
import { Button } from '../Button';
import { Kbd } from '../Kbd';

const meta: Meta<typeof AppHeader> = {
  title: 'Components/AppHeader',
  component: AppHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Opinionated, configurable application header. Renders a single ' +
          '<header> landmark with logo + appName, structured navItems (or ' +
          'a nav-slot escape hatch), search slot, actions slot, typed user ' +
          'block, and a built-in theme toggle. Below mobileBreakpoint, ' +
          'nav + search + actions + user + theme toggle collapse into a ' +
          'right-side Sheet drawer.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof AppHeader>;

const NAV = [
  { label: 'Home', href: '#home' },
  { label: 'Boards', href: '#boards', active: true },
  { label: 'Information', href: '#info' },
  { label: 'Blog', href: '#blog' },
  { label: 'Dashboard', href: '#dashboard' },
];

const NAV_WITH_DROPDOWN = [
  {
    label: 'Products',
    items: [
      { label: 'Alpha', href: '#p/alpha' },
      { label: 'Beta', href: '#p/beta' },
    ],
  },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
];

export const Default: Story = {
  name: 'Default (sandbox)',
  args: {
    appName: 'Intranet',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('banner', { name: 'Primary' })).toBeInTheDocument();
  },
};

export const WithFlatNav: Story = {
  name: 'With flat nav (intranet)',
  args: {
    appName: 'Intranet',
    navItems: NAV,
    search: <SearchBar size="sm" placeholder="Search..." trailing={<Kbd>⌘K</Kbd>} />,
    themeToggle: true,
    user: { name: 'Jens Wedin', avatarUrl: undefined, onSignOut: () => {} },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const active = canvas.getByRole('link', { name: 'Boards' });
    expect(active).toHaveAttribute('aria-current', 'page');
  },
};

export const WithDropdownNav: Story = {
  name: 'With dropdown nav',
  args: {
    navItems: NAV_WITH_DROPDOWN,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button', { name: 'Products' })).toBeInTheDocument();
  },
};

export const WithNavSlot: Story = {
  name: 'With custom nav slot',
  args: {
    nav: (
      <nav aria-label="Custom router nav">
        <a href="#custom" style={{ marginRight: 12 }}>Custom 1</a>
        <a href="#custom2">Custom 2</a>
      </nav>
    ),
  },
};

export const BrandTone: Story = {
  name: 'Brand tone (landing)',
  args: {
    tone: 'brand',
    actions: <Button variant="inverse">Get in touch</Button>,
  },
};

export const DarkTone: Story = {
  name: 'Dark tone (always-dark)',
  args: {
    tone: 'dark',
    navItems: NAV,
    themeToggle: false,
  },
};

export const WithThemeToggle: Story = {
  name: 'With theme toggle',
  args: {
    appName: 'Dashboard',
    themeToggle: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: /switch to (light|dark) mode/i });
    expect(btn).toBeInTheDocument();
    const initialLabel = btn.getAttribute('aria-label');
    await userEvent.click(btn);
    const after = canvas.getByRole('button', { name: /switch to (light|dark) mode/i });
    expect(after.getAttribute('aria-label')).not.toBe(initialLabel);
  },
};

export const WithUserMenu: Story = {
  name: 'With typed user (email + sign-out)',
  args: {
    navItems: [
      { label: 'Dashboard', href: '#d' },
      { label: 'Admin', href: '#admin', active: true },
    ],
    themeToggle: true,
    user: { email: 'jens@studiomanfred.com', onSignOut: () => {} },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
    expect(canvas.getByText('jens@studiomanfred.com')).toBeInTheDocument();
  },
};

export const PlainTextTitle: Story = {
  name: 'Plain-text app title (no logo)',
  args: {
    logo: null,
    appName: 'Manfred Analytics',
    user: { onSignOut: () => {} },
  },
};

export const MobileDrawer: Story = {
  name: 'Mobile drawer (small viewport)',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    appName: 'Intranet',
    navItems: NAV,
    themeToggle: true,
    user: { name: 'Jens', onSignOut: () => {} },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open menu' });
    await userEvent.click(trigger);
    // Sheet renders in a portal — search the whole document.
    const dialog = await within(document.body).findByRole('dialog');
    expect(dialog).toBeInTheDocument();
  },
};
```

- [ ] **Step 2: Run the storybook play tests**

Run: `npm run test:storybook`

Expected: total story count increases by 10 (one per archetype) and all pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/AppHeader/AppHeader.stories.tsx
git commit -m "docs(appheader): Storybook gallery for six archetypes + drawer

Adds 10 stories: Default, WithFlatNav, WithDropdownNav, WithNavSlot,
BrandTone, DarkTone, WithThemeToggle, WithUserMenu, PlainTextTitle,
MobileDrawer. Each is one of the archetypes from the spec; play
functions assert the core a11y contract for each shape (landmark,
aria-current, theme-toggle aria swap, drawer open).

MobileDrawer uses viewport='mobile1' to exercise the small-viewport
collapse path.

Refs STU-495.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Barrel exports + tier-B + MDX docs

**Files:**
- Create: `src/components/AppHeader/index.ts`
- Create: `src/components/AppHeader/AppHeader.mdx`
- Modify: `src/index.ts`
- Modify: `scripts/play-tiers.json`

**Dispatch:** Can run in parallel with Task 9 (disjoint files).

- [ ] **Step 1: Create the module index**

Create `src/components/AppHeader/index.ts`:

```ts
export { AppHeader } from './AppHeader';
export type {
  AppHeaderProps,
  AppHeaderNavItem,
  AppHeaderUser,
  AppHeaderTone,
  AppHeaderLogo,
} from './AppHeader';
export { useThemeToggle } from './useThemeToggle';
export type { ThemePreference, UseThemeToggleResult } from './useThemeToggle';
```

- [ ] **Step 2: Add the top-level barrel exports**

Open `src/index.ts`. Find the existing `NavBar` export block (around line 87). Insert AFTER it, in alphabetical order:

```ts
export { AppHeader, useThemeToggle } from './components/AppHeader';
export type {
  AppHeaderProps,
  AppHeaderNavItem,
  AppHeaderUser,
  AppHeaderTone,
  AppHeaderLogo,
  ThemePreference,
  UseThemeToggleResult,
} from './components/AppHeader';
```

(Insert under an `AppHeader` heading if the file uses heading comments per-component; match the existing convention by reading the surrounding lines.)

- [ ] **Step 3: Add `AppHeader` to the tier-B list**

Open `scripts/play-tiers.json` and add `"AppHeader"` to the `tiers.B` array, alphabetically. The file is JSON — preserve the existing field order and indentation.

- [ ] **Step 4: Create the MDX docs page**

Create `src/components/AppHeader/AppHeader.mdx`:

```mdx
import { Meta, Canvas, Controls } from '@storybook/addon-docs/blocks';
import * as AppHeaderStories from './AppHeader.stories';

<Meta of={AppHeaderStories} />

# AppHeader

Opinionated, configurable application header. Renders a single `<header>` landmark with logo, app name, top navigation, search, actions, typed user block, and a built-in theme toggle. Composes existing DS pieces (`NavBar`, `NavigationMenu`, `Logo`, `Avatar`, `Button`, `Sheet`, `SearchBar`, `Icon`) into one configured shape — covers the six per-app archetypes captured in the spec without per-app boilerplate.

`AppHeader` IS the `<header>` landmark. Use it inside `PageShell` directly — don't nest inside the unopinionated `PageHeader` slot.

```tsx
<PageShell>
  <AppHeader appName="Intranet" navItems={…} user={…} themeToggle />
  <PageBody>…</PageBody>
</PageShell>
```

## Archetypes

### Intranet — logo + nav + search + theme toggle + user

<Canvas of={AppHeaderStories.WithFlatNav} />

### Dropdown nav — for apps with section sub-menus

<Canvas of={AppHeaderStories.WithDropdownNav} />

### Custom nav slot — escape hatch for router-aware nav

<Canvas of={AppHeaderStories.WithNavSlot} />

### Brand tone — landing-page header on brand-blue

<Canvas of={AppHeaderStories.BrandTone} />

### Dark tone — always-dark surface

<Canvas of={AppHeaderStories.DarkTone} />

### With typed user — email + sign-out shorthand

<Canvas of={AppHeaderStories.WithUserMenu} />

### Plain-text title — no logo, app name only

<Canvas of={AppHeaderStories.PlainTextTitle} />

### Mobile drawer — below the breakpoint

<Canvas of={AppHeaderStories.MobileDrawer} />

## Props

<Controls of={AppHeaderStories.Default} />

## `useThemeToggle`

`AppHeader` exports its theme-preference hook so consumers can render a custom theme switcher elsewhere on the page. Reads `localStorage('manfred-theme')` and flips `<html>` between `light` / `dark` / system.

```tsx
import { useThemeToggle } from '@studio-manfred/manfred-design-system';

function MyToggle() {
  const { resolved, toggle } = useThemeToggle();
  return <button onClick={toggle}>{resolved === 'dark' ? '☀️' : '🌙'}</button>;
}
```

## SSR / theme flash

For SSR consumers (Next.js App Router with the `"use client"` banner shipped in v0.23.0), add an inline script that sets the class before React hydrates:

```html
<script>
  (function() {
    var stored = localStorage.getItem('manfred-theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.classList.add(stored);
    }
  })();
</script>
```

Place it in `<head>`. Avoids the light-to-dark flicker on the first paint.
```

- [ ] **Step 5: Run all gates to verify the new exports + tier compile**

Run all three in sequence:

```bash
npm run lint:play-tiers
npm run test
npm run build
```

Expected:
- `lint:play-tiers` — `✓ 38 components pass` (37 + AppHeader).
- `test` — all unit tests pass.
- `build` — clean, verifier confirms `"use client";` banner.

- [ ] **Step 6: Commit**

```bash
git add src/components/AppHeader/index.ts src/components/AppHeader/AppHeader.mdx src/index.ts scripts/play-tiers.json
git commit -m "feat(appheader): wire barrel exports, tier-B, MDX docs

- src/components/AppHeader/index.ts exports the component, hook, and
  all public types.
- Top-level barrel (src/index.ts) re-exports AppHeader,
  useThemeToggle, and the types alongside the other components.
- AppHeader added to scripts/play-tiers.json under tier B
  (interactive: theme toggle, hamburger, user-menu sign-out).
- AppHeader.mdx docs page documents the eight archetypes with live
  <Canvas> previews, the useThemeToggle hook, and an SSR script
  snippet to avoid theme flash.

Refs STU-495.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: README + CHANGELOG

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Insert `AppHeader` into the README Components list**

Open `README.md`. Find the `### Components` section. The list currently reads (alphabetical):

```
Accordion · Alert · Avatar · Badge · Breadcrumb · Button · Card ·
Chart (...) · Checkbox · DatePicker · Dialog · FormField · ...
```

Insert `AppHeader` alphabetically (between `Alert` and `Avatar`):

```
Accordion · Alert · AppHeader · Avatar · Badge · Breadcrumb · Button · Card ·
Chart (...) · Checkbox · DatePicker · Dialog · FormField · ...
```

- [ ] **Step 2: Add a `useThemeToggle` note to the Theming subsection**

Open `README.md`, find the `### Theming` section. Append a paragraph at the end:

```markdown
For consumers who want a custom theme switcher outside of `AppHeader`,
the DS exports a `useThemeToggle` hook from the same module:

```tsx
import { useThemeToggle } from '@studio-manfred/manfred-design-system';

function MyToggle() {
  const { resolved, toggle } = useThemeToggle();
  return <button onClick={toggle}>{resolved === 'dark' ? '☀️' : '🌙'}</button>;
}
```

It persists the preference to `localStorage('manfred-theme')` and applies
the class on `<html>`. SSR-safe.
```

- [ ] **Step 3: Add the CHANGELOG entry**

Open `CHANGELOG.md`. Find the `## [Unreleased]` heading. Add:

```markdown
## [Unreleased]

### Added

- **`AppHeader` component** — opinionated, configurable application
  header that composes existing DS pieces (NavBar, NavigationMenu,
  Logo, Avatar, Button, Sheet, SearchBar, Icon) into one configured
  shape. Six archetypes covered with no per-app boilerplate. Closes
  [STU-495](https://linear.app/studio-manfred/issue/STU-495).
- **`useThemeToggle` hook** — co-shipped with `AppHeader`. Reads
  `localStorage('manfred-theme')`, applies the light/dark class on
  `<html>`, resolves 'system' against the OS preference query.
  SSR-safe. Available for consumers building custom theme switchers.
- **Four icons** added to `Icon`: `sun`, `moon`, `menu`, `log-out` —
  required by `AppHeader`'s theme toggle, mobile hamburger, and
  sign-out button respectively.

### Notes

- `AppHeader` is the new opinionated header; the existing `PageHeader`
  slot inside `PageShell` is unchanged and remains the escape hatch
  for marketing-site / custom-layout pages. No breaking change.
```

- [ ] **Step 4: Commit**

```bash
git add README.md CHANGELOG.md
git commit -m "docs(appheader): README + CHANGELOG entries for the new component

- README Components list gains AppHeader alphabetically.
- README Theming subsection grows a useThemeToggle code snippet for
  consumers building custom switchers.
- CHANGELOG [Unreleased] Added entry covers AppHeader, useThemeToggle,
  and the four new Icon names. Notes the no-breaking-change status of
  the existing PageHeader slot.

Refs STU-495.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Final verification

**No file changes.** This task runs the full gate set on the branch and confirms readiness for PR.

- [ ] **Step 1: Run the full unit suite**

Run: `npm run test`

Expected: All unit tests pass. Count increases by ~35 (existing + AppHeader + useThemeToggle + Icon additions).

- [ ] **Step 2: Run the Storybook play tests**

Run: `npm run test:storybook`

Expected: All play tests pass. Story count increases by 10 (AppHeader archetypes).

- [ ] **Step 3: Run the play-tier lint**

Run: `npm run lint:play-tiers`

Expected: `✓ 38 components pass lint:play-tiers.`

- [ ] **Step 4: Build the library**

Run: `npm run build`

Expected: Clean build; postbuild verifier confirms `"use client";` banner on both dist entries.

- [ ] **Step 5: Run the runtime a11y scan in both themes**

Storybook must be running for this step. In one terminal: `npm run storybook -- --no-open`. In another, once Storybook is up:

```bash
node scripts/a11y-runtime-scan.mjs
node scripts/a11y-runtime-scan.mjs --dark
```

Expected: Zero NEW violations on any `components-appheader--*` story. Pre-existing violations (NavigationMenu, Landing examples, Typography live region) unchanged.

- [ ] **Step 6: Confirm git status is clean**

Run: `git status`

Expected: `nothing to commit, working tree clean` on branch `jens-wedin/appheader-component`.

- [ ] **Step 7: Surface readiness**

The branch is now ready for push + PR. Surface this back to the user with a one-paragraph summary of what landed (component, hook, four icons, MDX, tier-B), the gate results, and a wait for explicit authorization before pushing — per the standing memory rule on shared-state actions.

---

## Self-review

This plan was self-reviewed for:

**Spec coverage:** Walked the spec section-by-section.
- Composition contract → Tasks 3–8 + JSDoc warning in Task 3 commit message + MDX page in Task 10.
- Props API → Tasks 3–8 (each prop family).
- Default layout → Tasks 3, 5, 6, 7 (clusters), Task 8 (mobile collapse).
- Tone variants → Task 3 (cva).
- Theme toggle + useThemeToggle → Tasks 2, 7.
- A11y → Tests in Tasks 3–8, runtime scan in Task 12.
- Stories → Task 9.
- Docs → Tasks 10, 11.
- Acceptance criteria → Task 12 verification.

**Placeholder scan:** No "TBD" / "TODO" / "implement later" / "add validation" / "fill in details" strings. Every step has the code or the command.

**Type consistency:** `AppHeaderProps`, `AppHeaderNavItem`, `AppHeaderUser`, `AppHeaderTone`, `AppHeaderLogo`, `ThemePreference`, `UseThemeToggleResult` — names match across the type definitions, the index re-export, and the barrel re-export. Method names: `setPreference`, `toggle`, `resolved`, `preference` consistent across the hook and the test.

**Scope check:** One component + one hook + four Icon additions. SubNavBar, SideNav, `--color-border-on-brand` token deferred to STU-496 / 497 / 498. Plan is focused.

Issues found inline and fixed during writing.
