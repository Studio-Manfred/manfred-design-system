#!/usr/bin/env node
// Asserts that the bundled library entry points lead with the
// "use client" directive — the Next 16 / React Server Components
// contract. Regression guard for STU-169.
//
// Run as a postbuild step locally and a build-then-verify step in CI.

import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIST_ROOT = resolve(__dirname, '..', 'dist');

export const TARGETS = ['index.mjs', 'index.cjs'];
const DIRECTIVE_DOUBLE = '"use client";';
const DIRECTIVE_SINGLE = "'use client';";

/**
 * The trimmed first line of a bundle — what the directive check inspects.
 * @param {string} source
 * @returns {string}
 */
export function firstLineOf(source) {
  return source.split('\n', 1)[0].trim();
}

/**
 * True when the source's first line starts with `"use client";` or
 * `'use client';`. Anything before it on line 1 (other than whitespace/BOM,
 * which `trim()` removes) or on an earlier line fails the check.
 * @param {string} source
 * @returns {boolean}
 */
export function hasUseClientDirective(source) {
  const firstLine = firstLineOf(source);
  return firstLine.startsWith(DIRECTIVE_DOUBLE) || firstLine.startsWith(DIRECTIVE_SINGLE);
}

/**
 * Check every target under `distRoot`, logging one line per target.
 * @param {{distRoot?: string, targets?: string[], log?: (msg: string) => void, error?: (msg: string) => void}} [options]
 * @returns {Promise<number>} number of failed targets
 */
export async function main({
  distRoot = DEFAULT_DIST_ROOT,
  targets = TARGETS,
  log = console.log,
  error = console.error,
} = {}) {
  let failures = 0;

  for (const file of targets) {
    const path = resolve(distRoot, file);
    let head;
    try {
      head = await readFile(path, 'utf8');
    } catch (err) {
      error(`✗ ${file}: cannot read (${err.code ?? err.message}). Run \`npm run build\` first.`);
      failures += 1;
      continue;
    }

    if (!hasUseClientDirective(head)) {
      const firstLine = firstLineOf(head);
      error(`✗ dist/${file} — first line does not start with "use client";`);
      error(`  got: ${firstLine.slice(0, 80)}${firstLine.length > 80 ? '…' : ''}`);
      failures += 1;
    } else {
      log(`✓ dist/${file} leads with "use client";`);
    }
  }

  if (failures > 0) {
    error(`\nverify-use-client-directive: ${failures} target(s) failed. Check vite.config.ts → rollupOptions.output.banner.`);
  }
  return failures;
}

const invokedDirectly = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (invokedDirectly) {
  const failures = await main();
  if (failures > 0) process.exit(1);
}
