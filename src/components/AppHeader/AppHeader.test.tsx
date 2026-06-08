import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('AppHeader — left cluster', () => {
  it('renders the wordmark logo by default, wrapped in a link to "/"', () => {
    render(<AppHeader />);
    const link = screen.getByRole('link', { name: 'Manfred home' });
    expect(link).toHaveAttribute('href', '/');
    expect(link.querySelector('[role="img"]')).toBeTruthy();
  });

  it('honours a custom logoHref', () => {
    render(<AppHeader logoHref="/dashboard" />);
    expect(screen.getByRole('link', { name: 'Manfred home' })).toHaveAttribute('href', '/dashboard');
  });

  it('renders the monogram when logo="monogram"', () => {
    render(<AppHeader logo="monogram" />);
    // Logo's monogram variant defaults aria-label to 'M' unless overridden;
    // AppHeader overrides to 'Manfred home' for both variants for link consistency.
    expect(screen.getByRole('link', { name: 'Manfred home' })).toBeInTheDocument();
  });

  it('renders a custom ReactNode logo when provided', () => {
    render(<AppHeader logo={<span data-testid="custom-logo">CL</span>} />);
    expect(screen.getByTestId('custom-logo')).toBeInTheDocument();
    // Custom logos render bare — no auto-link.
    expect(screen.queryByRole('link', { name: /home/i })).not.toBeInTheDocument();
  });

  it('renders no logo (and no logo link) when logo={null}', () => {
    render(<AppHeader logo={null} />);
    expect(screen.queryByRole('link', { name: /home/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders appName next to the logo when provided', () => {
    render(<AppHeader appName="Intranet" />);
    expect(screen.getByText('Intranet')).toBeInTheDocument();
  });
});

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
    // Inner NavBar carries aria-label="Primary nav" to disambiguate from
    // AppHeader's own <header aria-label="Primary"> landmark.
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
    // Avatar renders role="img" with aria-label = alt; AppHeader passes `name` as alt.
    expect(screen.getByRole('img', { name: 'Jens Wedin' })).toBeInTheDocument();
  });

  it('honours a custom signOutLabel', () => {
    render(
      <AppHeader user={{ email: 'jens@studiomanfred.com', onSignOut: () => {}, signOutLabel: 'Log out' }} />,
    );
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });
});

describe('AppHeader — logo color per tone + theme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  it('default tone: logo renders blue in light mode', () => {
    const { container } = render(<AppHeader />);
    const path = container.querySelector('a[href="/"] svg path');
    expect(path?.getAttribute('fill')).toBe('var(--color-brand-logo-blue)');
  });

  it('default tone: logo flips to white when dark theme is stored', async () => {
    window.localStorage.setItem('manfred-theme', 'dark');
    const { container } = render(<AppHeader />);
    // useThemeToggle reads localStorage in useEffect; after render the
    // resolved theme is 'dark' and the logo re-renders with color='white'.
    const path = container.querySelector('a[href="/"] svg path');
    expect(path?.getAttribute('fill')).toBe('var(--color-brand-logo-paper)');
  });

  it('brand tone: logo stays white in light mode', () => {
    const { container } = render(<AppHeader tone="brand" />);
    const path = container.querySelector('a[href="/"] svg path');
    expect(path?.getAttribute('fill')).toBe('var(--color-brand-logo-paper)');
  });

  it('dark tone: logo stays white', () => {
    const { container } = render(<AppHeader tone="dark" />);
    const path = container.querySelector('a[href="/"] svg path');
    expect(path?.getAttribute('fill')).toBe('var(--color-brand-logo-paper)');
  });
});

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
    // Initial resolved is light (jsdom matchMedia stub returns matches=false),
    // so the toggle offers to switch to dark.
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

describe('AppHeader — mobile drawer', () => {
  it('renders a hamburger trigger labelled "Open menu"', () => {
    render(<AppHeader navItems={[{ label: 'Home', href: '/' }]} />);
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it('opens the drawer with full-width nav items + full-width sign-out + footer row', async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();
    render(
      <AppHeader
        navItems={[
          { label: 'Home', href: '/' },
          { label: 'Boards', href: '/boards', active: true },
        ]}
        themeToggle
        user={{ name: 'Jens', email: 'jens@studiomanfred.com', onSignOut }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Nav items are full-width block anchors inside the drawer's nav.
    const homeLinks = screen.getAllByRole('link', { name: 'Home' });
    const drawerHome = homeLinks.find((el) => el.className.includes('w-full'));
    expect(drawerHome).toBeTruthy();

    // Active item has aria-current.
    const boardsLinks = screen.getAllByRole('link', { name: 'Boards' });
    const drawerBoards = boardsLinks.find((el) => el.className.includes('w-full'));
    expect(drawerBoards).toHaveAttribute('aria-current', 'page');

    // Sign-out button is full-width.
    const signOutBtns = screen.getAllByRole('button', { name: 'Sign out' });
    const drawerSignOut = signOutBtns.find((el) => el.className.includes('w-full'));
    expect(drawerSignOut).toBeInTheDocument();

    // Footer row contains both user identity AND a theme toggle.
    expect(screen.getByText('Jens')).toBeInTheDocument();
    expect(screen.getByText('jens@studiomanfred.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to (light|dark) mode/i })).toBeInTheDocument();
  });
});

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
