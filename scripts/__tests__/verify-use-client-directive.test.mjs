import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hasUseClientDirective, firstLineOf, main, TARGETS } from '../verify-use-client-directive.mjs';

describe('hasUseClientDirective', () => {
  it('accepts a double-quoted directive on line 1', () => {
    expect(hasUseClientDirective('"use client";\nimport x from "y";')).toBe(true);
  });

  it('accepts a single-quoted directive on line 1', () => {
    expect(hasUseClientDirective("'use client';\nexport {};")).toBe(true);
  });

  it('accepts a directive followed by more code on the same line (minified bundle)', () => {
    expect(hasUseClientDirective('"use client";import{a}from"b";')).toBe(true);
  });

  it('accepts a directive preceded by a UTF-8 BOM or leading whitespace', () => {
    expect(hasUseClientDirective('﻿"use client";\n')).toBe(true);
    expect(hasUseClientDirective('   "use client";\n')).toBe(true);
  });

  it('accepts CRLF line endings', () => {
    expect(hasUseClientDirective('"use client";\r\nexport {};')).toBe(true);
  });

  it('rejects a bundle whose first line is a comment, even if the directive follows', () => {
    expect(hasUseClientDirective('/* license */\n"use client";\n')).toBe(false);
    expect(hasUseClientDirective('// banner\n"use client";\n')).toBe(false);
  });

  it('rejects a comment on the same line before the directive', () => {
    expect(hasUseClientDirective('/* x */ "use client";')).toBe(false);
  });

  it('rejects a bundle with no directive', () => {
    expect(hasUseClientDirective('import x from "y";\nexport default x;')).toBe(false);
    expect(hasUseClientDirective('')).toBe(false);
  });

  it('rejects a directive that only appears mid-file', () => {
    expect(hasUseClientDirective('import a from "a";\n"use client";\n')).toBe(false);
  });

  it('rejects near-misses: missing semicolon, other directive, backticks', () => {
    expect(hasUseClientDirective('"use client"\nexport {};')).toBe(false);
    expect(hasUseClientDirective('"use server";\n')).toBe(false);
    expect(hasUseClientDirective('`use client`;\n')).toBe(false);
  });
});

describe('firstLineOf', () => {
  it('returns the trimmed first line only', () => {
    expect(firstLineOf('  a b  \nsecond')).toBe('a b');
    expect(firstLineOf('')).toBe('');
  });
});

describe('main', () => {
  let dir;
  let logs;
  let errors;
  const run = () =>
    main({ distRoot: dir, log: (m) => logs.push(m), error: (m) => errors.push(m) });

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'verify-use-client-'));
    logs = [];
    errors = [];
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('checks both ESM and CJS entries by default', () => {
    expect(TARGETS).toEqual(['index.mjs', 'index.cjs']);
  });

  it('returns 0 failures and logs a tick per entry when both lead with the directive', async () => {
    writeFileSync(join(dir, 'index.mjs'), '"use client";\nexport {};\n');
    writeFileSync(join(dir, 'index.cjs'), "'use client';\nmodule.exports = {};\n");
    expect(await run()).toBe(0);
    expect(logs).toEqual([
      '✓ dist/index.mjs leads with "use client";',
      '✓ dist/index.cjs leads with "use client";',
    ]);
    expect(errors).toEqual([]);
  });

  it('counts a missing directive as a failure and shows the offending first line', async () => {
    writeFileSync(join(dir, 'index.mjs'), '"use client";\n');
    writeFileSync(join(dir, 'index.cjs'), '"use strict";\n');
    expect(await run()).toBe(1);
    expect(errors[0]).toBe('✗ dist/index.cjs — first line does not start with "use client";');
    expect(errors[1]).toBe('  got: "use strict";');
    expect(errors.at(-1)).toMatch(/1 target\(s\) failed\. Check vite\.config\.ts/);
  });

  it('truncates a long offending first line to 80 chars with an ellipsis', async () => {
    const long = 'x'.repeat(120);
    writeFileSync(join(dir, 'index.mjs'), `${long}\n`);
    writeFileSync(join(dir, 'index.cjs'), '"use client";\n');
    await run();
    expect(errors[1]).toBe(`  got: ${'x'.repeat(80)}…`);
  });

  it('counts unreadable entries as failures with a build hint', async () => {
    expect(await run()).toBe(2);
    expect(errors).toContain('✗ index.mjs: cannot read (ENOENT). Run `npm run build` first.');
    expect(errors).toContain('✗ index.cjs: cannot read (ENOENT). Run `npm run build` first.');
    expect(errors.at(-1)).toMatch(/2 target\(s\) failed/);
  });
});
