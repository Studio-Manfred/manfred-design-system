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

const SPA_NAV = [
  { label: 'Home', as: 'button' as const, active: true, onClick: () => {} },
  { label: 'Boards', as: 'button' as const, onClick: () => {} },
  { label: 'Information', as: 'button' as const, onClick: () => {} },
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
    search: <SearchBar size="sm" placeholder="Search..." trailing={<Kbd keys={['⌘', 'K']} />} />,
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

export const Monogram: Story = {
  name: 'Monogram logo (narrow surfaces)',
  args: {
    logo: 'monogram',
    appName: 'Intranet',
    navItems: NAV,
    themeToggle: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Switch to the monogram via `logo="monogram"` when the wordmark + appName ' +
          'combination would crowd the header on narrow surfaces.',
      },
    },
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
