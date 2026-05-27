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
 *
 * @example
 * ```tsx
 * const { resolved, toggle } = useThemeToggle();
 * return <button onClick={toggle}>{resolved === 'dark' ? '☀️' : '🌙'}</button>;
 * ```
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
