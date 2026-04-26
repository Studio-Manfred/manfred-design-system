/**
 * Studio Manfred-flavoured mock data for the Settings demo.
 *
 * The strings read like a real Swedish design studio's internal admin UI.
 * Defaults are tuned so HappyPath shows believable saved state. NOT lorem
 * ipsum on purpose. Mirrors the fixture style of Dashboard/_fixtures.ts.
 */

export interface SettingsCategory {
  label: string;
  href: string;
}

export const settingsCategories: readonly SettingsCategory[] = [
  { label: 'Account', href: '#account' },
  { label: 'Notifications', href: '#notifications' },
  { label: 'Theme', href: '#theme' },
  { label: 'Sessions', href: '#sessions' },
  { label: 'Billing', href: '#billing' },
];

export interface RoleOption {
  value: string;
  label: string;
}

export const roleOptions: readonly RoleOption[] = [
  { value: 'designer-engineer', label: 'Designer-engineer' },
  { value: 'design-lead', label: 'Design lead' },
  { value: 'product-designer', label: 'Product designer' },
  { value: 'studio-director', label: 'Studio director' },
  { value: 'collaborator', label: 'External collaborator' },
];

export interface NotificationPref {
  id: string;
  label: string;
  enabled: boolean;
}

export const notificationPrefs: readonly NotificationPref[] = [
  { id: 'pref-weekly-digest', label: 'Weekly digest', enabled: true },
  { id: 'pref-mentions', label: 'Mention notifications', enabled: true },
  { id: 'pref-deploys', label: 'Deploy alerts', enabled: false },
  { id: 'pref-replies', label: 'Comment replies', enabled: true },
  { id: 'pref-invoices', label: 'Invoice reminders', enabled: false },
];

export type ThemePreference = 'system' | 'light' | 'dark';

export interface ThemeOption {
  value: ThemePreference;
  label: string;
  hint: string;
}

export const themeOptions: readonly ThemeOption[] = [
  { value: 'system', label: 'Match system', hint: 'Follow OS preference' },
  { value: 'light', label: 'Light', hint: 'Always light theme' },
  { value: 'dark', label: 'Dark', hint: 'Always dark theme' },
];

export interface SessionTimeout {
  value: string;
  label: string;
}

export const sessionTimeouts: readonly SessionTimeout[] = [
  { value: '15m', label: '15 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '8h', label: '8 hours' },
  { value: 'never', label: 'Never sign me out' },
];

// Default form values for HappyPath / Error states (Error preserves last-known).
export const defaultSettings = {
  fullName: 'Jens Wedin',
  email: 'jens@studiomanfred.com',
  role: 'designer-engineer',
  theme: 'system' as ThemePreference,
  sessionTimeout: '8h',
} as const;
