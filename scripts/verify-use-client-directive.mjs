#!/usr/bin/env node
// Asserts that the bundled library entry points lead with the
// "use client" directive — the Next 16 / React Server Components
// contract. Regression guard for STU-169.
//
// Run as a postbuild step locally and a build-then-verify step in CI.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distRoot = resolve(__dirname, '..', 'dist');

const TARGETS = ['index.mjs', 'index.cjs'];
const DIRECTIVE_DOUBLE = '"use client";';
const DIRECTIVE_SINGLE = "'use client';";

let failures = 0;

for (const file of TARGETS) {
  const path = resolve(distRoot, file);
  let head;
  try {
    head = await readFile(path, 'utf8');
  } catch (err) {
    console.error(`✗ ${file}: cannot read (${err.code ?? err.message}). Run \`npm run build\` first.`);
    failures += 1;
    continue;
  }

  const firstLine = head.split('\n', 1)[0].trim();
  const leads = firstLine.startsWith(DIRECTIVE_DOUBLE) || firstLine.startsWith(DIRECTIVE_SINGLE);

  if (!leads) {
    console.error(`✗ dist/${file} — first line does not start with "use client";`);
    console.error(`  got: ${firstLine.slice(0, 80)}${firstLine.length > 80 ? '…' : ''}`);
    failures += 1;
  } else {
    console.log(`✓ dist/${file} leads with "use client";`);
  }
}

if (failures > 0) {
  console.error(`\nverify-use-client-directive: ${failures} target(s) failed. Check vite.config.ts → rollupOptions.output.banner.`);
  process.exit(1);
}
