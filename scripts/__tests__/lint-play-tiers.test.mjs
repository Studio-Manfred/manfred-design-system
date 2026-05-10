import { describe, it, expect } from 'vitest';
import { lintComponent } from '../lint-play-tiers.mjs';

describe('lintComponent — unmapped component', () => {
  it('rejects a component not in mapping or exclusion list', () => {
    const result = lintComponent({
      component: 'Mystery',
      storySource: 'export const Default = {};',
      mapping: { tiers: { A: [], B: [], C: [] }, excluded: [] },
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/not in tier mapping or exclusion list/);
  });
});

const mapping = {
  tiers: { A: ['Atom'], B: ['Widget'], C: ['Compound'] },
  excluded: ['Layout'],
};

const NO_PLAY = `
import type { Meta } from '@storybook/react-vite';
const meta = {} satisfies Meta<typeof X>;
export default meta;
export const Default = {};
`;

const TIER_A_PLAY = `
import { within, expect } from 'storybook/test';
export const Default = {
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).getByRole('button')).toBeInTheDocument();
  },
};
`;

const TIER_B_PLAY = `
import { within, userEvent, expect } from 'storybook/test';
export const Default = {
  play: async ({ canvasElement }) => {
    const btn = within(canvasElement).getByRole('button');
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('data-state', 'on');
  },
};
`;

const TIER_C_PLAY = `
import { within, userEvent, expect } from 'storybook/test';
export const Default = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
`;

describe('lintComponent — excluded component', () => {
  it('passes regardless of source', () => {
    const r = lintComponent({ component: 'Layout', storySource: NO_PLAY, mapping });
    expect(r.ok).toBe(true);
    expect(r.tier).toBe('excluded');
  });
});

describe('lintComponent — tier A', () => {
  it('rejects when no play function present', () => {
    const r = lintComponent({ component: 'Atom', storySource: NO_PLAY, mapping });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/no play function/i);
  });

  it('passes with smoke play (getByRole + expect)', () => {
    const r = lintComponent({ component: 'Atom', storySource: TIER_A_PLAY, mapping });
    expect(r.ok).toBe(true);
    expect(r.tier).toBe('A');
  });
});

describe('lintComponent — tier B', () => {
  it('rejects tier-A-only play (no userEvent)', () => {
    const r = lintComponent({ component: 'Widget', storySource: TIER_A_PLAY, mapping });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/userEvent/);
  });

  it('passes with click + expect', () => {
    const r = lintComponent({ component: 'Widget', storySource: TIER_B_PLAY, mapping });
    expect(r.ok).toBe(true);
    expect(r.tier).toBe('B');
  });
});

describe('lintComponent — tier C', () => {
  it('rejects tier-B-only play (no keyboard)', () => {
    const r = lintComponent({ component: 'Compound', storySource: TIER_B_PLAY, mapping });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/keyboard/);
  });

  it('rejects keyboard play with no ARIA assertion', () => {
    const noAria = TIER_C_PLAY.replace(`'aria-expanded'`, `'data-state'`);
    const r = lintComponent({ component: 'Compound', storySource: noAria, mapping });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/ARIA/);
  });

  it('passes with click + keyboard + ARIA', () => {
    const r = lintComponent({ component: 'Compound', storySource: TIER_C_PLAY, mapping });
    expect(r.ok).toBe(true);
    expect(r.tier).toBe('C');
  });
});
