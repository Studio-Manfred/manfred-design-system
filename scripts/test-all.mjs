#!/usr/bin/env node
// Branded one-shot test run: vitest unit (jsdom) + storybook (play functions +
// axe in Chromium) + the play-tier lint, summarised per suite under the Manfred M.
//
//   npm run test:all                # unit + stories + play-tiers
//   npm run test:all -- --unit      # skip the Chromium stories project
//
// Colour follows the TTY; NO_COLOR disables it, FORCE_COLOR forces it.
// Formatting lives in ./test-report/format.mjs (unit-tested).
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lintAll } from './lint-play-tiers.mjs';
import {
  aggregate,
  crashed,
  fromPlayTiers,
  fromVitestJson,
  reconcileExit,
  renderBanner,
  renderResults,
} from './test-report/format.mjs';

const args = new Set(process.argv.slice(2));
const root = process.cwd();
const color = process.env.FORCE_COLOR
  ? process.env.FORCE_COLOR !== '0'
  : Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const tmp = mkdtempSync(join(tmpdir(), 'manfred-ds-tests-'));

function run(cmd, argv) {
  return new Promise((resolve) => {
    const child = spawn(cmd, argv, {
      cwd: root,
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (d) => (output += d));
    child.stderr.on('data', (d) => (output += d));
    child.on('error', (err) => resolve({ code: 127, output: String(err) }));
    child.on('close', (code) => resolve({ code, output }));
  });
}

function vitest(project, suite) {
  return (async () => {
    const out = join(tmp, `${project}.json`);
    const res = await run('npx', ['vitest', 'run', '--project', project, '--reporter=json', `--outputFile=${out}`]);
    try {
      if (existsSync(out)) {
        const records = fromVitestJson(JSON.parse(readFileSync(out, 'utf8')), root);
        return reconcileExit(records, res, suite, `vitest --project ${project}`);
      }
    } catch {
      // fall through to the crash record
    }
    return crashed(suite, `vitest --project ${project}`, res);
  })();
}

const jobs = [
  vitest('unit', '@manfred/unit'),
  (async () => {
    const t0 = Date.now();
    try {
      return [fromPlayTiers(await lintAll(), Date.now() - t0)];
    } catch (err) {
      return crashed('@manfred/play-tiers', 'lint-play-tiers', { code: 2, output: String(err) });
    }
  })(),
];
if (!args.has('--unit')) jobs.push(vitest('storybook', '@manfred/stories'));

process.stdout.write(renderBanner({ color }) + '\n');

const started = Date.now();
const frames = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
let tick = 0;
const spinner = process.stdout.isTTY
  ? setInterval(() => {
      const s = ((Date.now() - started) / 1000).toFixed(1);
      process.stdout.write(`\r  ${frames[tick++ % frames.length]} running ${jobs.length} runners… ${s}s`);
    }, 80)
  : null;

const records = (await Promise.all(jobs)).flat();
if (spinner) {
  clearInterval(spinner);
  process.stdout.write('\r\x1b[2K');
}
rmSync(tmp, { recursive: true, force: true });

const summary = aggregate(records);
process.stdout.write(renderResults(summary, { color, wallMs: Date.now() - started }) + '\n');
process.exit(summary.totals.failed ? 1 : 0);
