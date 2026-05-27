import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// jsdom does not implement window.matchMedia. Install a stub so tests that
// need to spy on or mock it can do so without a preceding `Object.defineProperty`.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Node 26 ships an experimental built-in `localStorage` that is undefined
// unless `--localstorage-file` is passed. When vitest's jsdom environment
// calls `populateGlobal`, it skips any key that already exists on the Node
// global — so jsdom's real Storage implementation never reaches `window`.
// Polyfill with a plain Map-backed shim so tests can exercise localStorage
// without launching Node with extra flags.
if (typeof window !== 'undefined' && typeof window.localStorage === 'undefined') {
  const store = new Map<string, string>();
  const storage: Storage = {
    get length() { return store.size; },
    key(index: number) { return [...store.keys()][index] ?? null; },
    getItem(key: string) { return store.get(key) ?? null; },
    setItem(key: string, value: string) { store.set(key, value); },
    removeItem(key: string) { store.delete(key); },
    clear() { store.clear(); },
  };
  Object.defineProperty(window, 'localStorage', {
    value: storage,
    writable: true,
    configurable: true,
  });
}

// Radix + jsdom: ResizeObserver / hasPointerCapture / scrollIntoView are unimplemented.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

if (typeof window !== 'undefined') {
  if (!('PointerEvent' in window)) {
    (window as unknown as { PointerEvent: typeof MouseEvent }).PointerEvent = MouseEvent as unknown as typeof PointerEvent;
  }
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}
