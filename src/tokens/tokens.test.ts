// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as tokens from './index';

// The TS token objects are a public export with values copied by hand from
// tokens.css. These tests fail when the two drift apart.
const css = readFileSync(fileURLToPath(new URL('./tokens.css', import.meta.url)), 'utf8');

// First declaration wins: primitives are declared once in :root and never
// rebind under dark mode, so later (dark) blocks don't matter here.
const declared = new Map<string, string>();
for (const [, name, value] of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
  if (!declared.has(name)) declared.set(name, value.replace(/\/\*.*?\*\//g, '').trim());
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const norm = (v: string | number) => String(v).trim().toLowerCase();

function expectCssVar(name: string, value: string | number) {
  expect(declared.has(name), `${name} is not declared in tokens.css`).toBe(true);
  expect(norm(declared.get(name)!), name).toBe(norm(value));
}

describe('TS tokens match tokens.css', () => {
  it.each([
    ['blue', tokens.blue],
    ['neutral', tokens.neutral],
  ] as const)('%s scale → --%s-<step>', (scale, values) => {
    for (const [step, hex] of Object.entries(values)) expectCssVar(`--${scale}-${step}`, hex);
  });

  it('warm colours → --pink / --beige / --beige-light / --white', () => {
    for (const [key, hex] of Object.entries(tokens.warm)) expectCssVar(`--${kebab(key)}`, hex);
  });

  it('legacy `colors` only uses values from the primitive palette', () => {
    const palette = new Set([...declared.values()].map(norm));
    for (const [key, hex] of Object.entries(tokens.colors)) {
      expect(palette.has(norm(hex)), `colors.${key} (${hex}) is not a tokens.css value`).toBe(true);
    }
  });

  it.each([
    ['--font-family', tokens.fontFamily],
    ['--font-weight', tokens.fontWeight],
    ['--font-size', tokens.fontSize],
    ['--line-height', tokens.lineHeight],
    ['--space', tokens.spacing],
    ['--size', tokens.size],
  ] as const)('%s-* scale', (prefix, values) => {
    for (const [key, value] of Object.entries(values)) expectCssVar(`${prefix}-${key}`, value);
  });

  it.each([
    ['textColors', tokens.textColors],
    ['backgroundColors', tokens.backgroundColors],
    ['borderColors', tokens.borderColors],
    ['focusTokens', tokens.focusTokens],
    ['interactiveColors', tokens.interactiveColors],
    ['controlSize', tokens.controlSize],
    ['iconSize', tokens.iconSize],
    ['containerSize', tokens.containerSize],
  ] as const)('every var() in %s points at a declared custom property', (label, values) => {
    const refs: string[] = [];
    const walk = (o: object) => {
      for (const v of Object.values(o)) {
        if (v && typeof v === 'object') walk(v);
        else for (const [, ref] of String(v).matchAll(/var\((--[\w-]+)/g)) refs.push(ref);
      }
    };
    walk(values);
    expect(refs.length, `${label} has no var() references`).toBeGreaterThan(0);
    for (const ref of refs) expect(declared.has(ref), `${label}: ${ref} is not declared`).toBe(true);
  });
});
