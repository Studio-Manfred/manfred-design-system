import { describe, it, expect } from 'vitest';
import { lintComponent, lintAll } from '../lint-play-tiers.mjs';

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

describe('lintComponent — defensive guards', () => {
  const validSource = `
    import { within, expect } from 'storybook/test';
    export const Default = {
      play: async ({ canvasElement }) => {
        expect(within(canvasElement).getByRole('button')).toBeInTheDocument();
      },
    };
  `;

  it('rejects malformed mapping (missing excluded)', () => {
    const r = lintComponent({
      component: 'Atom',
      storySource: validSource,
      mapping: { tiers: { A: ['Atom'], B: [], C: [] } },
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/malformed mapping/i);
  });

  it('rejects malformed mapping (missing tiers.B)', () => {
    const r = lintComponent({
      component: 'Atom',
      storySource: validSource,
      mapping: { tiers: { A: ['Atom'], C: [] }, excluded: [] },
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/malformed mapping/i);
  });

  it('rejects non-string storySource', () => {
    const r = lintComponent({
      component: 'Atom',
      storySource: undefined,
      mapping: { tiers: { A: ['Atom'], B: [], C: [] }, excluded: [] },
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/must be a string/i);
  });

  it('rejects component appearing in multiple tiers', () => {
    const r = lintComponent({
      component: 'Atom',
      storySource: validSource,
      mapping: { tiers: { A: ['Atom'], B: ['Atom'], C: [] }, excluded: [] },
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/multiple tier arrays/i);
  });
});

describe('lintComponent — robustness', () => {
  it('matches play function with multi-param destructure', () => {
    const source = `
      import { within, expect } from 'storybook/test';
      export const Default = {
        play: async ({ canvasElement, args, step }) => {
          expect(within(canvasElement).getByRole('button')).toBeInTheDocument();
        },
      };
    `;
    const r = lintComponent({
      component: 'Atom',
      storySource: source,
      mapping: { tiers: { A: ['Atom'], B: [], C: [] }, excluded: [] },
    });
    expect(r.ok).toBe(true);
    expect(r.tier).toBe('A');
  });

  it('matches play function with nested destructure params', () => {
    const source = `
      import { within, expect } from 'storybook/test';
      export const Default = {
        play: async ({ canvasElement, args: { onClick } }) => {
          expect(within(canvasElement).getByRole('button')).toBeInTheDocument();
        },
      };
    `;
    const r = lintComponent({
      component: 'Atom',
      storySource: source,
      mapping: { tiers: { A: ['Atom'], B: [], C: [] }, excluded: [] },
    });
    expect(r.ok).toBe(true);
    expect(r.tier).toBe('A');
  });

  it('does not satisfy tier B from a userEvent.click hidden in a comment', () => {
    const source = `
      import { within, expect } from 'storybook/test';
      // TODO: await userEvent.click(button)
      export const Default = {
        play: async ({ canvasElement }) => {
          expect(within(canvasElement).getByRole('button')).toBeInTheDocument();
        },
      };
    `;
    const r = lintComponent({
      component: 'Widget',
      storySource: source,
      mapping: { tiers: { A: [], B: ['Widget'], C: [] }, excluded: [] },
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/userEvent/);
  });

  it('does not satisfy tier C from an aria-* hidden in a block comment', () => {
    const source = `
      import { within, userEvent, expect } from 'storybook/test';
      /* expects aria-expanded after click */
      export const Default = {
        play: async ({ canvasElement }) => {
          const trigger = within(canvasElement).getByRole('button');
          await userEvent.click(trigger);
          await userEvent.keyboard('{Escape}');
          expect(trigger).toHaveAttribute('data-state', 'closed');
        },
      };
    `;
    const r = lintComponent({
      component: 'Compound',
      storySource: source,
      mapping: { tiers: { A: [], B: [], C: ['Compound'] }, excluded: [] },
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/ARIA/);
  });
});

describe('lintAll — repository walker', () => {
  it('runs against the real repo and returns a result per component', async () => {
    const results = await lintAll();
    // 37 components should produce 37 results.
    expect(results.length).toBe(37);
    // All results must have ok set.
    expect(results.every((r) => typeof r.ok === 'boolean')).toBe(true);
  });
});
