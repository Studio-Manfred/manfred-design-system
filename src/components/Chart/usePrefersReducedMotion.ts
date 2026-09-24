import * as React from 'react';

/**
 * Detect prefers-reduced-motion in a way that is safe for SSR / jsdom
 * and respects updates to the media query at runtime.
 */
export function usePrefersReducedMotion(forceReducedMotion?: boolean): boolean {
  const [reduced, setReduced] = React.useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
    // Older Safari fallback
    mq.addListener(listener);
    return () => mq.removeListener(listener);
  }, []);

  return forceReducedMotion ?? reduced;
}
