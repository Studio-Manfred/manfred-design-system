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

  it('toggle from preference="system" commits to an explicit value', () => {
    // Lock the OS pref to 'light' so the test is deterministic regardless of
    // the polyfill's default or earlier-test matchMedia mock state.
    vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: false,
      media: q,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as MediaQueryList);

    const { result } = renderHook(() => useThemeToggle());
    expect(result.current.preference).toBe('system');
    expect(result.current.resolved).toBe('light');

    act(() => result.current.toggle());

    // Toggling from 'system' commits the preference to an explicit value
    // (the opposite of the resolved theme): light → dark here.
    expect(result.current.preference).toBe('dark');
    expect(result.current.preference).not.toBe('system');
    expect(result.current.resolved).toBe('dark');
  });

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

  it('falls back to "system" when the stored value is not a known preference', () => {
    window.localStorage.setItem(STORAGE_KEY, 'sepia');
    const { result } = renderHook(() => useThemeToggle());
    expect(result.current.preference).toBe('system');
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

describe('useThemeToggle — OS preference changes', () => {
  let changeHandler: ((e: MediaQueryListEvent) => void) | undefined;
  let removeEventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
    changeHandler = undefined;
    removeEventListener = vi.fn();
    vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: false,
      media: q,
      onchange: null,
      addEventListener: vi.fn((_type: string, handler: (e: MediaQueryListEvent) => void) => {
        changeHandler = handler;
      }),
      removeEventListener,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const flipOs = (dark: boolean) =>
    act(() => changeHandler?.({ matches: dark } as MediaQueryListEvent));

  it('follows the OS live while preference is "system"', () => {
    const { result } = renderHook(() => useThemeToggle());
    expect(result.current.resolved).toBe('light');

    flipOs(true);
    expect(result.current.resolved).toBe('dark');

    flipOs(false);
    expect(result.current.resolved).toBe('light');
  });

  it('ignores OS changes while an explicit preference is set', () => {
    window.localStorage.setItem(STORAGE_KEY, 'light');
    const { result } = renderHook(() => useThemeToggle());
    flipOs(true);
    expect(result.current.resolved).toBe('light');
  });

  it('toggle after an OS flip to dark commits "light"', () => {
    const { result } = renderHook(() => useThemeToggle());
    flipOs(true);
    act(() => result.current.toggle());
    expect(result.current.preference).toBe('light');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('stops listening to the OS query on unmount', () => {
    const { unmount } = renderHook(() => useThemeToggle());
    const handler = changeHandler;
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', handler);
  });
});

describe('useThemeToggle — missing browser APIs', () => {
  const originalMatchMedia = window.matchMedia;
  const localStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    if (localStorageDescriptor) Object.defineProperty(window, 'localStorage', localStorageDescriptor);
  });

  it('resolves "system" to light and still toggles when matchMedia is unavailable', () => {
    // @ts-expect-error — simulate an environment without matchMedia
    window.matchMedia = undefined;
    const { result } = renderHook(() => useThemeToggle());
    expect(result.current.preference).toBe('system');
    expect(result.current.resolved).toBe('light');

    act(() => result.current.toggle());
    expect(result.current.resolved).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('works in memory (no persistence) when localStorage is unavailable', () => {
    Object.defineProperty(window, 'localStorage', { value: undefined, configurable: true });
    const { result } = renderHook(() => useThemeToggle());
    expect(result.current.preference).toBe('system');

    act(() => result.current.setPreference('dark'));
    expect(result.current.preference).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
