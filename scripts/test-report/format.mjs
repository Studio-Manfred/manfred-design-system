// Pure helpers behind `npm run test:all`: turn vitest JSON and lint-play-tiers
// results into per-suite records, then render the branded report under the
// Manfred M. No I/O in here — scripts/test-all.mjs does spawning and printing.
// Ported from manfred-intranet (STU-873).
import { isAbsolute, relative } from 'node:path';

const NS = '@manfred';
const PACKAGE = '@studio-manfred/manfred-design-system';

// Manfred DS palette (src/tokens/tokens.css). blue-500 is the logo blue; it's
// too dark to read on a dark terminal, so the art uses blue-400 and text
// uses blue-300.
const PALETTE = {
  logo: [0x56, 0x53, 0xf0], // --blue-400
  accent: [0x80, 0x7e, 0xf4], // --blue-300
  text: [0xe8, 0xe8, 0xea], // --neutral-100
  muted: [0x7c, 0x7c, 0x82], // --neutral-400
  pass: [0xa6, 0xe3, 0xa1],
  fail: [0xf3, 0x8b, 0xa8],
  skip: [0xf9, 0xe2, 0xaf],
};

export function stripAnsi(s) {
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}

function painter(color) {
  const paint = (name) => (s) =>
    color ? `\x1b[38;2;${PALETTE[name].join(';')}m${s}\x1b[0m` : String(s);
  return Object.fromEntries(Object.keys(PALETTE).map((k) => [k, paint(k)]));
}

// ---------------------------------------------------------------------------
// Suite grouping

// Unit tests (jsdom) group by top-level folder; stories (play functions + axe
// in Chromium) get a `/stories` suffix so the two layers read as separate rows.
export function suiteFor(file, root = process.cwd()) {
  let p = isAbsolute(file) ? relative(root, file) : file;
  p = p.replace(/\\/g, '/').replace(/^\.\//, '');
  const seg = p.split('/');
  const stories = /\.stories\.[jt]sx?$/.test(p) ? '/stories' : '';

  if (seg[0] === 'src') {
    const area = seg.length === 2 ? 'docs' : seg[1];
    return `${NS}/${area}${stories}`;
  }
  return `${NS}/${seg[0]}${stories}`;
}

// ---------------------------------------------------------------------------
// Parsers → FileRecord { suite, file, passed, failed, skipped, durationMs, failures[] }

export function fromVitestJson(json, root = process.cwd()) {
  return (json.testResults ?? []).map((f) => {
    const rec = {
      suite: suiteFor(f.name, root),
      file: relative(root, f.name).replace(/\\/g, '/'),
      passed: 0,
      failed: 0,
      skipped: 0,
      durationMs: Math.max(0, (f.endTime ?? 0) - (f.startTime ?? 0)),
      failures: [],
    };
    for (const a of f.assertionResults ?? []) {
      if (a.status === 'passed') rec.passed++;
      else if (a.status === 'failed') {
        rec.failed++;
        rec.failures.push({ name: a.fullName ?? a.title, message: a.failureMessages?.[0] ?? '' });
      } else rec.skipped++;
    }
    // A file that fails to import has no assertions but a top-level message.
    if (f.status === 'failed' && rec.failed === 0) {
      rec.failed = 1;
      rec.failures.push({ name: '(file failed to load)', message: f.message ?? '' });
    }
    return rec;
  });
}

// lintAll() from scripts/lint-play-tiers.mjs → one record, one "test" per component.
export function fromPlayTiers(results, durationMs = 0) {
  const failed = results.filter((r) => !r.ok);
  return {
    suite: `${NS}/play-tiers`,
    file: 'scripts/play-tiers.json',
    passed: results.length - failed.length,
    failed: failed.length,
    skipped: 0,
    durationMs,
    failures: failed.map((r) => ({ name: r.component, message: r.reason ?? '' })),
  };
}

// A runner that died before (or without) reporting still has to show up red.
// Lead with an `…error…: detail` line when there is one — the tail of a
// crashed vitest run is usually box-drawing noise.
export function crashed(suite, label, { code, output }) {
  const lines = String(output).trim().split('\n');
  const telling = lines.filter((l) => /error\b[^'"]*:/i.test(l) && !/^\s+at /.test(l)).slice(0, 3);
  const message = [...telling, ...lines.slice(-5)].join('\n');
  return [{
    suite, file: label, passed: 0, failed: 1, skipped: 0, durationMs: 0,
    failures: [{ name: `runner exited with code ${code}`, message }],
  }];
}

// vitest can exit non-zero on an unhandled error (e.g. the browser failed to
// launch) while its JSON still lists every file as passed with 0 tests.
export function reconcileExit(records, res, suite, label) {
  if (res.code === 0 || records.some((r) => r.failed)) return records;
  return [...records, ...crashed(suite, label, res)];
}

// ---------------------------------------------------------------------------
// Aggregation

// Report order: foundations first, then components, then the browser layer.
const ORDER = [
  'tokens',
  'lib',
  'scripts',
  'play-tiers',
  'components',
  'tokens/stories',
  'docs/stories',
  'components/stories',
  'examples/stories',
];
export function suiteRank(name) {
  const i = ORDER.indexOf(name.replace(`${NS}/`, ''));
  return i === -1 ? ORDER.length : i;
}

export function aggregate(records) {
  const map = new Map();
  const totals = { passed: 0, failed: 0, skipped: 0, files: 0, filesFailed: 0, durationMs: 0 };
  const failures = [];
  for (const r of records) {
    if (!map.has(r.suite)) {
      map.set(r.suite, { name: r.suite, passed: 0, failed: 0, skipped: 0, files: 0, durationMs: 0 });
    }
    const s = map.get(r.suite);
    s.passed += r.passed;
    s.failed += r.failed;
    s.skipped += r.skipped;
    s.files++;
    s.durationMs += r.durationMs;
    totals.passed += r.passed;
    totals.failed += r.failed;
    totals.skipped += r.skipped;
    totals.files++;
    if (r.failed) totals.filesFailed++;
    totals.durationMs += r.durationMs;
    for (const f of r.failures) failures.push({ file: r.file, ...f });
  }
  const suites = [...map.values()].sort((a, b) => suiteRank(a.name) - suiteRank(b.name));
  return { suites, totals, failures };
}

export function formatDuration(ms) {
  return `${(Math.floor(ms / 10) / 100).toFixed(2)}s`;
}

// ---------------------------------------------------------------------------
// Rendering

// The M, drawn as solid rows. A dithered ▒ is added at the left edge of every
// bar at render time — same trick as the stripes in the inspiration banner.
const M = [
  '████           ████',
  '█████         █████',
  '██████       ██████',
  '███████     ███████',
  '████ ███   ███ ████',
  '████  ███ ███  ████',
  '████   █████   ████',
  '████    ███    ████',
  '████           ████',
];
const BAR = '█'.repeat(27);

export function renderLogo({ color = true } = {}) {
  const c = painter(color);
  const dither = (row) => row.replace(/(^| )█/g, '$1▒');
  const bar = '  ' + c.logo(dither(BAR));
  return ['', bar, '', ...M.map((row) => '      ' + c.logo(dither(row))), '', bar, ''];
}

export function renderBanner({ color = true, name = PACKAGE } = {}) {
  const c = painter(color);
  return [
    ...renderLogo({ color }),
    `  ${c.logo('▒█')} ${c.accent(name)}${c.muted(': Running test suites...')}`,
    '',
  ].join('\n');
}

export function renderResults(summary, { color = true, wallMs } = {}) {
  const c = painter(color);
  const { suites, totals, failures } = summary;
  const nameW = Math.max(...suites.map((s) => s.name.length), 0);
  const countW = Math.max(...suites.map((s) => String(s.passed).length), 1);
  const extra = (s) =>
    [s.failed && `${s.failed} failed`, s.skipped && `${s.skipped} skipped`].filter(Boolean).join('  ');
  const extraW = Math.max(...suites.map((s) => extra(s).length), 0);

  const out = [];
  for (const s of suites) {
    const ok = s.failed === 0;
    const ex = extra(s).padEnd(extraW);
    out.push(
      `  ${ok ? c.pass('✓') : c.fail('✗')} ${c.text(s.name.padEnd(nameW))}   ` +
        `${c.pass(`${String(s.passed).padStart(countW)} passed`)}` +
        (extraW ? `  ${s.failed ? c.fail(ex) : c.skip(ex)}` : '') +
        `  ${c.muted(formatDuration(s.durationMs).padStart(7))}`,
    );
  }

  if (failures.length) {
    out.push('', `  ${c.fail('Failures')}`);
    for (const f of failures.slice(0, 20)) {
      out.push(`  ${c.fail('✗')} ${c.text(`${f.file} › ${f.name}`)}`);
      const first = stripAnsi(String(f.message)).split('\n').find((l) => l.trim());
      if (first) out.push(`      ${c.muted(first.trim().slice(0, 160))}`);
    }
    if (failures.length > 20) out.push(`    ${c.muted(`…and ${failures.length - 20} more`)}`);
  }

  const count = (passed, failed, skipped, total) =>
    [
      failed && c.fail(`${failed} failed`),
      c.pass(`${passed} passed`),
      skipped && c.skip(`${skipped} skipped`),
    ]
      .filter(Boolean)
      .join(c.muted(' | ')) + c.muted(` (${total})`);

  const testsTotal = totals.passed + totals.failed + totals.skipped;
  out.push(
    '',
    `   ${c.text('Test Files:')}  ${count(totals.files - totals.filesFailed, totals.filesFailed, 0, totals.files)}`,
    `        ${c.text('Tests:')}  ${count(totals.passed, totals.failed, totals.skipped, testsTotal)}`,
    `     ${c.text('Duration:')}  ${c.muted(formatDuration(wallMs ?? totals.durationMs))}`,
    '',
    totals.failed
      ? `  ${c.fail(`✗ ${totals.failed} test${totals.failed === 1 ? '' : 's'} failed`)}`
      : `  ${c.pass('✓ All test suites passed!')}`,
    '',
  );
  return out.join('\n');
}

export function renderReport(summary, opts = {}) {
  return `${renderBanner(opts)}\n${renderResults(summary, opts)}`;
}
