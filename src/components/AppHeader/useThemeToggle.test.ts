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
