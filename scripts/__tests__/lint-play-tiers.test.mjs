import { describe, it, expect } from 'vitest';
import {
  lintComponent,
  lintAll,
  formatCliSummary,
  formatAuditReport,
  main,
} from '../lint-play-tiers.mjs';

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
    // 41 components should produce 41 results (Stepper added in v0.30.0).
    expect(results.length).toBe(41);
    // All results must have ok set.
    expect(results.every((r) => typeof r.ok === 'boolean')).toBe(true);
  });
});

describe('formatCliSummary', () => {
  it('passes with a single stdout line when every component is ok', () => {
    const r = formatCliSummary([
      { component: 'A', ok: true, tier: 'A' },
      { component: 'L', ok: true, tier: 'excluded' },
    ]);
    expect(r).toEqual({ exitCode: 0, stdout: ['✓ 2 components pass lint:play-tiers.'], stderr: [] });
  });

  it('fails with one ✗ line per failure plus a count summary, nothing on stdout', () => {
    const r = formatCliSummary([
      { component: 'A', ok: true, tier: 'A' },
      { component: 'B', ok: false, tier: 'B', reason: 'no userEvent' },
      { component: 'C', ok: false, reason: 'No stories file' },
    ]);
    expect(r.exitCode).toBe(1);
    expect(r.stdout).toEqual([]);
    expect(r.stderr).toEqual([
      '✗ B: no userEvent',
      '✗ C: No stories file',
      '\n2 of 3 components failed lint:play-tiers.',
    ]);
  });
});

describe('formatAuditReport', () => {
  const results = [
    { component: 'Atom', ok: true, tier: 'A' },
    { component: 'Layout', ok: true, tier: 'excluded' },
    { component: 'Widget', ok: false, tier: 'B', reason: 'missing play' },
    { component: 'Orphan', ok: false, reason: 'unmapped' },
  ];

  it('renders header, totals, failing and passing sections', () => {
    expect(formatAuditReport(results, '2026-01-01T00:00:00.000Z')).toBe(
      [
        '# Play Functions Audit',
        '',
        'Generated by `npm run lint:play-tiers -- --report` on 2026-01-01T00:00:00.000Z.',
        '',
        'Total: 4. Passing: 2. Failing: 2.',
        '',
        '## Failing components',
        '',
        '- **Widget** (tier B) — missing play',
        '- **Orphan** (tier ?) — unmapped',
        '',
        '## Passing components',
        '',
        '- Atom — tier A',
        '- Layout — tier excluded',
      ].join('\n') + '\n',
    );
  });

  it('writes _None._ under failing components when all pass', () => {
    const md = formatAuditReport([{ component: 'Atom', ok: true, tier: 'A' }], 'T');
    expect(md).toContain('## Failing components\n\n_None._\n\n## Passing components');
  });
});

describe('main (CLI)', () => {
  const harness = async (results, argv = ['node', 'lint-play-tiers.mjs']) => {
    const calls = { log: [], error: [], exit: [], writes: [] };
    await main({
      argv,
      lint: async () => results,
      auditPath: '/virtual/docs/PLAY-AUDIT.md',
      now: () => new Date('2026-02-03T04:05:06.000Z'),
      writeFile: async (...args) => {
        calls.writes.push(args);
      },
      log: (m) => calls.log.push(m),
      error: (m) => calls.error.push(m),
      exit: (c) => calls.exit.push(c),
    });
    return calls;
  };

  it('logs a tick and does not call exit when all pass', async () => {
    const calls = await harness([{ component: 'A', ok: true, tier: 'A' }]);
    expect(calls.exit).toEqual([]);
    expect(calls.log).toEqual(['✓ 1 components pass lint:play-tiers.']);
    expect(calls.error).toEqual([]);
    expect(calls.writes).toEqual([]);
  });

  it('exits 1 and reports failures on stderr', async () => {
    const calls = await harness([{ component: 'B', ok: false, reason: 'bad' }]);
    expect(calls.exit).toEqual([1]);
    expect(calls.error[0]).toBe('✗ B: bad');
    expect(calls.log).toEqual([]);
  });

  it('--report writes the audit file and exits 0 even with failures', async () => {
    const results = [
      { component: 'A', ok: true, tier: 'A' },
      { component: 'B', ok: false, reason: 'bad' },
    ];
    const calls = await harness(results, ['node', 'lint-play-tiers.mjs', '--report']);
    expect(calls.exit).toEqual([0]);
    expect(calls.writes).toEqual([
      ['/virtual/docs/PLAY-AUDIT.md', formatAuditReport(results, '2026-02-03T04:05:06.000Z'), 'utf8'],
    ]);
    expect(calls.log).toEqual(['Wrote /virtual/docs/PLAY-AUDIT.md (1 failing, 1 passing).']);
    expect(calls.error).toEqual([]);
  });
});
