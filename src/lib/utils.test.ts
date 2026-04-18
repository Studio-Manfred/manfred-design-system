import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn()', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('merges conflicting Tailwind utilities via tailwind-merge (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-sm', 'text-base')).toBe('text-base');
  });

  it('supports object + array forms (clsx)', () => {
    expect(cn({ a: true, b: false }, ['c', 'd'])).toBe('a c d');
  });
});
