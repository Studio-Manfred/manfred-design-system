/**
 * Shared brand identity for Examples/* demos.
 *
 * Reused across all four example demos so the next implementer can drop into
 * Reports / People / Settings without re-inventing the same mock data. Keep
 * these strings in sync with the Studio Manfred internal-tools voice — they
 * appear in user-facing demo screens and read like a real product, not lorem.
 */

export const brand = {
  name: 'Studio Manfred',
  appName: 'Mitt Intranat',
  tagline: 'Internal tools for the studio.',
} as const;

export const mockUser = {
  name: 'Jens Wedin',
  email: 'jens@studiomanfred.com',
  role: 'Designer-engineer',
  initials: 'JW',
} as const;

export interface DemoNavItem {
  label: string;
  href: string;
}

export const navItems: readonly DemoNavItem[] = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Reports', href: '#reports' },
  { label: 'People', href: '#people' },
  { label: 'Settings', href: '#settings' },
];

export const footerLinks: readonly DemoNavItem[] = [
  { label: 'Privacy', href: '#privacy' },
  { label: 'Terms', href: '#terms' },
  { label: 'Help', href: '#help' },
];
