// Runtime a11y scan: every Storybook story, via Playwright + axe-core.
// Usage:
//   node scripts/a11y-runtime-scan.mjs            # light colour-scheme
//   node scripts/a11y-runtime-scan.mjs --dark     # dark colour-scheme
import http from 'node:http';
import fs from 'node:fs';
import { chromium } from 'playwright';

const MODE = process.argv.includes('--dark') ? 'dark' : 'light';

function get(p) {
  return new Promise((res, rej) => {
    http.get('http://localhost:6006' + p, r => {
      const b = [];
      r.on('data', c => b.push(c));
      r.on('end', () => res(Buffer.concat(b).toString()));
    }).on('error', rej);
  });
}

// Rules disabled globally in .storybook/preview.ts — they don't apply to isolated stories.
const GLOBAL_DISABLED_RULES = ['region', 'landmark-one-main', 'page-has-heading-one'];
// Stories where colour-contrast is intentionally off (swatch/token/typography showcases).
const CONTRAST_EXEMPT_STORIES = new Set([
  'foundation-tokens--brand-palette',
  'foundation-tokens--color-scales',
  'foundation-tokens--semantic-tokens',
  'foundation-tokens--sizing-tokens',
  'foundation-typography--color-variants',
]);

async function scanStory(page, story) {
  const url = `http://localhost:6006/iframe.html?id=${story.id}&viewMode=story`;
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(600);
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js' });
    const disabledRules = [...GLOBAL_DISABLED_RULES];
    if (CONTRAST_EXEMPT_STORIES.has(story.id)) disabledRules.push('color-contrast');
    const results = await page.evaluate(async (disabled) => {
      return await window.axe.run(document, {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
        rules: Object.fromEntries(disabled.map(id => [id, { enabled: false }])),
      });
    }, disabledRules);
    return {
      id: story.id,
      title: story.title + ' / ' + story.name,
      violations: results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map(n => ({
          html: (n.html || '').slice(0, 240),
          target: n.target,
          failure: (n.failureSummary || '').slice(0, 300),
        })),
      })),
      passes: results.passes.length,
      incomplete: results.incomplete.length,
    };
  } catch (e) {
    return { id: story.id, title: story.title + ' / ' + story.name, error: e.message };
  }
}

const index = JSON.parse(await get('/index.json'));
const stories = Object.values(index.entries || {}).filter(e => e.type === 'story');
console.log(`Scanning ${stories.length} stories in ${MODE.toUpperCase()} mode...`);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ colorScheme: MODE });
const concurrency = 4;
const results = [];
const queue = stories.slice();
async function worker() {
  const page = await ctx.newPage();
  while (queue.length) {
    const s = queue.shift();
    const r = await scanStory(page, s);
    results.push(r);
    process.stdout.write(r.violations && r.violations.length ? '!' : r.error ? 'E' : '.');
  }
  await page.close();
}
await Promise.all(Array.from({ length: concurrency }, worker));
console.log('');

await browser.close();

const failed = results.filter(r => r.violations && r.violations.length);
const errored = results.filter(r => r.error);
const ruleAgg = {};
for (const r of failed) {
  for (const v of r.violations) {
    if (!ruleAgg[v.id]) {
      ruleAgg[v.id] = {
        impact: v.impact,
        description: v.description,
        helpUrl: v.helpUrl,
        stories: new Set(),
        nodeCount: 0,
        sampleNodes: [],
      };
    }
    ruleAgg[v.id].stories.add(r.id);
    ruleAgg[v.id].nodeCount += v.nodes.length;
    if (ruleAgg[v.id].sampleNodes.length < 3) {
      for (const n of v.nodes) {
        if (ruleAgg[v.id].sampleNodes.length < 3) ruleAgg[v.id].sampleNodes.push({ story: r.id, ...n });
      }
    }
  }
}
const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const rules = Object.entries(ruleAgg)
  .map(([id, v]) => ({
    id,
    impact: v.impact,
    description: v.description,
    helpUrl: v.helpUrl,
    stories: [...v.stories].sort(),
    nodeCount: v.nodeCount,
    sampleNodes: v.sampleNodes,
  }))
  .sort(
    (a, b) =>
      (impactOrder[a.impact ?? 'minor'] ?? 4) - (impactOrder[b.impact ?? 'minor'] ?? 4) ||
      b.nodeCount - a.nodeCount
  );

fs.writeFileSync('/tmp/a11y-runtime.json', JSON.stringify({ results, rules }, null, 2));

console.log('=== SUMMARY ===');
console.log('Stories scanned        :', results.length);
console.log('Stories with violations:', failed.length);
console.log('Stories with errors    :', errored.length);
console.log('Unique rules violated  :', rules.length);
console.log('\n=== RULES ===');
for (const r of rules) {
  console.log(`  [${r.impact || 'n/a'}] ${r.id}  — ${r.nodeCount} node(s) across ${r.stories.length} stor${r.stories.length === 1 ? 'y' : 'ies'}`);
  console.log(`     ${r.description}`);
  console.log(`     ${r.helpUrl}`);
  console.log(`     affected: ${r.stories.slice(0, 5).join(', ')}${r.stories.length > 5 ? ' …+' + (r.stories.length - 5) + ' more' : ''}`);
}
if (errored.length) {
  console.log('\n=== ERRORS ===');
  for (const e of errored.slice(0, 10)) console.log(' ', e.id, '->', e.error);
}
