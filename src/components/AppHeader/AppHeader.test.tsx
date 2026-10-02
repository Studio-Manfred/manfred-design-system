import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppHeader } from './AppHeader';
import type { ComponentProps } from 'react';

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

  it('prefers onAvatarClick over avatarHref and warns about the ignored href', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onAvatarClick = vi.fn();
    const user = userEvent.setup();
    render(
      <AppHeader
        user={{ name: 'Jens', onAvatarClick, avatarHref: '/profile', avatarLabel: 'Profile' }}
      />,
    );
    expect(screen.queryByRole('link', { name: 'Profile' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Profile' }));
    expect(onAvatarClick).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('`user.avatarHref` ignored'));
    warn.mockRestore();
  });

  it('clicking the avatar inside the mobile drawer fires onAvatarClick and closes the drawer', async () => {
    const onAvatarClick = vi.fn();
    const user = userEvent.setup();
    render(<AppHeader user={{ name: 'Jens', onAvatarClick, avatarLabel: 'Profile' }} />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Profile' }));

    expect(onAvatarClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('AppHeader — user block fallbacks', () => {
  it('labels an email-only avatar with the email and falls back to its local-part initial', () => {
    render(<AppHeader user={{ email: 'jens@studiomanfred.com', avatarUrl: '/me.jpg' }} />);
    const avatar = screen.getByRole('img', { name: 'jens@studiomanfred.com' });
    // Image fails to load → initials fallback derived from the email local part.
    fireEvent.error(avatar.querySelector('img')!);
    expect(avatar).toHaveTextContent('J');
    // Email shown as text when there is no name.
    expect(screen.getByText('jens@studiomanfred.com')).toBeInTheDocument();
  });

  it('labels an avatar with "Account" when only an avatarUrl is given', () => {
    render(<AppHeader user={{ avatarUrl: '/me.jpg' }} />);
    expect(screen.getByRole('img', { name: 'Account' })).toBeInTheDocument();
  });

  it('renders no avatar when there is neither a name nor an avatarUrl', () => {
    render(<AppHeader user={{ email: 'jens@studiomanfred.com' }} />);
    expect(screen.queryByRole('img', { name: /jens|account/i })).not.toBeInTheDocument();
    expect(screen.getByText('jens@studiomanfred.com')).toBeInTheDocument();
  });

  it('renders no sign-out button when onSignOut is omitted', () => {
    render(<AppHeader user={{ name: 'Jens' }} />);
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
  });
});

describe('AppHeader — dropdown nav active state', () => {
  it('marks the active top-level link and the active sub-item with data-active + aria-current="page" (STU-876)', async () => {
    const user = userEvent.setup();
    render(
      <AppHeader
        navItems={[
          {
            label: 'Products',
            items: [
              { label: 'Alpha', href: '/p/alpha', active: true },
              { label: 'Beta', href: '/p/beta' },
            ],
          },
          { label: 'About', href: '/about', active: true },
          { label: 'Contact', href: '/contact' },
        ]}
      />,
    );
    const about = screen.getByRole('link', { name: 'About' });
    expect(about).toHaveAttribute('data-active');
    expect(about).toHaveAttribute('aria-current', 'page');
    const contact = screen.getByRole('link', { name: 'Contact' });
    expect(contact).not.toHaveAttribute('data-active');
    expect(contact).not.toHaveAttribute('aria-current');

    await user.click(screen.getByRole('button', { name: 'Products' }));
    const alpha = await screen.findByRole('link', { name: 'Alpha' });
    expect(alpha).toHaveAttribute('data-active');
    expect(alpha).toHaveAttribute('aria-current', 'page');
    const beta = screen.getByRole('link', { name: 'Beta' });
    expect(beta).not.toHaveAttribute('data-active');
    expect(beta).not.toHaveAttribute('aria-current');
  });
});

describe('AppHeader — theme cycle labels', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  it('announces each preference as it cycles light → dark → system', async () => {
    window.localStorage.setItem('manfred-theme', 'light');
    const user = userEvent.setup();
    render(<AppHeader themeToggle="cycle" />);

    await user.click(await screen.findByRole('button', { name: /theme: light/i }));
    expect(screen.getByRole('button', { name: /theme: dark/i })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');

    await user.click(screen.getByRole('button', { name: /theme: dark/i }));
    expect(screen.getByRole('button', { name: /theme: system/i })).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass('dark');
    expect(document.documentElement).not.toHaveClass('light');
  });
});

describe('AppHeader — user menu (STU-1001)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  const baseUser = {
    name: 'Jens Wedin',
    email: 'jens@studiomanfred.com',
    signOutLabel: 'Log out',
  };

  function setup(
    userOverrides: Partial<NonNullable<ComponentProps<typeof AppHeader>['user']>> = {},
    props: Partial<ComponentProps<typeof AppHeader>> = {},
  ) {
    const onSignOut = vi.fn();
    const onProfile = vi.fn();
    const onSettings = vi.fn();
    const ue = userEvent.setup();
    render(
      <AppHeader
        user={{
          ...baseUser,
          onSignOut,
          menuItems: [
            { label: 'Profile', onSelect: onProfile, icon: 'settings' },
            { label: 'Settings', onSelect: onSettings },
          ],
          ...userOverrides,
        }}
        {...props}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Account menu for Jens Wedin' });
    return { ue, trigger, onSignOut, onProfile, onSettings };
  }

  it('keeps today\'s behaviour when no menuItems are given (back-compat)', () => {
    render(<AppHeader user={{ ...baseUser, onSignOut: () => {} }} />);
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    expect(document.querySelector('[aria-haspopup="menu"]')).toBeNull();
  });

  it('turns the avatar into a menu button and drops the sign-out button from the bar', () => {
    const { trigger } = setup();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens on click: labelled menu with name/email header, items, separator and sign-out; first item focused', async () => {
    const { ue, trigger } = setup();
    await ue.click(trigger);
    const menu = await screen.findByRole('menu', { name: 'Account menu for Jens Wedin' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const items = within(menu).getAllByRole('menuitem');
    expect(items.map((i) => i.textContent)).toEqual(['Profile', 'Settings', 'Log out']);
    expect(within(menu).getByRole('separator')).toBeInTheDocument();
    expect(screen.getByText('jens@studiomanfred.com')).toBeInTheDocument();
    // The header text lives outside role="menu" (only menuitems/separators inside).
    expect(menu).not.toHaveTextContent('jens@studiomanfred.com');
    await waitFor(() => expect(items[0]).toHaveFocus());
    // Roving focus: items are not in the tab order.
    items.forEach((i) => expect(i).toHaveAttribute('tabindex', '-1'));
  });

  it('selecting an item fires onSelect, closes the menu and returns focus to the trigger', async () => {
    const { ue, trigger, onProfile } = setup();
    await ue.click(trigger);
    await ue.click(await screen.findByRole('menuitem', { name: 'Profile' }));
    expect(onProfile).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('the sign-out menuitem fires onSignOut', async () => {
    const { ue, trigger, onSignOut } = setup();
    await ue.click(trigger);
    await ue.click(await screen.findByRole('menuitem', { name: 'Log out' }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('ArrowDown on the trigger opens and focuses the first item; arrows/Home/End move with wrap', async () => {
    const { ue, trigger } = setup();
    trigger.focus();
    await ue.keyboard('{ArrowDown}');
    const items = await screen.findAllByRole('menuitem');
    await waitFor(() => expect(items[0]).toHaveFocus());
    await ue.keyboard('{ArrowDown}');
    expect(items[1]).toHaveFocus();
    await ue.keyboard('{End}');
    expect(items[2]).toHaveFocus();
    await ue.keyboard('{ArrowDown}');
    expect(items[0]).toHaveFocus(); // wraps
    await ue.keyboard('{ArrowUp}');
    expect(items[2]).toHaveFocus(); // wraps back
    await ue.keyboard('{Home}');
    expect(items[0]).toHaveFocus();
  });

  it('ArrowUp on the trigger opens and focuses the last item', async () => {
    const { ue, trigger } = setup();
    trigger.focus();
    await ue.keyboard('{ArrowUp}');
    const items = await screen.findAllByRole('menuitem');
    await waitFor(() => expect(items[items.length - 1]).toHaveFocus());
  });

  it.each([['{Enter}'], [' ']])('%s on the trigger opens the menu with the first item focused', async (key) => {
    const { ue, trigger } = setup();
    trigger.focus();
    await ue.keyboard(key);
    const items = await screen.findAllByRole('menuitem');
    await waitFor(() => expect(items[0]).toHaveFocus());
  });

  it('Escape closes the menu and returns focus to the trigger', async () => {
    const { ue, trigger } = setup();
    await ue.click(trigger);
    await screen.findByRole('menu');
    await ue.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('Tab closes the menu (focus back on the trigger)', async () => {
    const { ue, trigger } = setup();
    await ue.click(trigger);
    await screen.findByRole('menu');
    await ue.keyboard('{Tab}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('renders href items as link menuitems and marks the active item aria-current="page"', async () => {
    const { ue, trigger } = setup({
      menuItems: [{ label: 'Profile', href: '/profile', active: true }],
    });
    await ue.click(trigger);
    const item = await screen.findByRole('menuitem', { name: 'Profile' });
    expect(item.tagName).toBe('A');
    expect(item).toHaveAttribute('href', '/profile');
    expect(item).toHaveAttribute('aria-current', 'page');
  });

  it('Space activates a link menuitem', async () => {
    const onSelect = vi.fn();
    const { ue, trigger } = setup({
      menuItems: [{ label: 'Profile', href: '#profile', onSelect }],
    });
    await ue.click(trigger);
    const item = await screen.findByRole('menuitem', { name: 'Profile' });
    await waitFor(() => expect(item).toHaveFocus());
    await ue.keyboard(' ');
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('avatarActive rings the trigger without putting aria-current on a menu button', () => {
    const { trigger } = setup({ avatarActive: true });
    expect(trigger.className).toContain('ring-primary');
    expect(trigger).not.toHaveAttribute('aria-current');
  });

  it('menuLabel overrides the trigger name; email-only users get an email-based default', () => {
    const { unmount } = render(
      <AppHeader user={{ name: 'Jens', menuLabel: 'Your account', menuItems: [] }} />,
    );
    expect(screen.getByRole('button', { name: 'Your account' })).toHaveAttribute('aria-haspopup', 'menu');
    unmount();
    render(<AppHeader user={{ email: 'jens@studiomanfred.com', menuItems: [] }} />);
    expect(
      screen.getByRole('button', { name: 'Account menu for jens@studiomanfred.com' }),
    ).toBeInTheDocument();
    // The email is in the menu header, not repeated in the bar.
    expect(screen.queryByText('jens@studiomanfred.com')).not.toBeInTheDocument();
  });

  it('themeInMenu moves the theme control into the menu; activating it cycles and keeps the menu open', async () => {
    const { ue, trigger } = setup({ themeInMenu: true }, { themeToggle: 'cycle' });
    expect(screen.queryByRole('button', { name: /theme:/i })).not.toBeInTheDocument();
    await ue.click(trigger);
    const themeItem = await screen.findByRole('menuitem', { name: 'Theme: System' });
    await ue.click(themeItem);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Theme: Light' })).toBeInTheDocument();
    expect(window.localStorage.getItem('manfred-theme')).toBe('light');
  });

  it('themeInMenu with the 2-state toggle offers "Switch to dark mode"', async () => {
    const { ue, trigger } = setup({ themeInMenu: true }, { themeToggle: true });
    await ue.click(trigger);
    await ue.click(await screen.findByRole('menuitem', { name: 'Switch to dark mode' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('without themeInMenu the theme control stays in the bar', () => {
    setup({}, { themeToggle: 'cycle' });
    expect(screen.getByRole('button', { name: /theme:/i })).toBeInTheDocument();
  });

  it('mobile drawer lists the menu items as plain buttons (no nested menu) and closes on select', async () => {
    const { ue, onProfile } = setup();
    await ue.click(screen.getByRole('button', { name: 'Open menu' }));
    const drawer = await screen.findByRole('dialog');
    expect(within(drawer).queryByRole('menu')).not.toBeInTheDocument();
    const group = within(drawer).getByRole('group', { name: 'Account' });
    expect(within(group).getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    expect(within(drawer).getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    await ue.click(within(group).getByRole('button', { name: 'Profile' }));
    expect(onProfile).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('mobile drawer renders href items as links with aria-current', async () => {
    const ue = userEvent.setup();
    render(
      <AppHeader
        user={{ name: 'Jens', menuItems: [{ label: 'Profile', href: '/profile', active: true }] }}
      />,
    );
    await ue.click(screen.getByRole('button', { name: 'Open menu' }));
    const drawer = await screen.findByRole('dialog');
    const link = within(drawer).getByRole('link', { name: 'Profile' });
    expect(link).toHaveAttribute('href', '/profile');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('ArrowDown/ArrowUp on the trigger while open move focus into the menu', async () => {
    const { ue, trigger } = setup();
    await ue.click(trigger);
    const items = await screen.findAllByRole('menuitem');
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    expect(items[items.length - 1]).toHaveFocus();
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(items[0]).toHaveFocus();
  });

  it('ArrowUp from outside the items focuses the last item; other keys are ignored', async () => {
    const { ue, trigger } = setup();
    await ue.click(trigger);
    const menu = await screen.findByRole('menu');
    const items = within(menu).getAllByRole('menuitem');
    trigger.focus();
    fireEvent.keyDown(menu, { key: 'a' });
    expect(trigger).toHaveFocus();
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(items[items.length - 1]).toHaveFocus();
  });

  it('a menu with no name, items or sign-out is labelled "Account menu" and has no separator', async () => {
    const ue = userEvent.setup();
    render(<AppHeader user={{ avatarUrl: '/me.jpg', menuItems: [] }} />);
    const trigger = screen.getByRole('button', { name: 'Account menu' });
    await ue.click(trigger);
    const menu = await screen.findByRole('menu');
    expect(within(menu).queryByRole('separator')).not.toBeInTheDocument();
    expect(within(menu).queryAllByRole('menuitem')).toHaveLength(0);
    // Keyboard on an empty menu is a no-op.
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
  });

  it('sign-out only: no separator, default "Sign out" label', async () => {
    const ue = userEvent.setup();
    render(<AppHeader user={{ name: 'Jens', onSignOut: () => {}, menuItems: [] }} />);
    await ue.click(screen.getByRole('button', { name: 'Account menu for Jens' }));
    const menu = await screen.findByRole('menu');
    expect(within(menu).queryByRole('separator')).not.toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Sign out' })).toBeInTheDocument();
  });

  it.each([
    ['light', 'Theme: Light'],
    ['dark', 'Theme: Dark'],
  ])('themeInMenu cycle item reflects a stored "%s" preference', async (stored, label) => {
    window.localStorage.setItem('manfred-theme', stored);
    const { ue, trigger } = setup({ themeInMenu: true }, { themeToggle: 'cycle' });
    await ue.click(trigger);
    expect(await screen.findByRole('menuitem', { name: label })).toBeInTheDocument();
  });

  it('themeInMenu 2-state toggle offers "Switch to light mode" when dark', async () => {
    window.localStorage.setItem('manfred-theme', 'dark');
    const { ue, trigger } = setup({ themeInMenu: true }, { themeToggle: true });
    await ue.click(trigger);
    expect(await screen.findByRole('menuitem', { name: 'Switch to light mode' })).toBeInTheDocument();
  });
});
