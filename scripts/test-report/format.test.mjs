import { describe, expect, it } from 'vitest';
import {
  suiteFor,
  fromVitestJson,
  fromPlayTiers,
  reconcileExit,
  aggregate,
  formatDuration,
  renderReport,
  renderLogo,
  stripAnsi,
} from './format.mjs';

const ROOT = '/repo';

describe('suiteFor', () => {
  it.each([
    ['/repo/src/lib/utils.test.ts', '@manfred/lib'],
    ['/repo/scripts/__tests__/lint-play-tiers.test.mjs', '@manfred/scripts'],
    ['/repo/scripts/test-report/format.test.mjs', '@manfred/scripts'],
    ['/repo/src/components/Button/Button.test.tsx', '@manfred/components'],
    ['/repo/src/components/Button/Button.stories.tsx', '@manfred/components/stories'],
    ['/repo/src/tokens/tokens.stories.tsx', '@manfred/tokens/stories'],
    ['/repo/src/examples/Login/Login.stories.tsx', '@manfred/examples/stories'],
    ['/repo/src/Welcome.stories.tsx', '@manfred/docs/stories'],
    ['src/components/Tabs/Tabs.test.tsx', '@manfred/components'],
  ])('%s → %s', (file, suite) => {
    expect(suiteFor(file, ROOT)).toBe(suite);
  });
});

describe('fromVitestJson', () => {
  it('flattens assertion results into per-file records', () => {
    const json = {
      testResults: [
        {
          name: '/repo/src/lib/a.test.ts',
          startTime: 1000,
          endTime: 1250,
          assertionResults: [
            { status: 'passed', fullName: 'a works' },
            { status: 'failed', fullName: 'a breaks', failureMessages: ['boom'] },
            { status: 'skipped', fullName: 'a later' },
            { status: 'todo', fullName: 'a todo' },
          ],
        },
      ],
    };
    expect(fromVitestJson(json, ROOT)).toEqual([
      {
        suite: '@manfred/lib',
        file: 'src/lib/a.test.ts',
        passed: 1,
        failed: 1,
        skipped: 2,
        durationMs: 250,
        failures: [{ name: 'a breaks', message: 'boom' }],
      },
    ]);
  });

  it('counts a file that failed to load as one failure', () => {
    const json = {
      testResults: [
        { name: '/repo/src/components/X/X.stories.tsx', status: 'failed', message: 'SyntaxError', assertionResults: [] },
      ],
    };
    const [rec] = fromVitestJson(json, ROOT);
    expect(rec).toMatchObject({
      suite: '@manfred/components/stories',
      failed: 1,
      failures: [{ name: '(file failed to load)', message: 'SyntaxError' }],
    });
  });
});

describe('fromPlayTiers', () => {
  it('turns lint-play-tiers results into one record', () => {
    const rec = fromPlayTiers(
      [
        { component: 'Button', ok: true, tier: 'B' },
        { component: 'Stack', ok: true, tier: 'excluded' },
        { component: 'Mystery', ok: false, reason: 'not in tier mapping' },
      ],
      12,
    );
    expect(rec).toEqual({
      suite: '@manfred/play-tiers',
      file: 'scripts/play-tiers.json',
      passed: 2,
      failed: 1,
      skipped: 0,
      durationMs: 12,
      failures: [{ name: 'Mystery', message: 'not in tier mapping' }],
    });
  });
});

describe('aggregate', () => {
  it('orders suites foundations → components → stories, unknown last', () => {
    const rec = (suite) => ({ suite, file: suite, passed: 1, failed: 0, skipped: 0, durationMs: 1, failures: [] });
    const out = aggregate(
      [
        '@manfred/examples/stories',
        '@manfred/weird',
        '@manfred/components/stories',
        '@manfred/components',
        '@manfred/play-tiers',
        '@manfred/lib',
        '@manfred/tokens/stories',
        '@manfred/tokens',
      ].map(rec),
    );
    expect(out.suites.map((s) => s.name)).toEqual([
      '@manfred/tokens',
      '@manfred/lib',
      '@manfred/play-tiers',
      '@manfred/components',
      '@manfred/tokens/stories',
      '@manfred/components/stories',
      '@manfred/examples/stories',
      '@manfred/weird',
    ]);
  });

  it('groups by suite and sums totals', () => {
    const recs = [
      { suite: '@manfred/lib', file: 'a', passed: 2, failed: 0, skipped: 0, durationMs: 10, failures: [] },
      { suite: '@manfred/components', file: 'b', passed: 1, failed: 1, skipped: 0, durationMs: 5, failures: [{ name: 'x', message: 'y' }] },
      { suite: '@manfred/lib', file: 'c', passed: 3, failed: 0, skipped: 1, durationMs: 20, failures: [] },
    ];
    const out = aggregate(recs);
    expect(out.suites.map((s) => [s.name, s.passed, s.files, s.durationMs])).toEqual([
      ['@manfred/lib', 5, 2, 30],
      ['@manfred/components', 1, 1, 5],
    ]);
    expect(out.totals).toMatchObject({ passed: 6, failed: 1, skipped: 1, files: 3, filesFailed: 1 });
    expect(out.failures).toEqual([{ file: 'b', name: 'x', message: 'y' }]);
  });
});

describe('formatDuration', () => {
  it.each([
    [0, '0.00s'],
    [4, '0.00s'],
    [490, '0.49s'],
    [12430, '12.43s'],
    [62770, '62.77s'],
  ])('%i ms → %s', (ms, out) => expect(formatDuration(ms)).toBe(out));
});

describe('renderLogo', () => {
  it('renders a mirror-symmetric M between two bars', () => {
    const lines = renderLogo({ color: false }).map((l) => l.trimEnd());
    const bars = lines.filter((l) => /^ *▒█{10,}$/.test(l));
    expect(bars).toHaveLength(2);
    const body = lines.filter((l) => l.trim() && !bars.includes(l));
    expect(body.length).toBeGreaterThan(6);
    for (const row of body) {
      const norm = row.trim().replace(/▒/g, '█');
      expect(norm).toBe([...norm].reverse().join(''));
    }
  });
});

describe('renderReport', () => {
  const summary = aggregate([
    { suite: '@manfred/lib', file: 'a', passed: 7, failed: 0, skipped: 0, durationMs: 490, failures: [] },
    { suite: '@manfred/components/stories', file: 'b', passed: 233, failed: 0, skipped: 0, durationMs: 12430, failures: [] },
  ]);

  it('prints the package banner, aligned rows and a green footer', () => {
    const text = stripAnsi(renderReport(summary, { color: false, wallMs: 62770 }));
    expect(text).toContain('@studio-manfred/manfred-design-system: Running test suites...');
    expect(text).toMatch(/✓ @manfred\/lib\s+7 passed\s+0\.49s/);
    expect(text).toMatch(/✓ @manfred\/components\/stories\s+233 passed\s+12\.43s/);
    expect(text).toMatch(/Test Files:\s+2 passed \(2\)/);
    expect(text).toMatch(/Tests:\s+240 passed \(240\)/);
    expect(text).toMatch(/Duration:\s+62\.77s/);
    expect(text).toContain('✓ All test suites passed!');
    const rows = text.split('\n').filter((l) => l.includes(' passed ') && l.includes('@manfred/'));
    expect(new Set(rows.map((l) => l.indexOf(' passed'))).size).toBe(1);
  });

  it('lists failures and a red footer when anything fails', () => {
    const failing = aggregate([
      {
        suite: '@manfred/lib',
        file: 'src/lib/a.test.ts',
        passed: 1,
        failed: 1,
        skipped: 0,
        durationMs: 5,
        failures: [{ name: 'a breaks', message: 'boom\nstack' }],
      },
    ]);
    const text = stripAnsi(renderReport(failing, { color: false, wallMs: 5 }));
    expect(text).toMatch(/✗ @manfred\/lib\s+1 passed\s+1 failed/);
    expect(text).toContain('src/lib/a.test.ts › a breaks');
    expect(text).toContain('boom');
    expect(text).not.toContain('stack');
    expect(text).toContain('✗ 1 test failed');
  });

  it('emits ANSI colour only when asked', () => {
    expect(renderReport(summary, { color: false, wallMs: 1 })).not.toMatch(/\x1b\[/);
    expect(renderReport(summary, { color: true, wallMs: 1 })).toMatch(/\x1b\[38;2;/);
  });
});

describe('reconcileExit', () => {
  const ok = { suite: '@manfred/components/stories', file: 'a.stories.tsx', passed: 0, failed: 0, skipped: 0, durationMs: 0, failures: [] };

  it('keeps records untouched when the runner exited 0', () => {
    expect(reconcileExit([ok], { code: 0, output: '' }, '@manfred/stories', 'vitest')).toEqual([ok]);
  });

  it('keeps records untouched when a non-zero exit is already explained by failures', () => {
    const bad = { ...ok, failed: 1, failures: [{ name: 'x', message: 'y' }] };
    expect(reconcileExit([bad], { code: 1, output: '' }, '@manfred/stories', 'vitest')).toEqual([bad]);
  });

  it('adds a red record when the runner failed but every file looks green', () => {
    const out = reconcileExit([ok], { code: 1, output: "noise\nerror during launch: Executable doesn't exist\n  name: 'Error',\n╚════╝" }, '@manfred/stories', 'vitest --project storybook');
    expect(out).toHaveLength(2);
    expect(out[1]).toMatchObject({
      suite: '@manfred/stories',
      file: 'vitest --project storybook',
      failed: 1,
      failures: [{ name: 'runner exited with code 1' }],
    });
    // the most telling line comes first — that's the one the report prints
    expect(out[1].failures[0].message.split('\n')[0]).toBe("error during launch: Executable doesn't exist");
  });
});
