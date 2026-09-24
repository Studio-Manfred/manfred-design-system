import { describe, expect, it } from 'vitest';
import { parseTokens } from '../build-manifest.mjs';

const CSS = `
@import "tailwindcss";
:root {
  --blue-500: #2c28ec;  /* Business Blue */
  --neutral-900: #1e1e24;
  --space-4: 1rem;
  --color-text-primary: var(--neutral-900);
  --color-bg-brand: var(--blue-500);
  --foreground: var(--color-text-primary);
  --primary: var(--color-bg-brand);
}
.dark { --color-text-primary: #ffffff; }
@theme inline {
  --color-foreground: var(--foreground);
  --color-card-foreground: var(--foreground);
  --color-primary: var(--primary);
  --font-sans: var(--font-family-base);
}`;

describe('parseTokens', () => {
  const tokens = parseTokens(CSS);
  const byName = Object.fromEntries(tokens.map((t) => [t.name, t]));

  it('classifies layers', () => {
    expect(byName['--blue-500'].layer).toBe('primitive');
    expect(byName['--space-4'].layer).toBe('primitive');
    expect(byName['--color-text-primary'].layer).toBe('semantic');
    expect(byName['--foreground'].layer).toBe('contract');
  });

  it('strips comments and keeps the light (first) value over .dark', () => {
    expect(byName['--blue-500'].value).toBe('#2c28ec');
    expect(byName['--color-text-primary'].value).toBe('var(--neutral-900)');
  });

  it('tags the whole var() chain with the first @theme colour name', () => {
    expect(byName['--foreground'].utility).toBe('foreground');
    expect(byName['--color-text-primary'].utility).toBe('foreground');
    expect(byName['--neutral-900'].utility).toBe('foreground');
    expect(byName['--blue-500'].utility).toBe('primary');
  });

  it('excludes @theme declarations themselves and non-colour theme keys', () => {
    expect(byName['--color-foreground']).toBeUndefined();
    expect(byName['--font-sans']).toBeUndefined();
  });

  it('survives a var() cycle', () => {
    const out = parseTokens(':root{--a: var(--b); --b: var(--a);} @theme inline { --color-x: var(--a); }');
    expect(out.find((t) => t.name === '--a').utility).toBe('x');
  });
});
